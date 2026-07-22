# 🍃 Smart Circular Village (SCV) — Dokumentasi Sistem & Arsitektur Proyek

**Versi Dokumen:** `v4.0.0`  
**Status:** Dokumentasi Resmi Sistem (Terintegrasi Hardware ESP32 & Dual Database Firebase)  
**Last Updated:** July 2026  
**Repositori Git:** `https://github.com/LyanDSam/Smart-Circular-Village.git`  

---

## 📋 1. Ringkasan Eksekutif (Executive Summary)

**Smart Circular Village (SCV)** adalah platform web berbasis *Internet of Things* (IoT) dan Cloud yang dirancang untuk mendigitalisasi, mengotomatisasi, dan mengoptimalkan pengelolaan sampah organik maupun anorganik di tingkat desa/komunitas secara *end-to-end*.

Sistem SCV mengintegrasikan dua sub-sistem utama:
1. **Bank Sampah Digital (Smart Collection Station)**: Otomatisasi penimbangan sampah menggunakan sensor *Load Cell (HX711)* dan identifikasi warga penyetor via kartu fisik RFID (*MFRC522*) dengan sistem imbalan poin (*Reward Points*).
2. **Bak Kompos Pintar (Smart Compost Bin Monitoring System)**: Pemantauan telemetri live (Suhu Kompos, Kelembaban Tanah, Gas Metana, Air Lindi) dan kendali aktuator relay (*Kipas Aerasi & Pompa Irigasi*) via mikrokontroler ESP32.

---

## 🏗️ 2. Arsitektur Dual Database & Cloud Middleware

Sistem SCV menerapkan **Dual Database Architecture** berbasis Firebase untuk memisahkan antara data bisnis persisten dan state IoT transient berkecepatan tinggi.

```
                  ┌─────────────────────────────────────────┐
                  │          ESP32 Mikrokontroler           │
                  └────────────────────┬────────────────────┘
                                       │ (REST API / Bearer API Key)
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │    Firebase Cloud Functions (Node.js)    │
                  └───────┬─────────────────────────┬───────┘
                          │                         │
                          ▼                         ▼
┌───────────────────────────────────┐    ┌───────────────────────────────────┐
│   Firebase Realtime Database      │    │         Cloud Firestore           │
│              (RTDB)               │    │       (Persistent Database)       │
├───────────────────────────────────┤    ├───────────────────────────────────┤
│ • /pending_transactions           │    │ • users (Data Warga & Poin)       │
│ • /devices/{deviceId}/telemetry   │    │ • transactions (Audit Transaksi)  │
│ • /devices/{deviceId}/lastSeen    │    │ • devices (Metadata Perangkat)    │
│ • /devices/{deviceId}/relay       │    │ • rewards & reward_redemptions    │
└─────────────────┬─────────────────┘    │ • audit_logs (Riwayat RFID)       │
                  │                      └─────────────────┬─────────────────┘
                  │ (WebSocket onValue)                    │ (Indexed Queries)
                  └────────────────────┬───────────────────┘
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │      Website App React (Frontend)       │
                  └─────────────────────────────────────────┘
```

### Roles & Database Matrix
* **Cloud Firestore**: Menyimpan data yang membutuhkan audit, keamanan ketat, indeks pencarian terstruktur, dan persistensi jangka panjang (`users`, `transactions`, `devices`, `rewards`, `reward_redemptions`, `settings`, `audit_logs`).
* **Firebase Realtime Database (RTDB)**: Menyimpan state live perangkat IoT yang diperbarui secara kontinu dalam hitungan detik (`devices/{deviceId}/telemetry`, `devices/{deviceId}/lastSeen`, `pending_transactions`).
* **Firebase Cloud Functions (`/api/device/*`)**: Middleware REST API berbasis Express & Zod validator untuk otentikasi aman ESP32 menggunakan *Bearer API Key*.

---

## 👥 3. Hak Akses & Role Management (RBAC)

Sistem membagi pengguna ke dalam 4 peranan (*roles*):

