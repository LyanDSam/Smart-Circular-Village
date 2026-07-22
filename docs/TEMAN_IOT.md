# 🤖 Panduan Lengkap Firmware ESP32 — Smart Circular Village (SCV)

Dokumen ini khusus dibuat untuk **Tim / Developer Hardware & IoT ESP32** agar firmware mikrokontroler sinkron 100% dengan Cloud Backend & Website Dashboard SCV.

---

## 📢 UPDATE TERBARU FIRMWARE & HARDWARE (Catatan Pembaruan Sistem)

> **[PENTING] Pembaruan Integrasi Teranyar di Website Dashboard SCV:**
> 1. **Penamaan Tipe Perangkat Resmi**:
>    * **Smart Collection Station ** — Prefix Device ID: `SCV-COLL-xxx`
>    * **Smart Compost Bin** — Prefix Device ID: `SCV-COMP-xxx`
> 2. **Auto-Generate Device ID**: ID Perangkat kini secara otomatis digenerate berurutan (`SCV-COLL-001`, `SCV-COLL-002`, dst) saat didaftarkan di website.
> 3. **Fitur Sinyal Ping & Buzzer Hardware (`devices/{deviceId}/commands/ping`)**:
>    * Tombol **`[ 🔔 Ping ]`** di website kini akan menulis perintah ke node Realtime Database `devices/{deviceId}/commands/ping`.
>    * ESP32 disarankan mengecek node ini pada `loop()` untuk membunyikan **Buzzer / LED fisik** selama 3 detik.

---

## 📌 1. Kredensial & Parameter Perangkat (PENTING)

Gunakan parameter otentikasi berikut saat mengirim request dari ESP32:

| Parameter | Value untuk Pos Timbangan (`SCV-COLL-001`) |
| :--- | :--- |
| **Device ID** | `SCV-COLL-001` |
| **API Key** | `SCV_4b7190c12e8f43a9a1d2e3f4567890ab` |
| **Header Auth** | `Authorization: Bearer SCV_4b7190c12e8f43a9a1d2e3f4567890ab` |
| **Content Type**| `application/json` |

---

## 🌐 2. Base URL Server Endpoint

* **Cloud Production URL**:
  `https://us-central1-smart-circular-village.cloudfunctions.net/api/api/device`

* **Local Emulator URL (Testing)**:
  `http://<IP_LAPTOP_LOKAL>:5001/smart-circular-village/us-central1/api/api/device`

---

## ⚡ 3. Tiga Tugas Utama Firmware ESP32

Firmware ESP32 Pos Timbangan sampah menjalankan **3 Alur Utama**:

```
 ┌───────────────────────────────────────────────────────────────────┐
 │                            ESP32 LOOP                             │
 └──────┬──────────────────────────┬──────────────────────────┬──────┘
        │                          │                          │
        ▼ (Setiap 15-30 Detik)     ▼ (Tap RFID + Timbangan)   ▼ (RTDB Listener)
  [1. Kirim Heartbeat]       [2. Kirim Transaksi]       [3. Ping Buzzer]
             │                                │                       │
             ▼                                ▼                       ▼
  `POST /heartbeat`                `POST /pending-transaction`   RTDB Active Ping = True
             │                                │                       │
             ▼                                ▼                       ▼
   Website Status berubah ke        Popup Transaksi Konfirmasi      Buzzer Hardware ESP32
   🟢 ONLINE / TERHUBUNG            muncul di layar Petugas!        Berbunyi Selama 3 Detik!
```

---

## 📡 4. Spesifikasi Request Endpoint

### A. Endpoint 1: Kirim Heartbeat (`POST /heartbeat`)
> **Tujuan**: Agar indikator perangkat di website berubah menjadi **🟢 Online (Terhubung)**. Kirim fungsi ini secara berkala setiap 15–30 detik.

* **URL Complete**: `https://us-central1-smart-circular-village.cloudfunctions.net/api/api/device/heartbeat`
* **Header**:
  * `Authorization`: `Bearer SCV_4b7190c12e8f43a9a1d2e3f4567890ab`
  * `Content-Type`: `application/json`
