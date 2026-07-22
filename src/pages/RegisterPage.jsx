import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Leaf, User, Mail, Lock, Phone, MapPin, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

// Zod Registration Form Validation Schema
const registerSchema = z
  .object({
    fullName: z.string().min(3, 'Full name must be at least 3 characters.'),
    email: z.string().email('Please enter a valid email address.'),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters.'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits.'),
    address: z.string().min(5, 'Address must be at least 5 characters.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerAuth } = useAuth();
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setServerError('');
    setIsSubmitting(true);

    try {
      await registerAuth(data);
      navigate('/verification-pending', { replace: true });
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans py-12">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-600/30 mb-1">
            <Leaf className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create SCV Citizen Account</h1>
          <p className="text-xs text-slate-500">Register for Smart Circular Village Digital Waste Bank</p>
        </div>

        {/* Form Card */}
        <Card className="border-slate-200/90 shadow-md">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg text-slate-900">Registration</CardTitle>
            <CardDescription className="text-xs">
              Fill in your details below. Your account will be verified by a Waste Bank officer.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {/* Server Error Message */}
              {serverError && (
                <div className="flex items-start space-x-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="leading-snug">{serverError}</div>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    {...register('fullName')}
                    placeholder="e.g. Samuel Budi"
                    className={`pl-9 ${errors.fullName ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.fullName && <p className="text-[11px] text-red-600">{errors.fullName.message}</p>}
              </div>

              {/* Email & Phone grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      type="email"
                      {...register('email')}
                      placeholder="samuel@example.com"
                      className={`pl-9 ${errors.email ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.email && <p className="text-[11px] text-red-600">{errors.email.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      {...register('phone')}
                      placeholder="081234567890"
                      className={`pl-9 ${errors.phone ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.phone && <p className="text-[11px] text-red-600">{errors.phone.message}</p>}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Village Address (RT / RW)</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    {...register('address')}
                    placeholder="e.g. RT 02 / RW 01 Desa Cerdas"
                    className={`pl-9 ${errors.address ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.address && <p className="text-[11px] text-red-600">{errors.address.message}</p>}
              </div>

              {/* Password & Confirm Password grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      type="password"
                      {...register('password')}
                      placeholder="••••••••"
                      className={`pl-9 ${errors.password ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.password && <p className="text-[11px] text-red-600">{errors.password.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      type="password"
                      {...register('confirmPassword')}
                      placeholder="••••••••"
                      className={`pl-9 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-[11px] text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-3 pt-2">
              <Button type="submit" disabled={isSubmitting} className="w-full gap-2 text-sm font-semibold">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registering Account...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Citizen Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-slate-600 pt-1">
                Already have an account?{' '}
                <Link to="/login" className="text-emerald-600 font-semibold hover:underline">
                  Sign In
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};
