import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { XCircle, LogOut, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const RejectedPage = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans py-12">
      <div className="w-full max-w-md space-y-6">
        <Card className="border-red-200 shadow-md bg-white">
          <CardHeader className="text-center space-y-2 pb-2">
            <div className="inline-flex p-3 bg-red-100 text-red-700 rounded-full w-14 h-14 items-center justify-center mx-auto mb-1 border border-red-200">
              <XCircle className="w-8 h-8" />
            </div>
            <Badge variant="destructive" className="text-xs px-3 py-1 font-semibold mx-auto">
              Status: Registration Rejected
            </Badge>
            <CardTitle className="text-xl font-bold text-slate-900">
              Account Registration Rejected
            </CardTitle>
            <CardDescription className="text-xs max-w-sm mx-auto">
              Hello, <span className="font-semibold text-slate-800">{userProfile?.fullName || 'Citizen'}</span>. Your registration request for Smart Circular Village has not been approved.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-2 text-center text-xs">
            <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-left space-y-2 text-red-900">
              <div className="flex items-center space-x-2 font-bold text-red-950">
                <PhoneCall className="w-4 h-4 text-red-700 shrink-0" />
                <span>Contact Officer for Clarification:</span>
              </div>
              <p className="leading-relaxed text-red-800">
                Your account was not verified. Please contact your local village Waste Bank officer or visit the POS RW office with valid proof of residency to review your account details.
              </p>
            </div>
          </CardContent>

          <CardFooter className="pt-2">
            <Button
              variant="default"
              onClick={handleLogout}
              className="w-full gap-2 text-xs bg-slate-800 hover:bg-slate-900"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out & Return to Login</span>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
