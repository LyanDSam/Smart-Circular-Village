import React from 'react';
import { Badge } from '@/components/ui/badge';

export const StatusBadge = ({ status }) => {
  switch (status) {
    case 'active':
      return <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">Active</Badge>;
    case 'pending':
      return <Badge variant="warning">Pending</Badge>;
    case 'rejected':
      return <Badge variant="destructive">Rejected</Badge>;
    default:
      return <Badge variant="secondary">{status || 'Unknown'}</Badge>;
  }
};

export const RoleBadge = ({ role }) => {
  switch (role) {
    case 'admin':
      return <Badge variant="default" className="bg-slate-900 text-white">Admin</Badge>;
    case 'officer':
      return <Badge variant="info">Officer</Badge>;
    case 'government':
      return <Badge variant="purple">Government</Badge>;
    case 'citizen':
      return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200">Citizen</Badge>;
    case 'pending':
    default:
      return <Badge variant="outline" className="text-slate-500">Pending Role</Badge>;
  }
};