* **Body JSON**:
  ```json
  {
    "deviceId": "SCV-COLL-001"
  }
  ```

---

### B. Endpoint 2: Kirim Transaksi Penimbangan (`POST /pending-transaction`)
> **Tujuan**: Mengirim hasil penimbangan sampah ketika kartu RFID di-tap dan berat timbangan Load Cell HX711 sudah stabil.

* **URL Complete**: `https://us-central1-smart-circular-village.cloudfunctions.net/api/api/device/pending-transaction`
* **Header**:
  * `Authorization`: `Bearer SCV_4b7190c12e8f43a9a1d2e3f4567890ab`
  * `Content-Type`: `application/json`
* **Body JSON**:
  ```json
  {
    "deviceId": "SCV-COLL-001",
    "rfidUid": "01020304",
    "weightGram": 4520
  }
  ```

> **Aturan Data Payload**:
> 1. `rfidUid`: Format **String Hex 8–10 karakter** tanpa spasi (contoh: `"01020304"` atau `"8A3F1C90"`).
> 2. `weightGram`: Format **Angka Bulat (Integer)** dalam satuan **Gram** (contoh: `4520` untuk 4.52 kg).

---

## 🔔 5. Fitur Sinyal Ping & Listener Buzzer Hardware

Saat Admin / Officer mengklik tombol **`[ 🔔 Ping ]`** di Website Dashboard SCV, Realtime Database menuliskan perintah ke node:
`devices/{deviceId}/commands/ping`

### Struktur Data RTDB (`devices/SCV-COLL-001/commands/ping`):
```json
{
  "active": true,
  "durationSeconds": 3,
  "requestedBy": "Admin Khanda",
  "timestamp": 1784705168
}
```

### Contoh Potongan Kode Arduino C++ (ESP32 Buzzer Listener):
```cpp
const int BUZZER_PIN = 12; // Pin Buzzer / LED indikator

// Dipanggil di void loop() untuk mendeteksi sinyal Ping dari Website
void checkPingCommand() {
  if (Firebase.ready() && Firebase.RTDB.getBool(&fbdo, "devices/SCV-COLL-001/commands/ping/active")) {
    if (fbdo.boolData() == true) {
      Serial.println("🔔 Sinyal Ping Diterima dari Website! Bunyikan Buzzer...");
      
      // Bunyikan Buzzer / Nyalakan LED selama 3 detik
      digitalWrite(BUZZER_PIN, HIGH);
      delay(3000);
      digitalWrite(BUZZER_PIN, LOW);

      // Reset status ping active menjadi false kembali di RTDB
      Firebase.RTDB.setBool(&fbdo, "devices/SCV-COLL-001/commands/ping/active", false);
    }
  }
}
```

---

## 💻 6. Contoh Kode C++ / Arduino ESP32 Siap Pakai (Lengkap)

Berikut adalah potongan kode C++ (Arduino IDE) lengkap yang siap digunakan pada ESP32:

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// 1. Konfigurasi WiFi
const char* ssid = "NAMA_WIFI_ANDA";
const char* password = "PASSWORD_WIFI_ANDA";

// 2. Konfigurasi Kredensial Perangkat SCV
const char* deviceId = "SCV-COLL-001";
const char* apiKey = "SCV_4b7190c12e8f43a9a1d2e3f4567890ab";
const char* baseUrl = "https://us-central1-smart-circular-village.cloudfunctions.net/api/api/device";

// Timer untuk Heartbeat (Setiap 20 Detik)
unsigned long lastHeartbeatTime = 0;
const unsigned long heartbeatInterval = 20000;

void setup() {
  Serial.begin(115200);
  
  // Hubungkan ke WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi Connected!");
}

