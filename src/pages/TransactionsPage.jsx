import React from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard } from '@/components/common/SectionCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Search, Download } from 'lucide-react';
import { RECENT_TRANSACTIONS } from '@/constants/mockData';

export const TransactionsPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Waste Transactions"
        description="Digital waste bank record history collected via RFID & Load Cell Smart Stations."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </Button>
            <Button variant="default" size="sm" className="gap-2">
              <PlusCircle className="w-4 h-4" />
              <span>New Entry</span>
            </Button>
          </>
        }
      />

      <SectionCard>
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <Input placeholder="Search transaction ID or citizen..." className="pl-9 text-xs" />
          </div>
        </div>

        {RECENT_TRANSACTIONS.length === 0 ? (
          <div className="py-8">
            <EmptyState title="No Transactions Found" description="Waste deposit transactions logged by operators will appear here." />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tx ID</TableHead>
                <TableHead>Citizen Name</TableHead>
                <TableHead>Waste Category</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Points Earned</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RECENT_TRANSACTIONS.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-400">{tx.id}</TableCell>
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">{tx.citizen}</TableCell>
                  <TableCell>
                    <Badge variant={tx.wasteType.includes('Organic') ? 'success' : 'info'}>
                      {tx.wasteType}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold text-slate-800 dark:text-slate-200">{tx.weight}</TableCell>
                  <TableCell className="text-emerald-600 dark:text-emerald-400 font-semibold">+{tx.pointsEarned} Pts</TableCell>
                  <TableCell className="text-xs text-slate-500 dark:text-slate-400">{tx.timestamp}</TableCell>
                  <TableCell>
                    <Badge variant="success">{tx.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>
    </div>
  );
};
