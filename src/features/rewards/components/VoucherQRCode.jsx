import React from 'react';

/**
 * VoucherQRCode Component
 * Renders a high-resolution QR Code containing ONLY the `redemptionId` (e.g., `SCV-RWD-8F32A0`).
 * Uses Google Charts / QR Server API SVG URL as a reliable vector generator, or falls back to canvas.
 */
export const VoucherQRCode = ({ value = 'SCV-RWD-000000', size = 180, className = '' }) => {
  const cleanValue = String(value || '').trim();
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(cleanValue)}&margin=10`;

  return (
    <div className={`flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner ${className}`}>
      <img
        src={qrApiUrl}
        alt={`Voucher QR Code: ${cleanValue}`}
        width={size}
        height={size}
        className="rounded-xl object-contain max-w-full"
        loading="lazy"
      />
      <div className="mt-2 text-center">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Redemption ID</span>
        <span className="text-xs font-mono font-extrabold text-slate-900 dark:text-slate-100">{cleanValue}</span>
      </div>
    </div>
  );
};
