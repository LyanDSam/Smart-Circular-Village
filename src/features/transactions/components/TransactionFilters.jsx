import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { WASTE_CATEGORIES } from '@/services/pointService';

export const TransactionFilters = ({
  search = '',
  onSearchChange,
  wasteType = 'all',
  onWasteTypeChange,
  onResetFilters,
}) => {
  return (
    <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3 font-sans">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Cari ID transaksi, nama warga, Member ID, atau RFID..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 text-xs text-slate-500 shrink-0 font-medium mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Kategori:</span>
          </div>

          {/* Waste Type Category Select */}
          <select
            value={wasteType}
            onChange={(e) => onWasteTypeChange(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">Semua Kategori Sampah</option>
            {WASTE_CATEGORIES.map((cat) => (
              <option key={cat.key} value={cat.key}>
                {cat.key} ({cat.pointsPerKg} Pts/kg)
              </option>
            ))}
          </select>

          {/* Reset Filters */}
          <button
            onClick={onResetFilters}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Reset Filter"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
