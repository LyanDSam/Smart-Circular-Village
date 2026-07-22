import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { userService } from '@/services/userService';
import { StatusBadge, RoleBadge } from '@/features/users/components/StatusBadge';
import { ApproveDialog } from '@/features/users/components/ApproveDialog';
import { RejectDialog } from '@/features/users/components/RejectDialog';
import { PageHeader } from '@/components/common/PageHeader';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import {
  User,
  ArrowLeft,
  CreditCard,
  CheckCircle2,
  XCircle,
  Save,
  Trash2,
  AlertCircle,
  Edit3,
} from 'lucide-react';

export const UserDetailPage = () => {
  const { uid } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [rfidUid, setRfidUid] = useState('');

  // UI state
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Modal State
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const loadUser = async () => {
    setLoading(true);
    try {
      const uData = await userService.getUserById(uid);
      if (uData) {
        setUser(uData);
        setFullName(uData.fullName || '');
        setPhone(uData.phone || '');
        setAddress(uData.address || '');
        setRfidUid(uData.rfidUid || '');
      } else {
        setMessage({ type: 'error', text: 'User not found.' });
      }
    } catch (err) {
      console.error('Error fetching user detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [uid]);

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setIsSaving(true);

    try {
      await userService.updateUser(uid, { fullName, phone, address });
      setMessage({ type: 'success', text: 'User profile information updated successfully.' });
      loadUser();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update user profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssignRfid = async () => {
    setMessage({ type: '', text: '' });
    if (!rfidUid.trim()) {
      setMessage({ type: 'error', text: 'Please enter a valid RFID card UID.' });
      return;
    }

    try {
      await userService.assignRfid(uid, rfidUid);
      setMessage({ type: 'success', text: `RFID card "${rfidUid.toUpperCase()}" assigned successfully!` });
      loadUser();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to assign RFID card.' });
    }
  };

  const [confirmDialog, setConfirmDialog] = useState(false);

  const handleSoftDelete = async () => {
    setConfirmDialog(true);
  };

  const executeSoftDelete = async () => {
    await userService.softDeleteUser(uid);
    setConfirmDialog(false);
    navigate('/admin/users');
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading user profile details...</div>;
  }

  if (!user) {
    return (
      <div className="p-8 text-center space-y-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">User Profile Not Found</h3>
        <Link to="/admin/users">
          <Button variant="outline" size="sm">
            Return to User List
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <PageHeader
        title={`User Profile: ${user.fullName}`}
        description={`Member ID: ${user.memberId || 'N/A'} • Single Citizen Profile Management`}
        icon={User}
      >
        <Link to="/admin/users">
          <Button variant="outline" className="gap-2 text-xs border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Users</span>
          </Button>
        </Link>
      </PageHeader>

      {/* Message Banner */}
      {message.text && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center space-x-2 border ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Status & System Overview */}
        <div className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center shadow-xs">
            <CardHeader className="pb-2">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950 border-2 border-emerald-300 dark:border-emerald-800 rounded-full flex items-center justify-center text-emerald-800 dark:text-emerald-300 font-bold text-2xl mx-auto shadow-xs">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-2">{user.fullName}</CardTitle>
              <div className="flex items-center justify-center gap-2 mt-1">
                <StatusBadge status={user.status} />
                <RoleBadge role={user.role} />
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-left space-y-1">
                <div className="text-slate-400 dark:text-slate-500 font-sans text-[10px] uppercase font-bold">System Details</div>
                <div><span className="text-slate-500 dark:text-slate-400">Firebase UID:</span> <span className="text-slate-800 dark:text-slate-200 font-semibold">{user.uid}</span></div>
                <div><span className="text-slate-500 dark:text-slate-400">Member ID:</span> <span className="text-slate-800 dark:text-slate-200 font-semibold">{user.memberId || 'N/A'}</span></div>
                <div><span className="text-slate-500 dark:text-slate-400">Created:</span> <span className="text-slate-800 dark:text-slate-200">{new Date(user.createdAt).toLocaleDateString()}</span></div>
                <div><span className="text-slate-500 dark:text-slate-400">Last Update:</span> <span className="text-slate-800 dark:text-slate-200">{new Date(user.updatedAt).toLocaleDateString()}</span></div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {user.status === 'pending' && (
                <>
                  <Button
                    onClick={() => setShowApproveDialog(true)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2 text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Account Registration</span>
                  </Button>

                  <Button
                    onClick={() => setShowRejectDialog(true)}
                    variant="destructive"
                    className="w-full gap-2 text-xs"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Registration</span>
                  </Button>
                </>
              )}

              <Button
                variant="outline"
                onClick={handleSoftDelete}
                className="w-full text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-200 dark:border-red-900 gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Soft Delete User</span>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Editable Profile & RFID Assignment */}
        <div className="lg:col-span-2 space-y-6">
          {/* RFID Assignment Card */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-xs bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2 text-emerald-400">
                <CreditCard className="w-5 h-5" />
                <CardTitle className="text-base font-bold text-white">RFID Card Identification</CardTitle>
              </div>
              <p className="text-xs text-slate-300">
                Assign or replace the physical RFID card UID linked to this citizen.
              </p>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={rfidUid}
                  onChange={(e) => setRfidUid(e.target.value.toUpperCase())}
                  placeholder="Enter RFID UID e.g. 04A91B2F"
                  className="bg-slate-950 border-slate-700 text-white font-mono uppercase font-bold text-xs h-10"
                />
                <Button
                  onClick={handleAssignRfid}
                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shrink-0"
                >
                  Save RFID
                </Button>
              </div>
              <p className="text-[11px] text-slate-400">
                * Note: RFID card UIDs must be unique across all village citizen accounts.
              </p>
            </CardContent>
          </Card>

          {/* Edit User Information Card */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200">
                <Edit3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <CardTitle className="text-base font-bold">Edit Citizen Information</CardTitle>
              </div>
            </CardHeader>

            <form onSubmit={handleUpdateInfo}>
              <CardContent className="space-y-4">
                {/* Immutable Fields Notice */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Member ID (Immutable)</label>
                    <Input value={user.memberId || 'N/A'} disabled className="bg-slate-100 dark:bg-slate-950 font-mono text-xs mt-1 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Email (Immutable)</label>
                    <Input value={user.email || ''} disabled className="bg-slate-100 dark:bg-slate-950 text-xs mt-1 text-slate-500 dark:text-slate-400" />
                  </div>
                </div>

                {/* Editable Fields */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Address (RT / RW)</label>
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="text-xs"
                      required
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-2">
                <Button type="submit" disabled={isSaving} className="gap-2 text-xs font-semibold">
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>

      {/* Dialog Modals */}
      <ApproveDialog
        isOpen={showApproveDialog}
        onClose={() => setShowApproveDialog(false)}
        user={user}
        onApproved={loadUser}
      />

      <RejectDialog
        isOpen={showRejectDialog}
        onClose={() => setShowRejectDialog(false)}
        user={user}
        onRejected={loadUser}
      />

      <ConfirmDialog
        isOpen={confirmDialog}
        onClose={() => setConfirmDialog(false)}
        onConfirm={executeSoftDelete}
        title={`Hapus Pengguna "${user.fullName}"?`}
        description={`Apakah Anda yakin ingin menghapus pengguna ${user.fullName}? (Soft Delete)`}
        confirmText="Hapus Pengguna"
        variant="danger"
      />
    </div>
  );
};
