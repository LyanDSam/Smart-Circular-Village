import {
  Sprout,
  Scale,
  MapPin,
  Edit2,
  RefreshCw,
  Power,
  Trash2,
  ExternalLink,
  Bell,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const DeviceTable = ({
  devices = [],
  canManage = false,
  onViewDetail,
  onEdit,
  onRegenerateKey,
  onToggleActive,
  onPing,
  onApprove,
  onReject,
  onDelete,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Perangkat</th>
              <th className="py-3.5 px-4">Tipe</th>
              <th className="py-3.5 px-4">Lokasi</th>
              <th className="py-3.5 px-4">Firmware</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
            {devices.map((device) => {
              const isCompost = (device.deviceType || device.type) === 'compost';
              const Icon = isCompost ? Sprout : Scale;

              return (
                <tr key={device.deviceId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  {/* Device Name & ID */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-xl shrink-0 ${
                          isCompost
                            ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                            : 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">{device.name}</div>
                        <div className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          {device.deviceId}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="py-3.5 px-4 font-medium">
                    <span className="capitalize text-slate-600 dark:text-slate-400">
                      {isCompost ? 'Smart Compost Bin' : 'Smart Collection Station '}
                    </span>
                  </td>

                  {/* Location */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{device.location?.address || device.location?.village || 'N/A'}</span>
                    </div>
                  </td>

                  {/* Firmware */}
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                    v{device.firmwareVersion || '1.0.0'}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <DeviceStatusBadge status={device.status} />
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {canManage && (device.approvalStatus === 'pending' || device.status === 'pending') && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => onApprove && onApprove(device)}
                            className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1"
                            title="Setujui Perangkat"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Setujui</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onReject && onReject(device)}
                            className="h-7 px-2.5 border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs gap-1"
                            title="Tolak Perangkat"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Tolak</span>
                          </Button>
                        </>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetail(device)}
                        className="h-8 px-2 text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400"
                        title="Detail"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>

                      {canManage && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onPing && onPing(device)}
                            className="h-8 px-2 text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40"
                            title="Ping Device (Bunyikan Buzzer)"
                          >
                            <Bell className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(device)}
                            className="h-8 px-2 text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRegenerateKey(device)}
                            className="h-8 px-2 text-slate-600 hover:text-amber-600 dark:text-slate-300 dark:hover:text-amber-400"
                            title="Regenerasi API Key"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onToggleActive(device)}
                            className="h-8 px-2 text-slate-600 hover:text-purple-600 dark:text-slate-300 dark:hover:text-purple-400"
                            title={device.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(device)}
                            className="h-8 px-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
