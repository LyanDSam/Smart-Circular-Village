import React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard } from '@/components/common/SectionCard';
import { Button } from '@/components/ui/button';
import { FileText, Download, Calendar } from 'lucide-react';

export const ReportsPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Village Waste & Compost Reports"
        description="Generate statistical evaluation reports for village government and environmental audit."
        actions={
          <Button variant="default" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            <span>Generate Full PDF</span>
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SectionCard title="Monthly Summary" description="July 2026 Waste Report">
          <div className="py-4 text-center">
            <FileText className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Includes citizen participation metrics, collection totals & compost distribution</p>
            <Button variant="outline" size="sm" className="mt-4 w-full text-xs border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">Download Report</Button>
          </div>
        </SectionCard>

        <SectionCard title="Environmental Impact" description="Circular Economy Score">
          <div className="py-4 text-center">
            <Calendar className="w-10 h-10 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Calculates CO2 emission reduction and organic waste diversion rate</p>
            <Button variant="outline" size="sm" className="mt-4 w-full text-xs border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">Download Report</Button>
          </div>
        </SectionCard>

        <SectionCard title="Point System Audit" description="Citizen Reward Redemptions">
          <div className="py-4 text-center">
            <FileText className="w-10 h-10 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Audit log of all points granted via RFID load cell transactions</p>
            <Button variant="outline" size="sm" className="mt-4 w-full text-xs border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">Download Report</Button>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};