| Role | Kode | Hak Akses Utama |
| :--- | :--- | :--- |
| **Super Admin** | `admin` | Akses penuh ke seluruh fitur sistem, Manajemen Perangkat IoT, Manajemen Petugas, Verifikasi Warga Pending, Konfigurasi Poin & Parameter. |
| **Petugas Station** | `officer` | Mengonfirmasi transaksi penimbangan RFID realtime, penautan kartu Unknown RFID, verifikasi warga lokal, dan penukaran reward warga. |
| **Warga Penyetor** | `citizen` | Melihat saldo poin, Kartu QR Digital Warga, Riwayat Setoran Sampah Pribadi, dan Katalog Penukaran Reward. |
| **Pemerintah Desa**| `government` | Akses *read-only* ke Laporan Analitis Dampak Lingkungan, statistik tonase sampah desa, dan audit poin terbit. |

---

## 🔄 4. Modul Utamanya & Workflow Sistem

### A. Workflow Transaksi Setoran Sampah Realtime

$$\text{Tap Kartu RFID} \longrightarrow \text{ESP32} \longrightarrow \text{RTDB pending\_transactions} \longrightarrow \text{React Realtime Listener} \longrightarrow \text{Confirm Modal} \longrightarrow \text{Firestore writeBatch}$$

1. **Tap Kartu RFID & Penimbangan**: Warga menempelkan kartu RFID di pos pengumpulan. ESP32 membaca UID dan berat timbangan gram, lalu mengirim payload ke Cloud Functions `/api/device/pending-transaction`.
2. **Push ke RTDB**: Data masuk ke node RTDB `/pending_transactions/{txId}` dengan status `"waiting_confirmation"`.
3. **Listener Realtime React**: Halaman Transaksi/Dashboard mendengarkan node via WebSocket `onValue`.
4. **Pencarian Warga Terindeks**: Sistem mencari warga secara instan via query Firestore `where("rfidUid", "==", cleanRfid)`.
5. **Alur Unknown RFID Resolution**:
   * Jika RFID **belum terdaftar**, popup **Unknown RFID Dialog** akan muncul.
   * Petugas dapat memilih:
     * **Link RFID ke Warga**: Mencari warga terdaftar (via Member ID/Nama/No HP), menautkan `rfidUid`, mencatat riwayat ke Firestore `audit_logs`, lalu membuka kembali modal konfirmasi normal.
     * **Scan Lagi**: Menutup popup tanpa mengubah queue RTDB.
     * **Batalkan Transaksi**: Mengubah status RTDB ke `"cancelled"` dengan alasan `"Unknown RFID"`, lalu menghapus dari queue.
6. **Eksekusi Atomik (`writeBatch`)**:
   * Mengunci status di RTDB dari `waiting_confirmation` $\rightarrow$ `processing` (*Pessimistic Lock*).
   * Menulis dokumen transaksi baru di Firestore `transactions/{txId}`.
   * Menambah saldo poin warga (`users.points += pointEarned`) dan total sampah (`users.totalWasteGram += weightGram`) secara atomik.
   * Menghapus entry dari RTDB `/pending_transactions/{txId}`.

---

### B. Rumus Perhitungan Poin Sampah (`pointService.js`)

| Kategori Sampah | Poin Terbit / 100 Gram | Poin / 1 Kg | Contoh (2.5 Kg) |
| :--- | :---: | :---: | :---: |
| **Organic** (Sisa Makanan, Daun) | 1 Pts | 10 Pts | +25 Pts |
| **Plastic** (Botol, Gelas, Kemasan) | 2 Pts | 20 Pts | +50 Pts |
| **Paper** (Kertas, Kardus, Koran) | 1 Pts | 10 Pts | +25 Pts |
| **Glass** (Kaca, Botol Kaca) | 2 Pts | 20 Pts | +50 Pts |
| **Metal** (Logam, Besi, Kaleng) | 5 Pts | 50 Pts | +125 Pts |
| **Other / Residu** | 0 Pts | 0 Pts | 0 Pts |

---

### C. Monitoring Telemetri Kompos Pintar & Aktuator

