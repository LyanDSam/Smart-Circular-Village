import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userService } from '@/services/userService';
import { useClientSettings } from '@/context/ClientSettingsContext';
import { StatusBadge, RoleBadge } from '@/features/users/components/StatusBadge';
import { ApproveDialog } from '@/features/users/components/ApproveDialog';
import { RejectDialog } from '@/features/users/components/RejectDialog';
import { PageHeader } from '@/components/common/PageHeader';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import {
  ShieldCheck,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Clock,
  Shield,
} from 'lucide-react';

export const OfficersPage = () => {
  const navigate = useNavigate();
  const { t } = useClientSettings();
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Dialog State
  const [approveUserTarget, setApproveUserTarget] = useState(null);
  const [rejectUserTarget, setRejectUserTarget] = useState(null);

  // Officers Stats
  const [officersStats, setOfficersStats] = useState({
    totalOfficers: 0,
    activeOfficers: 0,
    pendingOfficers: 0,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      // Force role = 'officer'
      const result = await userService.getUsers({
        search,
        role: 'officer',
        status: statusFilter,
        page,
        pageSize: 8,
      });
      setUsers(result.users);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);

      // Fetch all officers stats
      const allOfficersRes = await userService.getUsers({ role: 'officer', pageSize: 10000 });
      const allOff = allOfficersRes.users;
      setOfficersStats({
        totalOfficers: allOff.length,
        activeOfficers: allOff.filter((u) => u.status === 'active').length,
        pendingOfficers: allOff.filter((u) => u.status === 'pending').length,
      });
    } catch (err) {
      console.error('Error loading officers list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, statusFilter, page]);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  const promptSoftDelete = (uid, name) => {
    setConfirmDialog({
      isOpen: true,
      title: `Hapus Petugas "${name}"?`,
      description: `Apakah Anda yakin ingin menghapus petugas ${name}? Data akun petugas akan di-soft delete dari sistem.`,
      onConfirm: async () => {
        await userService.softDeleteUser(uid);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        loadData();
      },
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <PageHeader
        title="Daftar Petugas Bank Sampah (Officers)"
        description="Kelola data petugas operasional Bank Sampah digital, penetapan kartu RFID, dan status akun petugas."
        icon={ShieldCheck}
      />

      {/* Officers Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Total Petugas Terdaftar</p>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">{officersStats.totalOfficers}</p>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/30 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold uppercase tracking-wider">Petugas Aktif</p>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 rounded-xl">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-800 dark:text-emerald-300 mt-2">{officersStats.activeOfficers}</p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/30 p-5 rounded-2xl border border-amber-200 dark:border-amber-900/50 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold uppercase tracking-wider">Pending Verifikasi</p>
            <div className="p-2 bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-amber-800 dark:text-amber-300 mt-2">{officersStats.pendingOfficers}</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <CardContent className="p-4 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cari petugas berdasarkan nama, email, Member ID, atau RFID..."
              className="pl-9 text-xs h-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Filter Status */}
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent border-none text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{t('allStatuses')}</option>
                <option value="active" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{t('active')}</option>
                <option value="pending" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{t('pending')}</option>
                <option value="rejected" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{t('rejected')}</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Officers Table */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                <TableRow>
                  <TableHead className="text-xs font-semibold text-slate-600 dark:text-slate-400">Member ID</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 dark:text-slate-400">Nama Petugas</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 dark:text-slate-400">Email & Telepon</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 dark:text-slate-400">Role</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 dark:text-slate-400">Status Akun</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 dark:text-slate-400">Kartu RFID</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 dark:text-slate-400 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-xs text-slate-400">
                      {t('loadingOfficersData')}
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-xs text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Shield className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                        <p className="font-semibold">Tidak ada data petugas yang ditemukan.</p>
                        <p className="text-[11px] text-slate-400">Pastikan filter atau pencarian Anda sesuai.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.uid} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-100 dark:border-slate-800/60">
                      <TableCell className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        {u.memberId || 'N/A'}
                      </TableCell>

                      <TableCell className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                        {u.fullName}
                      </TableCell>

                      <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                        <div>{u.email}</div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{u.phone || '-'}</div>
                      </TableCell>

                      <TableCell>
                        <RoleBadge role={u.role} />
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={u.status} />
                      </TableCell>

                      <TableCell className="font-mono text-xs text-slate-700 dark:text-slate-300">
                        {u.rfidUid ? (
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 font-bold text-[11px] text-slate-800 dark:text-slate-200">
                            {u.rfidUid}
                          </span>
                        ) : (
                          <span className="text-[11px] text-amber-600 dark:text-amber-400 italic">Belum Di-assign</span>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Link to={`/admin/users/${u.uid}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Lihat & Edit Detail Petugas"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>

                          {u.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setApproveUserTarget(u)}
                                className="h-8 w-8 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                title="Setujui Petugas"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setRejectUserTarget(u)}
                                className="h-8 w-8 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                                title="Tolak Pendaftaran"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => promptSoftDelete(u.uid, u.fullName)}
                            className="h-8 w-8 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                            title="Hapus Petugas"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-500 dark:text-slate-400">
            <div>
              Menampilkan halaman <span className="font-semibold text-slate-800 dark:text-slate-200">{page}</span> dari{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">{totalPages}</span> ({totalCount} total petugas)
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="h-8 gap-1 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="h-8 gap-1 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <ApproveDialog
        isOpen={Boolean(approveUserTarget)}
        onClose={() => setApproveUserTarget(null)}
        user={approveUserTarget}
        onApproved={loadData}
      />

      <RejectDialog
        isOpen={Boolean(rejectUserTarget)}
        onClose={() => setRejectUserTarget(null)}
        user={rejectUserTarget}
        onRejected={loadData}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText="Hapus Petugas"
        variant="danger"
      />
    </div>
  );
};
