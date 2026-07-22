import React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Cpu, Plus, Wifi, Sprout, Scale, LayoutGrid, Table, Clock } from 'lucide-react';

export const DeviceHeader = ({
  stats = {},
  canManage = false,
  viewMode = 'grid',
  onToggleViewMode,
  onOpenCreateModal,
}) => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Perangkat IoT (ESP32)"
        description="Kelola pendaftaran, lokasi, API Key, dan status operasional Smart Compost Bins & Station."
        icon={Cpu}
        actions={
          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 px-2.5 rounded-lg text-xs"
                onClick={() => onToggleViewMode('grid')}
                title="Tampilan Kartu"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 px-2.5 rounded-lg text-xs"
                onClick={() => onToggleViewMode('table')}
                title="Tampilan Tabel"
              >
                <Table className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Admin Register Button */}
            {canManage && (
              <Button
                onClick={onOpenCreateModal}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2 shadow-xs text-xs h-9"
              >
                <Plus className="w-4 h-4" />
                <span>Daftarkan Perangkat Baru</span>
              </Button>
            )}
          </div>
        }
      />

      {/* Device Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <MetricCard
          title="Total Perangkat"
          value={stats.totalCount || 0}
          subtext="IoT ESP32 terdaftar"
          icon={Cpu}
          color="emerald"
        />
        <MetricCard
          title="Pending Verifikasi"
          value={stats.pendingCount || 0}
          subtext="Menunggu persetujuan admin"
          icon={Clock}
          color="amber"
        />
        <MetricCard
          title="Status Online"
          value={stats.onlineCount || 0}
          subtext={`${stats.offlineCount || 0} Offline`}
          icon={Wifi}
          color="blue"
        />
        <MetricCard
          title="Smart Compost Bin"
          value={stats.compostBinsCount || 0}
          subtext="Unit kompos pintar"
          icon={Sprout}
          color="purple"
        />
        <MetricCard
          title="Pos Pengumpulan"
          value={stats.stationsCount || 0}
          subtext="Station timbangan RFID"
          icon={Scale}
          color="rose"
        />
      </div>
    </div>
  );
};
