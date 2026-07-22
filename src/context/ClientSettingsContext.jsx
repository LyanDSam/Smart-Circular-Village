import React, { createContext, useContext, useState, useLayoutEffect } from 'react';

const CLIENT_SETTINGS_KEY = 'scv_client_preferences';

const defaultPreferences = {
  theme: 'light', // 'light' | 'dark' | 'system'
  compactMode: false,
  soundAlerts: true,
  autoRefreshInterval: 30, // seconds
};

const ClientSettingsContext = createContext({
  settings: defaultPreferences,
  updateSettings: () => {},
  toggleTheme: () => {},
  playChime: () => {},
  t: (key) => key,
});

export const ClientSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(CLIENT_SETTINGS_KEY);
      return saved ? { ...defaultPreferences, ...JSON.parse(saved) } : defaultPreferences;
    } catch {
      return defaultPreferences;
    }
  });

  // Sound chime synthesizer using Web Audio API
  const playChime = () => {
    if (!settings.soundAlerts) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  };

  // Synchronize DOM elements before browser repaint
  useLayoutEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    let isDark = false;
    if (settings.theme === 'dark') {
      isDark = true;
    } else if (settings.theme === 'light') {
      isDark = false;
    } else if (settings.theme === 'system') {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    if (isDark) {
      root.classList.add('dark');
      if (body) body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      if (body) body.classList.remove('dark');
    }

    // Apply compact mode
    if (settings.compactMode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }

    // Save to localStorage
    try {
      localStorage.setItem(CLIENT_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, [settings]);

  const updateSettings = (newPartialSettings) => {
    setSettings((prev) => ({ ...prev, ...newPartialSettings }));
  };

  const toggleTheme = () => {
    setSettings((prev) => {
      const currentIsDark =
        prev.theme === 'dark' ||
        (prev.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      const nextTheme = currentIsDark ? 'light' : 'dark';
      return { ...prev, theme: nextTheme };
    });
  };

  // Standard Indonesian Dictionary
  const translations = {
    // Sidebar Navigation
    navDashboard: 'Dashboard',
    navMyPoints: 'Poin Saya',
    navDepositHistory: 'Riwayat Setoran',
    navRewards: 'Katalog Reward',
    navManageRewards: 'Kelola Reward',
    navMyRedemptions: 'Voucher Saya',
    navOfficerRedemptions: 'Verifikasi Reward',
    navProfile: 'Profil Saya',
    navNotifications: 'Notifikasi',
    navSettings: 'Pengaturan',
    navTransactions: 'Transaksi',
    navCollectionStation: 'Pos Pengumpulan',
    navPosts: 'Posko Pengumpulan',
    navCitizenVerification: 'Verifikasi Warga',
    navCitizens: 'Daftar Warga',
    navUsers: 'Manajemen Pengguna',
    navOfficers: 'Manajemen Petugas',
    navDevices: 'Perangkat IoT',
    navCompost: 'Kompos Pintar',
    navReports: 'Laporan',
    navStatistics: 'Statistik Desa',
    navSectionTitle: 'NAVIGASI',
    userAccess: 'Akses',

    // Settings Page
    settingsTitle: 'Pengaturan & Preferensi Tampilan',
    settingsDesc: 'Kelola preferensi tema, efektivitas tampilan, notifikasi, dan parameter sistem.',
    appearanceTab: 'Tampilan & Tema',
    notificationsTab: 'Notifikasi & Suara',
    systemTab: 'Konfigurasi Sistem',
    themeLabel: 'Tema Tampilan',
    lightMode: 'Terang (Light)',
    darkMode: 'Gelap (Dark)',
    systemMode: 'Ikuti Sistem OS',
    compactModeLabel: 'Tampilan Ringkas (Compact Mode)',
    compactModeDesc: 'Kurangi jarak elemen untuk menampilkan lebih banyak data di layar.',
    soundLabel: 'Efek Suara Alert',
    soundDesc: 'Bunyikan nada konfirmasi saat mengubah pengaturan atau bertransaksi.',
    autoRefreshLabel: 'Interval Auto-Refresh IoT',
    saveChanges: 'Simpan Perubahan',
    savedSuccess: 'Pengaturan berhasil diterapkan!',

    // Common Actions & Labels
    refresh: 'Refresh',
    search: 'Cari nama reward...',
    active: 'Aktif',
    inactive: 'Non-Aktif',
    pending: 'Pending',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    cancel: 'Batal',
    save: 'Simpan',
    edit: 'Edit',
    delete: 'Hapus',
    detail: 'Detail',
    logout: 'Keluar',
    allStatuses: 'Semua Status',

    // Rewards Module
    rewardsTitleAdmin: 'Kelola Sistem Hadiah (Reward Management)',
    rewardsTitleCitizen: 'Katalog Reward Bank Sampah',
    rewardsDescAdmin: 'Panel khusus Admin & Officer untuk menambah, mengubah, menghapus reward, dan memproses penukaran poin warga.',
    rewardsDescCitizen: 'Tukarkan poin reward sampah Anda dengan hadiah menarik dari Desa.',
    addReward: 'Tambah Reward Baru',
    editReward: 'Edit Item Reward',
    rewardName: 'Nama Reward',
    pointsRequired: 'Poin Dibutuhkan',
    stockAmount: 'Jumlah Stok',
    descriptionLabel: 'Deskripsi / Syarat',
    activeStatusLabel: 'Status Aktif (Dapat Dilihat & Ditukar Warga)',
    saveReward: 'Simpan Reward',
    saving: 'Menyimpan...',
    loadingRewardsData: 'Memuat katalog reward & data penukaran...',
    loadingOfficersData: 'Memuat data petugas...',
    noRewardsTitle: 'Belum Ada Item Reward',
    noRewardsDescAdmin: 'Klik tombol "Tambah Reward Baru" di atas untuk menambahkan item ke katalog.',
    noRewardsDescCitizen: 'Katalog reward saat ini masih kosong.',
    redemptionQueueTitle: 'Antrean Verifikasi Penukaran Warga',
    redemptionHistoryTitle: 'Riwayat Penukaran Saya',
    redemptionQueueDesc: 'Verifikasi, setujui, atau tolak permohonan penukaran poin warga.',
    redemptionHistoryDesc: 'Daftar penukaran reward yang pernah Anda ajukan.',
    noRedemptionsTitle: 'Belum Ada Penukaran',
    noRedemptionsDesc: 'Riwayat penukaran reward belum tersedia.',
    approve: 'Setujui',
    reject: 'Tolak',
    markCollected: 'Tandai Diambil',
    outOfStock: 'Stok Habis',
    insufficientPoints: 'Poin Tidak Cukup',
    redeemPoints: 'Tukarkan Poin',
    deactivate: 'Nonaktifkan',
    activate: 'Aktifkan',
    stockLabel: 'Stok',
    items: 'item',
    applicant: 'Pemohon',
    redemptionHistoryTab: 'Riwayat Penukaran',
    rewardCatalogTab: 'Katalog Reward',
  };

  const t = (key) => translations[key] || key;

  return (
    <ClientSettingsContext.Provider
      value={{
        settings,
        updateSettings,
        toggleTheme,
        playChime,
        t,
      }}
    >
      {children}
    </ClientSettingsContext.Provider>
  );
};

export const useClientSettings = () => useContext(ClientSettingsContext);