* **Sensor Telemetri Live**: Suhu Kompos (°C), Suhu Udara (°C), Kelembaban Udara (%), Kelembaban Tanah (%), Kadar Gas Metana (PPM), dan Status Air Lindi (*Normal/Overflow*).
* **Kendali Aktuator Relay**: Toggle manual/otomatis untuk **Kipas Aerasi** (*Aeration Fan*) dan **Pompa Irigasi** (*Irrigation Pump*) yang langsung menyinkronkan state ke RTDB `/devices/{deviceId}/relay`.

---

## 🛠️ 5. Teknologi yang Digunakan (Tech Stack)

### Frontend (Website Dashboard)
* **Framework**: React.js (Vite)
* **Styling**: Tailwind CSS & Vanilla Custom CSS Tokens
* **Iconography**: Lucide React
* **Data Visualization**: Recharts (Grafik Tren Sampah & Telemetri Kompos)
* **Components UI**: Pattern kustom Shadcn UI (Badge, Card, Modal Dialog, Toast Alerts)

### Backend Cloud & Middleware
* **Cloud Platform**: Firebase Cloud Functions (Node.js 18 Runtime)
* **API Framework**: Express.js Router
* **Data Validation**: Zod Schemas (`deviceApiSchemas.js`)

### Database Layer
* **Persistent DB**: Cloud Firestore
* **Live IoT Queue DB**: Firebase Realtime Database (RTDB)

### Hardware Sub-system (ESP32 Firmware Integration)
* **Microcontroller**: ESP32 DevKit V1
* **Sensors**: RFID MFRC522, Load Cell + HX711 Amplifier, DS18B20 Waterproof Temp, MQ-4 Methane Gas.
* **Actuators**: 2-Channel Relay Module (Fan & Water Pump).

---

## 📁 6. Struktur Direktori Proyek

```text
Smart-Circular-Village/
├── docs/                             # Dokumentasi Arsitektur & API Specification
│   ├── PROJECT_CONTEXT.md            # Dokumentasi Konteks Sistem v4.0.0
│   ├── ESP32_API_SPECIFICATION.md    # Panduan REST API ESP32
│   └── SYSTEM_DOCUMENTATION.md       # Dokumentasi Lengkap Sistem SCV
├── functions/                        # Firebase Cloud Functions (Backend REST API)
│   ├── src/
│   │   ├── config/firebase.js        # Admin SDK Singleton
│   │   ├── middleware/               # Auth (Bearer API Key) & Validation Middleware
│   │   ├── routes/deviceRoutes.js    # Express Router /api/device/*
│   │   ├── schemas/                  # Zod Payload Schemas
│   │   └── services/deviceApiService.js # IoT Service RTDB Processor
│   └── package.json
├── scripts/
│   └── inspectDatabase.js            # Script Inspeksi Live Database (npm run db:inspect)
├── src/                              # Source Code React Frontend
│   ├── components/                   # UI Reusable Components (MetricCard, Table, Modal)
│   ├── features/
│   │   ├── auth/                     # Autentikasi & Context
│   │   ├── dashboard/                # Role-Based Dashboards (Admin, Officer, Citizen)
│   │   ├── devices/                  # IoT Device Management
│   │   ├── transactions/             # Waste Transaction Module & Unknown RFID Modals
│   │   └── users/                    # User & Verification Management
│   ├── firebase/                     # Initializer Client SDK (Firestore & RTDB)
│   ├── hooks/                        # Custom Hooks (useAuth, usePendingTransactions, dll)
│   ├── pages/                        # Page Routing Hubs
│   ├── routes/                       # AppRoutes, ProtectedRoute, RoleRoute
│   └── services/                     # Business Logic Services
│       ├── deviceService.js          # Live Firestore Devices
│       ├── pointService.js           # Engine Kalkulasi Poin
│       ├── rewardService.js          # Katalog & Redemptions Firestore
│       ├── rtdbService.js            # WebSocket Listener RTDB
│       ├── transactionService.js     # Atomic writeBatch Transaction
│       └── userService.js            # Indexed Firestore User Queries & Audit Trail
├── firestore.rules                   # Keamanan Akses Firestore
├── firebase.json                     # Konfigurasi Emulator & Cloud Deploy
└── package.json
```
