import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { QRCodeDisplay } from '@/components/common/QRCodeDisplay';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, QrCode } from 'lucide-react';

export const MyQRPage = () => {
  const { userProfile } = useAuth();

  return (
    <div className="space-y-6 font-sans">
      <PageHeader title="Kartu QR Digital" description="Gunakan QR Code ini saat melakukan setoran di Bank Sampah." icon={QrCode} />

      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs max-w-md mx-auto">
        <CardContent className="p-8 flex flex-col items-center space-y-4">
          <QRCodeDisplay value={userProfile?.qrCode || userProfile?.memberId} size={200} />

          <div className="text-center space-y-1">
            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{userProfile?.fullName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{userProfile?.email}</p>
            <p className="text-sm font-mono font-extrabold text-emerald-700 dark:text-emerald-400 mt-2">
              {userProfile?.memberId || 'N/A'}
            </p>
          </div>

          {userProfile?.rfidUid && (
            <div className="flex items-center gap-2 text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              <CreditCard className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>RFID: {userProfile.rfidUid}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
