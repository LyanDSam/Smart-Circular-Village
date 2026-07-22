import React, { useState } from 'react';
import { DeviceStatusBadge } from './DeviceStatusBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Sprout,
  Scale,
  MapPin,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  Radio,
  Bell,
} from 'lucide-react';

export const DeviceDetailModal = ({ isOpen = false, onClose, device = null, onPing }) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !device) return null;

  const isCompost = (device.deviceType || device.type) === 'compost';
  const Icon = isCompost ? Sprout : Scale;

  const handleCopyKey = () => {
    if (device.apiKey) {
      navigator.clipboard.writeText(device.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const maskApiKey = (key) => {
    if (!key) return '••••••••••••••••••••••••';
    return `${key.substring(0, 7)}••••••••••••••••••••${key.substring(key.length - 4)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2.5 rounded-xl ${
                isCompost
                  ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                  : 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                {device.name}
              </h3>
              <p className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                {device.deviceId}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <DeviceStatusBadge status={device.status} />
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Top Quick Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-slate-400 block mb-0.5">Tipe Perangkat</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {isCompost ? 'Smart Compost Bin' : 'Smart Collection Station '}
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-slate-400 block mb-0.5">Versi Firmware</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                v{device.firmwareVersion || '1.0.0'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-slate-400 block mb-0.5">Tanggal Registrasi</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {device.createdAt ? new Date(device.createdAt).toLocaleDateString('id-ID') : 'N/A'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-slate-400 block mb-0.5">Terakhir Seen</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {device.lastSeen ? new Date(device.lastSeen).toLocaleTimeString() : 'Standby'}
              </span>
            </div>
          </div>

          {/* Location Info */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Lokasi Pemasangan Hardware (Cloud Firestore)</span>
            </div>
            <div className="pl-6 space-y-1 text-slate-600 dark:text-slate-300">
              <p><strong>Desa/Kelurahan:</strong> {device.location?.village || 'Desa Circular Utama'}</p>
              <p><strong>Alamat Pos:</strong> {device.location?.address || 'Belum diisi'}</p>
              {device.location?.latitude && device.location?.longitude && (
                <p className="font-mono text-[11px] text-slate-400">
                  GPS: {device.location.latitude}, {device.location.longitude}
                </p>
              )}
            </div>
          </div>

          {/* Secure API Key Box */}
          <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Key className="w-4 h-4" />
                API Key Otentikasi ESP32 (Otentikasi Device)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="text-slate-400 hover:text-white transition-colors"
                  title={showApiKey ? 'Sembunyikan' : 'Tampilkan'}
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyKey}
                  className="h-7 px-2 text-xs border-slate-700 text-slate-200 hover:bg-slate-800"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  {copied ? 'Tersalin' : 'Salin Key'}
                </Button>
              </div>
            </div>
            <div className="font-mono text-sm font-bold text-emerald-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800 tracking-wider overflow-x-auto">
              {showApiKey ? device.apiKey : maskApiKey(device.apiKey)}
            </div>
            <p className="text-[11px] text-slate-400">
              Setiap ESP32 hanya menyimpan <code>DEVICE_ID</code> &amp; <code>API_KEY</code> ini. Data lokasi dan nama dimuat langsung dari Cloud Firestore.
            </p>
          </div>

          {/* Realtime Telemetry Architecture Specs */}
          <div className="p-4 bg-slate-50/80 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
                <Radio className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Struktur Telemetry Realtime Database (RTDB)</span>
              </div>
              <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300">
                Path: /devices/{device.deviceId}/
              </Badge>
            </div>

            {isCompost ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">Suhu Kompos</span>
                  <span className="text-slate-500 font-mono">compostTemperature</span>
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">Suhu &amp; Kelembaban Udara</span>
                  <span className="text-slate-500 font-mono">airTemperature, airHumidity</span>
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">Kadar Gas Metana</span>
                  <span className="text-slate-500 font-mono">gas</span>
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">Kelembaban Tanah</span>
                  <span className="text-slate-500 font-mono">soilMoisture</span>
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">Air Lindi (Leachate)</span>
                  <span className="text-slate-500 font-mono">waterLevel</span>
                </div>
                <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">Status Relay</span>
                  <span className="text-slate-500 font-mono">relay (fan, pump, mode)</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">Heartbeat Signal</span>
                  <span className="text-slate-500 font-mono">lastSeen (Unix timestamp)</span>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">Antrean Transaksi</span>
                  <span className="text-slate-500 font-mono">pending_transactions</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPing && onPing(device)}
            className="text-xs font-bold h-9 border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 gap-1.5"
          >
            <Bell className="w-4 h-4" />
            <span>Ping Hardware (Buzzer)</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={onClose}
            className="text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white"
          >
            Tutup Detail
          </Button>
        </div>
      </div>
    </div>
  );
};
