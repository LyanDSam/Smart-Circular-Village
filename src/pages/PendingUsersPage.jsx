import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '@/services/userService';
import { ApproveDialog } from '@/features/users/components/ApproveDialog';
import { RejectDialog } from '@/features/users/components/RejectDialog';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, XCircle, Eye, ArrowLeft, Mail, Phone, MapPin, CreditCard } from 'lucide-react';

export const PendingUsersPage = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal Targets
  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);

  const loadPending = async () => {
    setLoading(true);
    try {
      const res = await userService.getPendingUsers();
      setPendingUsers(res.users);
    } catch (err) {
      console.error('Error fetching pending users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <PageHeader
        title="Pending Citizen Verifications"
        description="Review citizen registration submissions, assign RFID cards, and approve account activations."
        icon={Clock}
      >
        <Link to="/admin/users">
          <Button variant="outline" className="gap-2 text-xs border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Users</span>
          </Button>
        </Link>
      </PageHeader>

      {/* Content */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading pending verification queue...</div>
      ) : pendingUsers.length === 0 ? (
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-12 text-center">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Queue Complete!</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            There are currently no pending registration requests requiring administrator approval.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingUsers.map((u) => (
            <Card key={u.uid} className="border-amber-200 dark:border-amber-900/50 shadow-xs hover:shadow-md transition-shadow bg-white dark:bg-slate-900 flex flex-col justify-between">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <Badge variant="warning" className="text-[10px] uppercase font-bold">
                    Pending Verification
                  </Badge>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 mt-2">
                  {u.fullName}
                </CardTitle>
                <p className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  {u.memberId || 'SCV-26-000000'}
                </p>
              </CardHeader>

              <CardContent className="py-4 space-y-3 text-xs">
                {/* RFID Status */}
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-amber-500" />
                    RFID Card:
                  </span>
                  <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                    {u.rfidUid || 'Awaiting Link'}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-slate-600 dark:text-slate-300 pt-1">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                    <span className="truncate">{u.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                    <span>{u.phone || '-'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                    <span className="truncate">{u.address || '-'}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-2 gap-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                <Link to={`/admin/users/${u.uid}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full text-xs gap-1 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Detail</span>
                  </Button>
                </Link>

                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setApproveTarget(u)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-xs gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve</span>
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setRejectTarget(u)}
                  className="text-xs px-2"
                  title="Reject"
                >
                  <XCircle className="w-3.5 h-3.5" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <ApproveDialog
        isOpen={Boolean(approveTarget)}
        onClose={() => setApproveTarget(null)}
        user={approveTarget}
        onApproved={loadPending}
      />

      <RejectDialog
        isOpen={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        user={rejectTarget}
        onRejected={loadPending}
      />
    </div>
  );
};
