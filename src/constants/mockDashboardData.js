/**
 * Placeholder Data for Sprint 3.2 Role Dashboards
 * (Until Sprint 5 & 6 APIs/Firestore integration are ready)
 */

export const MOCK_TRANSACTIONS = [
  {
    id: 'TX-2026-001',
    memberName: 'Budi Santoso',
    memberId: 'SCV-26-000101',
    category: 'Organik',
    weightKg: 4.5,
    pointsEarned: 450,
    timestamp: '2026-07-22 09:30',
    status: 'completed',
    officerName: 'Agus Petugas',
  },
  {
    id: 'TX-2026-002',
    memberName: 'Siti Rahma',
    memberId: 'SCV-26-000102',
    category: 'Anorganik (Plastik)',
    weightKg: 2.1,
    pointsEarned: 315,
    timestamp: '2026-07-22 10:15',
    status: 'completed',
    officerName: 'Agus Petugas',
  },
  {
    id: 'TX-2026-003',
    memberName: 'Dewi Lestari',
    memberId: 'SCV-26-000104',
    category: 'Anorganik (Kertas)',
    weightKg: 3.8,
    pointsEarned: 380,
    timestamp: '2026-07-22 11:00',
    status: 'completed',
    officerName: 'Agus Petugas',
  },
  {
    id: 'TX-2026-004',
    memberName: 'Ahmad Dahlan',
    memberId: 'SCV-26-000105',
    category: 'Organik',
    weightKg: 6.0,
    pointsEarned: 600,
    timestamp: '2026-07-21 16:45',
    status: 'completed',
    officerName: 'Agus Petugas',
  },
];

export const MOCK_CITIZEN_TRANSACTIONS = [
  {
    id: 'TX-2026-001',
    category: 'Organik',
    weightKg: 4.5,
    pointsEarned: 450,
    timestamp: '2026-07-22 09:30',
    status: 'completed',
  },
  {
    id: 'TX-2026-015',
    category: 'Anorganik (Kardus)',
    weightKg: 3.2,
    pointsEarned: 480,
    timestamp: '2026-07-18 14:20',
    status: 'completed',
  },
  {
    id: 'TX-2026-028',
    category: 'Organik',
    weightKg: 5.0,
    pointsEarned: 500,
    timestamp: '2026-07-12 10:05',
    status: 'completed',
  },
];

export const MOCK_REWARDS_PREVIEW = [
  {
    id: 'RWD-001',
    name: 'Voucher Sembako Rp 25.000',
    pointsCost: 2500,
    stock: 15,
    category: 'Voucher',
  },
  {
    id: 'RWD-002',
    name: 'Kompos Organik Super (5 kg)',
    pointsCost: 1000,
    stock: 40,
    category: 'Produk Desa',
  },
  {
    id: 'RWD-003',
    name: 'Minyak Goreng Kita 1 Liter',
    pointsCost: 1800,
    stock: 8,
    category: 'Sembako',
  },
];

export const MOCK_NOTIFICATIONS = [
  {
    id: 'NOTIF-01',
    title: 'Setoran Sampah Berhasil',
    message: 'Anda mendapatkan +450 poin dari setoran 4.5 kg Sampah Organik.',
    timestamp: '1 jam yang lalu',
    read: false,
    type: 'success',
  },
  {
    id: 'NOTIF-02',
    title: 'Akun Terverifikasi',
    message: 'Selamat! Akun warga dan kartu RFID Anda telah aktif.',
    timestamp: '2 hari yang lalu',
    read: true,
    type: 'info',
  },
  {
    id: 'NOTIF-03',
    title: 'Jadwal Penimbangan Sampah',
    message: 'Pos pengumpulan RT 03 buka setiap hari Sabtu jam 08:00 - 12:00 WIB.',
    timestamp: '3 hari yang lalu',
    read: true,
    type: 'system',
  },
];

export const MOCK_WASTE_SUMMARY = {
  todayOrganicKg: 10.5,
  todayInorganicKg: 5.9,
  monthlyTotalKg: 485.2,
  compostProducedKg: 210.0,
  activeParticipants: 128,
  todayTransactionsCount: 3,
  pendingVerifications: 4,
};

export const MOCK_COMPOST_SUMMARY = {
  totalBins: 4,
  activeBins: 3,
  avgTemperature: 48.5, // °C
  avgHumidity: 62.0, // %
  avgMethane: 120, // PPM
  leachateStatus: 'Normal',
};
