import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useClientSettings } from '@/context/ClientSettingsContext';
import { settingsService } from '@/services/settingsService';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard } from '@/components/common/SectionCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Settings,
  Sun,
  Moon,
  Monitor,
  Bell,
  CheckCircle,
  Volume2,
  VolumeX,
  RefreshCw,
  Save,
  Shield,
} from 'lucide-react';

export const SettingsPage = () => {
  const { role } = useAuth();
  const { settings, updateSettings, playChime, t } = useClientSettings();
  const [activeTab, setActiveTab] = useState('appearance');
  const [toastMessage, setToastMessage] = useState('');

  // Firestore System Settings (Admin view/edit)
  const [systemRules, setSystemRules] = useState({
    pointRules: { organic: 100, plastic: 150, paper: 120, metal: 200, glass: 180 },
    compostRules: { minTemperature: 40, maxTemperature: 65, minHumidity: 50, maxHumidity: 70 },
  });
  const [savingSystem, setSavingSystem] = useState(false);

  useEffect(() => {
    if (role === 'admin') {
      settingsService
        .getSettings()
        .then((res) => {
          if (res) setSystemRules(res);
        })
        .catch((err) => {
          console.error('Error fetching system settings:', err);
        });
    }
  }, [role]);

  const showToast = (msg) => {
    setToastMessage(msg);
    playChime();
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSaveSystemRules = async (e) => {
    e.preventDefault();
    setSavingSystem(true);
    try {
      await settingsService.updateSettings(systemRules);
      showToast('Parameter sistem berhasil disimpan di Firestore!');
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingSystem(false);
    }
  };

  const isAdmin = role === 'admin';

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <PageHeader
        title={t('settingsTitle')}
        description="Kelola preferensi tema tampilan, efektivitas tampilan, efek suara, serta parameter sistem."
        icon={Settings}
      />

      {/* Notification Toast */}
      {toastMessage && (
        <div className="p-3 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('appearance')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'appearance'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sun className="w-4 h-4" />
          <span>{t('appearanceTab')}</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'notifications'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>{t('notificationsTab')}</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab('system')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'system'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-300" />
            <span>{t('systemTab')} (Admin)</span>
          </button>
        )}
      </div>

      {/* ─── TAB 1: APPEARANCE & THEME ─── */}
      {activeTab === 'appearance' && (
        <div className="space-y-6">
          <SectionCard title={t('themeLabel')} description="Pilih mode warna antarmuka aplikasi. Tema langsung diterapkan secara real-time.">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
              {/* Light Mode */}
              <div
                onClick={() => {
                  updateSettings({ theme: 'light' });
                  showToast('Tema diubah ke Terang (Light)');
                }}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
                  settings.theme === 'light'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-md ring-2 ring-emerald-600/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="p-3 bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300 rounded-full">
                  <Sun className="w-6 h-6" />
                </div>
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{t('lightMode')}</span>
              </div>

              {/* Dark Mode */}
              <div
                onClick={() => {
                  updateSettings({ theme: 'dark' });
                  showToast('Tema diubah ke Gelap (Dark)');
                }}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
                  settings.theme === 'dark'
                    ? 'border-emerald-600 bg-slate-900 text-white shadow-md ring-2 ring-emerald-600/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="p-3 bg-indigo-900 text-indigo-200 rounded-full">
                  <Moon className="w-6 h-6" />
                </div>
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{t('darkMode')}</span>
              </div>

              {/* System Mode */}
              <div
                onClick={() => {
                  updateSettings({ theme: 'system' });
                  showToast('Tema disesuaikan dengan preferensi OS');
                }}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
                  settings.theme === 'system'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-md ring-2 ring-emerald-600/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="p-3 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-full">
                  <Monitor className="w-6 h-6" />
                </div>
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{t('systemMode')}</span>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Mode Kerapatan Layar" description="Atur jarak antar elemen antarmuka aplikasi.">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 pt-3">
              <div>
                <p className="font-bold text-xs text-slate-900 dark:text-slate-100">{t('compactModeLabel')}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('compactModeDesc')}</p>
              </div>
              <input
                type="checkbox"
                checked={settings.compactMode}
                onChange={(e) => {
                  updateSettings({ compactMode: e.target.checked });
                  showToast(e.target.checked ? 'Mode Compact diaktifkan' : 'Mode Normal diaktifkan');
                }}
                className="w-5 h-5 accent-emerald-600 cursor-pointer"
              />
            </div>
          </SectionCard>
        </div>
      )}

      {/* ─── TAB 2: NOTIFICATIONS & SOUND ─── */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <SectionCard title="Efek Suara & Alert" description="Atur nada konfirmasi suara dan pemberitahuan di browser.">
            <div className="space-y-3 pt-3">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 rounded-lg">
                    {settings.soundAlerts ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-bold text-xs text-slate-900 dark:text-slate-100">{t('soundLabel')}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('soundDesc')}</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.soundAlerts}
                  onChange={(e) => {
                    updateSettings({ soundAlerts: e.target.checked });
                    showToast(e.target.checked ? 'Suara notifikasi aktif' : 'Suara notifikasi dimatikan');
                  }}
                  className="w-5 h-5 accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Pembaruan Data IoT Live" description="Tentukan interval pembaruan otomatis sensor.">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
              {[10, 30, 60].map((sec) => (
                <div
                  key={sec}
                  onClick={() => {
                    updateSettings({ autoRefreshInterval: sec });
                    showToast(`Interval auto-refresh diset ke ${sec} detik`);
                  }}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all text-center space-y-1 ${
                    settings.autoRefreshInterval === sec
                      ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 font-bold'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'
                  }`}
                >
                  <RefreshCw className="w-5 h-5 mx-auto text-emerald-700 dark:text-emerald-400 mb-1" />
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{sec} Detik</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Auto refresh live feed</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {/* ─── TAB 3: SYSTEM PARAMETERS (ADMIN ONLY) ─── */}
      {activeTab === 'system' && isAdmin && (
        <Card className="border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-sm">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-emerald-200/60 dark:border-emerald-900/40 pb-3">
              <Shield className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Konfigurasi Aturan Poin & Sensor (Firestore)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Nilai aturan ini disimpan secara real-time di Firestore `settings/system`.</p>
              </div>
            </div>

            <form onSubmit={handleSaveSystemRules} className="space-y-6 text-xs">
              {/* Point Rules */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">Nilai Poin per Kg Sampah</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {Object.entries(systemRules.pointRules || {}).map(([key, val]) => (
                    <div key={key} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      <label className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] block mb-1">{key}</label>
                      <Input
                        type="number"
                        min={0}
                        value={val}
                        onChange={(e) =>
                          setSystemRules({
                            ...systemRules,
                            pointRules: { ...systemRules.pointRules, [key]: Number(e.target.value) },
                          })
                        }
                        className="bg-white dark:bg-slate-950 text-xs h-8 font-mono font-bold text-emerald-800 dark:text-emerald-400"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Compost Threshold Rules */}
              <div className="space-y-3 pt-4 border-t border-slate-200/60 dark:border-slate-800">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">Batas Threshold Smart Compost Bin</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <label className="font-semibold text-slate-600 dark:text-slate-400 text-[10px] block mb-1">Suhu Min (°C)</label>
                    <Input
                      type="number"
                      value={systemRules.compostRules?.minTemperature || 40}
                      onChange={(e) =>
                        setSystemRules({
                          ...systemRules,
                          compostRules: { ...systemRules.compostRules, minTemperature: Number(e.target.value) },
                        })
                      }
                      className="bg-white dark:bg-slate-950 text-xs h-8 font-mono font-bold"
                    />
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <label className="font-semibold text-slate-600 dark:text-slate-400 text-[10px] block mb-1">Suhu Maks (°C)</label>
                    <Input
                      type="number"
                      value={systemRules.compostRules?.maxTemperature || 65}
                      onChange={(e) =>
                        setSystemRules({
                          ...systemRules,
                          compostRules: { ...systemRules.compostRules, maxTemperature: Number(e.target.value) },
                        })
                      }
                      className="bg-white dark:bg-slate-950 text-xs h-8 font-mono font-bold"
                    />
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <label className="font-semibold text-slate-600 dark:text-slate-400 text-[10px] block mb-1">Kelembapan Min (%)</label>
                    <Input
                      type="number"
                      value={systemRules.compostRules?.minHumidity || 50}
                      onChange={(e) =>
                        setSystemRules({
                          ...systemRules,
                          compostRules: { ...systemRules.compostRules, minHumidity: Number(e.target.value) },
                        })
                      }
                      className="bg-white dark:bg-slate-950 text-xs h-8 font-mono font-bold"
                    />
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <label className="font-semibold text-slate-600 dark:text-slate-400 text-[10px] block mb-1">Kelembapan Maks (%)</label>
                    <Input
                      type="number"
                      value={systemRules.compostRules?.maxHumidity || 70}
                      onChange={(e) =>
                        setSystemRules({
                          ...systemRules,
                          compostRules: { ...systemRules.compostRules, maxHumidity: Number(e.target.value) },
                        })
                      }
                      className="bg-white dark:bg-slate-950 text-xs h-8 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={savingSystem} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 h-9">
                  <Save className="w-4 h-4" />
                  <span>{savingSystem ? 'Disimpan...' : 'Simpan Parameter Sistem'}</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
