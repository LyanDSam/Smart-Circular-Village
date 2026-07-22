import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Leaf, Lock, Mail, ArrowRight, AlertCircle, Loader2, ShieldCheck, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleLoginSuccess = (result) => {
    const userStatus = result?.profile?.status || result?.status;

    if (userStatus === 'pending') {
      navigate('/verification-pending', { replace: true });
    } else if (userStatus === 'rejected') {
      navigate('/rejected', { replace: true });
    } else {
      navigate(from, { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      handleLoginSuccess(result);
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick preset login handler for instant role testing
  const handleQuickLogin = async (presetEmail) => {
    setEmail(presetEmail);
    setPassword('password123');
    setError('');
    setIsSubmitting(true);

    try {
      const result = await login(presetEmail, 'password123');
      handleLoginSuccess(result);
    } catch (err) {
      setError(err.message || 'Preset login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans py-8">
      <div className="w-full max-w-md space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-600/30 mb-1">
            <Leaf className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Smart Circular Village</h1>
          <p className="text-xs text-slate-500">Integrated IoT Waste Bank & Smart Compost Platform</p>
        </div>

        {/* Login Form Card */}
        <Card className="border-slate-200/90 shadow-md">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg text-slate-900">Sign In</CardTitle>
            <CardDescription className="text-xs">Enter your registered email and password</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Error Banner */}
              {error && (
                <div className="flex items-start space-x-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="leading-snug">{error}</div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. citizen@smartvillage.id"
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9"
                    required
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-3 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full gap-2 text-sm font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              <div className="text-xs text-center text-slate-600 pt-1">
                Don't have a citizen account?{' '}
                <Link to="/register" className="text-emerald-600 font-semibold hover:underline inline-flex items-center gap-1">
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register Now</span>
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Quick Presets Demo */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2.5">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Quick Role & Status Testing Presets:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickLogin('admin@smartvillage.id')}
              className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-left font-medium border border-emerald-200 transition-colors"
            >
              <div className="flex justify-between items-center">
                <span>Admin</span>
                <Badge variant="default" className="text-[9px] px-1 py-0">Active</Badge>
              </div>
              <span className="text-[10px] text-emerald-600 block mt-0.5">admin@smartvillage.id</span>
            </button>

            <button
              onClick={() => handleQuickLogin('officer@smartvillage.id')}
              className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-left font-medium border border-blue-200 transition-colors"
            >
              <div className="flex justify-between items-center">
                <span>Officer</span>
                <Badge variant="info" className="text-[9px] px-1 py-0">Active</Badge>
              </div>
              <span className="text-[10px] text-blue-600 block mt-0.5">officer@smartvillage.id</span>
            </button>

            <button
              onClick={() => handleQuickLogin('pending@smartvillage.id')}
              className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-left font-medium border border-amber-200 transition-colors"
            >
              <div className="flex justify-between items-center">
                <span>Pending</span>
                <Badge variant="warning" className="text-[9px] px-1 py-0">Pending</Badge>
              </div>
              <span className="text-[10px] text-amber-700 block mt-0.5">pending@smartvillage.id</span>
            </button>

            <button
              onClick={() => handleQuickLogin('rejected@smartvillage.id')}
              className="p-2 bg-red-50 hover:bg-red-100 text-red-900 rounded-lg text-left font-medium border border-red-200 transition-colors"
            >
              <div className="flex justify-between items-center">
                <span>Rejected</span>
                <Badge variant="destructive" className="text-[9px] px-1 py-0">Rejected</Badge>
              </div>
              <span className="text-[10px] text-red-700 block mt-0.5">rejected@smartvillage.id</span>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400">
          Smart Circular Village Platform © 2026 • Version 1.0.0
        </div>
      </div>
    </div>
  );
};