// -------------------------------------------------------------
// FUNGSI 1: Kirim Heartbeat (Indikator Terhubung ke Website)
// -------------------------------------------------------------
void sendHeartbeat() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = String(baseUrl) + "/heartbeat";
    http.begin(url);
    
    // Set Headers
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Authorization", "Bearer " + String(apiKey));
    
    // Payload Body JSON
    StaticJsonDocument<128> doc;
    doc["deviceId"] = deviceId;
    String requestBody;
    serializeJson(doc, requestBody);
    
    int httpResponseCode = http.POST(requestBody);
    
    if (httpResponseCode > 0) {
      Serial.printf("🟢 Heartbeat Response: %d\n", httpResponseCode);
    } else {
      Serial.printf("❌ Heartbeat Failed, Error: %s\n", http.errorToString(httpResponseCode).c_str());
    }
    http.end();
  }
}

// -------------------------------------------------------------
// FUNGSI 2: Kirim Transaksi Penimbangan (Saat RFID di-Tap)
// -------------------------------------------------------------
void sendPendingTransaction(String rfidUid, int weightGram) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String url = String(baseUrl) + "/pending-transaction";
    http.begin(url);
    
    // Set Headers
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Authorization", "Bearer " + String(apiKey));
    
    // Payload Body JSON
    StaticJsonDocument<256> doc;
    doc["deviceId"] = deviceId;
    doc["rfidUid"] = rfidUid;
    doc["weightGram"] = weightGram;
    
    String requestBody;
    serializeJson(doc, requestBody);
    
    int httpResponseCode = http.POST(requestBody);
    
    if (httpResponseCode == 200 || httpResponseCode == 201) {
      Serial.println("✅ Transaksi Timbangan Berhasil Terkirim ke Website!");
    } else {
      Serial.printf("❌ Gagal Kirim Transaksi, HTTP Code: %d\n", httpResponseCode);
    }
    http.end();
  }
}

void loop() {
  // 1. Eksekusi Heartbeat berkala setiap 20 detik
  if (millis() - lastHeartbeatTime >= heartbeatInterval) {
    sendHeartbeat();
    lastHeartbeatTime = millis();
  }
  
  // 2. SIMULASI: Panggil fungsi ini ketika RFID di-tap & Load cell stabil
  // Contoh: sendPendingTransaction("01020304", 4520);
}
```

---

## 🧪 7. Cara Pengujian (Testing)

1. Jalankan ESP32 dan amati Serial Monitor.
2. Buka Halaman Perangkat (`/devices`) di Website SCV:
   * Status perangkat **`SCV-COLL-001`** akan berubah menjadi **🟢 Online** dalam kurun waktu 20 detik setelah ESP32 mengirim `sendHeartbeat()`.
3. Uji Sinyal Ping Buzzer:
   * Klik tombol **`[ 🔔 Ping ]`** pada kartu atau tabel perangkat di website. Sinyal ping dikirim ke RTDB dan Buzzer fisik pada ESP32 akan berbunyi selama 3 detik.
4. Tempelkan kartu RFID pada pembaca RFID ESP32:
   * ESP32 memanggil `sendPendingTransaction("01020304", 4520)`.
   * **Popup Modal Konfirmasi Setoran** akan langsung terbuka secara otomatis di layar Laptop/Tablet Petugas!

---

## ⏰ 8. Standar Sinkronisasi Waktu Timestamp (NTP Sync — Solusi 1)

Untuk memastikan timestamp konsisten dan portable across all backend endpoints:

- **Alur NTP Sync ESP32**:
  1. Setelah `wifiConnect()`, panggil `configTime(0, 0, "pool.ntp.org", "time.nist.gov");`.
  2. Tunggu sampai `time(nullptr)` menghasilkan Unix Epoch timestamp yang valid (`> 1600000000`).
  3. Simpan flag bahwa NTP time telah tersinkronisasi.
  4. Seluruh payload timestamp yang dikirim firmware (`heartbeat`, `pending_transactions`, `telemetry`, `log`) menggunakan Unix Epoch integer detik:
     `lastSeen = time(nullptr)`
- **Fallback Rule**:
  Jika sinkronisasi NTP belum/gagal terhubung (misal port NTP diblokir), firmware tetap berjalan menggunakan uptime `millis() / 1000` atau timestamp fallback, dan secara otomatis mencoba resync NTP di background.

