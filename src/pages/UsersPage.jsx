import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userService } from '@/services/userService';
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
  Users,
  Clock,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const UsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Dialog State
  const [approveUserTarget, setApproveUserTarget] = useState(null);
  const [rejectUserTarget, setRejectUserTarget] = useState(null);

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingCount: 0,
    activeCitizens: 0,
    activeOfficers: 0,
    rejectedCount: 0,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await userService.getUsers({
        search,
        role: roleFilter,
        status: statusFilter,
        page,
        pageSize: 8,
      });
      setUsers(result.users);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);

      const statsRes = await userService.getUserStats();
      setStats(statsRes);
    } catch (err) {
      console.error('Error loading users list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [search, roleFilter, statusFilter, page]);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  const promptSoftDelete = (uid, name) => {
    setConfirmDialog({
      isOpen: true,
      title: `Hapus Akun Pengguna "${name}"?`,
      description: `Apakah Anda yakin ingin menghapus akun ${name}? (Soft Delete)`,
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
        title="User & Citizen Management"
        description="Manage village citizen registrations, assign RFID cards, and control access roles."
        icon={Users}
      >
        <Link to="/admin/users/pending">
          <Button variant="warning" className="gap-2 text-xs font-semibold shadow-xs">
            <Clock className="w-4 h-4" />
            <span>Pending Approvals ({stats.pendingCount})</span>
          </Button>
        </Link>
      </PageHeader>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Registered</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">{stats.totalUsers}</p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 shadow-xs">
          <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">Pending Verification</p>
          <p className="text-2xl font-extrabold text-amber-800 dark:text-amber-300 mt-1">{stats.pendingCount}</p>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 shadow-xs">
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">Active Citizens</p>
          <p className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-300 mt-1">{stats.activeCitizens}</p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 shadow-xs">
          <p className="text-xs text-blue-700 dark:text-blue-400 font-semibold">Active Officers</p>
          <p className="text-2xl font-extrabold text-blue-800 dark:text-blue-300 mt-1">{stats.activeOfficers}</p>
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
              placeholder="Search by name, email, Member ID, or RFID..."
              className="pl-9 text-xs h-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent border-none text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">All Roles</option>
                <option value="citizen" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Citizen</option>
                <option value="officer" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Officer</option>
                <option value="government" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Government</option>
                <option value="admin" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Admin</option>
                <option value="pending" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Pending Role</option>
              </select>
            </div>

            <div className="flex items-center space-x-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1 text-xs">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent border-none text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">All Statuses</option>
                <option value="active" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Active</option>
                <option value="pending" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Pending</option>
                <option value="rejected" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Rejected</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Responsive Table */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                <TableRow>
                  <TableHead className="text-xs font-semibold text-slate-600 dark:text-slate-400">Member ID</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 dark:text-slate-400">Full Name</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 dark:text-slate-400">Email & Phone</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 dark:text-slate-400">Role</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 dark:text-slate-400">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 dark:text-slate-400">RFID Card</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 dark:text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-xs text-slate-400">
                      Loading user data...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-xs text-slate-400">
                      No users found matching current search/filter.
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
                          <span className="text-[11px] text-amber-600 dark:text-amber-400 italic">Unassigned</span>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Link to={`/admin/users/${u.uid}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="View & Edit Detail"
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
                                title="Approve Registration"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setRejectUserTarget(u)}
                                className="h-8 w-8 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                                title="Reject Registration"
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
                            title="Soft Delete User"
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
              Showing page <span className="font-semibold text-slate-800 dark:text-slate-200">{page}</span> of{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">{totalPages}</span> ({totalCount} total users)
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
        confirmText="Hapus Pengguna"
        variant="danger"
      />
    </div>
  );
};
