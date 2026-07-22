import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useClientSettings } from '@/context/ClientSettingsContext';
import { Button } from '@/components/ui/button';
import { StatusBadge, RoleBadge } from '@/features/users/components/StatusBadge';
import { Menu, LogOut, CreditCard, Sun, Moon } from 'lucide-react';

export const Navbar = ({ onToggleSidebar }) => {
  const { userProfile, role, status, logout } = useAuth();
  const { settings, toggleTheme, t } = useClientSettings();

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 font-sans shadow-xs transition-colors duration-200">
      {/* Left: Mobile Menu Toggle & App Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center space-x-2">
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">Smart Circular Village</span>
          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            SCV v1.8.0
          </span>
        </div>
      </div>

      {/* Right: Realtime User Profile, Theme Toggle & Logout */}
      <div className="flex items-center space-x-3">
        {/* Quick Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${settings.theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {settings.theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* User Badges & ID */}
        <div className="hidden md:flex flex-col items-end text-right">
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {userProfile?.fullName || 'User'}
            </span>
            <RoleBadge role={role} />
            <StatusBadge status={status} />
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">
              ID: {userProfile?.memberId || 'SCV-26-000000'}
            </span>
            {userProfile?.rfidUid && (
              <span className="text-slate-400 dark:text-slate-500 flex items-center space-x-0.5">
                <CreditCard className="w-3 h-3" />
                <span>[{userProfile.rfidUid}]</span>
              </span>
            )}
          </div>
        </div>

        {/* User Avatar */}
        <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-full flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
          {(userProfile?.fullName || 'U').charAt(0).toUpperCase()}
        </div>

        {/* Logout Button */}
        <Button
          onClick={logout}
          variant="outline"
          size="sm"
          className="text-xs border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 gap-1.5"
          title={t('logout')}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('logout')}</span>
        </Button>
      </div>
    </header>
  );
};
