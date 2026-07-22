import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DeviceStatusBadge } from './DeviceStatusBadge';
import {
  Sprout,
  Scale,
  MapPin,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  MoreVertical,
  Edit2,
  RefreshCw,
  Power,
  Trash2,
  ExternalLink,
} from 'lucide-react';

export const DeviceCard = ({
  device,
  canManage = false,
  onViewDetail,
  onEdit,
  onRegenerateKey,
  onToggleActive,
  onDelete,
}) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isCompost = (device.deviceType || device.type) === 'compost';
  const Icon = isCompost ? Sprout : Scale;

  const maskApiKey = (key) => {
    if (!key) return '••••••••••••••••••••••••';
    return `${key.substring(0, 7)}••••••••••••••••••••${key.substring(key.length - 4)}`;
  };

  const handleCopyKey = () => {
    if (device.apiKey) {
      navigator.clipboard.writeText(device.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 relative overflow-hidden flex flex-col justify-between">
      {/* Header Accent Bar */}
      <div
        className={`h-1.5 w-full ${
          isCompost
            ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
            : 'bg-gradient-to-r from-blue-500 to-indigo-500'
        }`}
      />

      <CardContent className="p-5 space-y-4 flex-1">
        {/* Top Info Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            <div
              className={`p-3 rounded-2xl shrink-0 ${
                isCompost
                  ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                  : 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
              }`}
            >
              <Icon className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                {isCompost ? 'Smart Compost Bin' : 'Smart Collection Station'}
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                {device.name}
              </h3>
              <p className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                {device.deviceId}
              </p>
            </div>
          </div>

          <DeviceStatusBadge status={device.status} />
        </div>

        {/* Location & Firmware Info */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2">
              {device.location?.address
                ? `${device.location.address}, ${device.location.village || ''}`
                : device.location?.village || 'Lokasi Belum Diatur'}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 pt-1">
            <span>Firmware: <strong className="font-mono text-slate-700 dark:text-slate-200">v{device.firmwareVersion || '1.0.0'}</strong></span>
            <span className="text-[11px]">
              Last Seen: {device.lastSeen ? new Date(device.lastSeen).toLocaleTimeString() : 'Belum aktif'}
            </span>
          </div>
        </div>

        {/* API Key Box */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-amber-500" />
              API Key (ESP32 Auth)
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="hover:text-slate-900 dark:hover:text-slate-100"
                title={showApiKey ? 'Sembunyikan Key' : 'Tampilkan Key'}
              >
                {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleCopyKey}
                className="hover:text-emerald-600 dark:hover:text-emerald-400 ml-1"
                title="Salin API Key"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          <div className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wider truncate">
            {showApiKey ? device.apiKey : maskApiKey(device.apiKey)}
          </div>
        </div>
      </CardContent>

      {/* Action Footer */}
      <div className="p-3 bg-slate-50/60 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetail(device)}
          className="w-full text-xs font-semibold h-8 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Detail Perangkat
        </Button>

        {canManage && (
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMenuOpen(!menuOpen)}
              className="h-8 w-8 p-0 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 bottom-full mb-1 z-20 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 py-1 text-xs">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(device);
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-blue-500" /> Edit Metadata
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onRegenerateKey(device);
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-500" /> Regenerasi API Key
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onToggleActive(device);
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Power className="w-3.5 h-3.5 text-purple-500" />
                    {device.isActive ? 'Nonaktifkan Perangkat' : 'Aktifkan Perangkat'}
                  </button>
                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(device);
                    }}
                    className="w-full text-left px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 font-medium"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Hapus Perangkat
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
