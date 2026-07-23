import React, { useMemo } from 'react';
import { generateQRCodeSVG } from '@/utils/qrGenerator';

/**
 * VoucherQRCode Component
 * Renders a high-resolution 100% offline vector QR Code SVG containing the `redemptionId`.
 */
export const VoucherQRCode = ({ value = 'SCV-RWD-000000', size = 180, className = '' }) => {
  const cleanValue = String(value || '').trim();

  const svgContent = useMemo(() => {
    return generateQRCodeSVG(cleanValue, size);
  }, [cleanValue, size]);

  return (
    <div className={`flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner ${className}`}>
      <div
        className="rounded-xl overflow-hidden shadow-xs border border-slate-100 dark:border-slate-800 p-1 bg-white"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
      <div className="mt-2 text-center">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Redemption ID</span>
        <span className="text-xs font-mono font-extrabold text-slate-900 dark:text-slate-100">{cleanValue}</span>
      </div>
    </div>
  );
};
