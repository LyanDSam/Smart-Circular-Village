import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge, RoleBadge } from '@/features/users/components/StatusBadge';
import { UserCircle, Mail, Phone, MapPin, CreditCard } from 'lucide-react';

export const ProfilePage = () => {
  const { userProfile } = useAuth();

  const fields = [
    { label: 'Email', value: userProfile?.email, icon: Mail },
    { label: 'Phone', value: userProfile?.phone || '-', icon: Phone },
    { label: 'Address', value: userProfile?.address || '-', icon: MapPin },
    { label: 'RFID Card', value: userProfile?.rfidUid || 'Belum ditautkan', icon: CreditCard },
  ];

  return (
    <div className="space-y-6 font-sans">
      <PageHeader title="Profil Saya" description="Informasi akun dan keanggotaan Anda." icon={UserCircle} />

      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs max-w-2xl">
        <CardContent className="p-6 space-y-5">
          {/* Name & Badges */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 border-2 border-emerald-300 dark:border-emerald-800 rounded-full flex items-center justify-center text-emerald-800 dark:text-emerald-300 font-bold text-2xl shadow-xs shrink-0">
              {(userProfile?.fullName || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{userProfile?.fullName}</h2>
              <p className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">{userProfile?.memberId}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <RoleBadge role={userProfile?.role} />
                <StatusBadge status={userProfile?.status} />
              </div>
            </div>
          </div>

          {/* Detail Fields */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            {fields.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.label} className="flex items-center gap-3 text-sm">
                  <Icon className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span className="text-slate-500 dark:text-slate-400 w-24 shrink-0 text-xs font-semibold">{f.label}</span>
                  <span className="text-slate-900 dark:text-slate-100 font-medium text-xs">{f.value}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
