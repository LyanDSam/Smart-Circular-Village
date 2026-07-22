import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useClientSettings } from '@/context/ClientSettingsContext';
import { getNavItemsByRole } from '@/constants/navigation';
import { Leaf, X, Shield } from 'lucide-react';
import { cn } from '@/utils/cn';

export const Sidebar = ({ isOpen, onClose }) => {
  const { role, status } = useAuth();
  const { t } = useClientSettings();

  // No navigation for pending/rejected users
  const navItems = status === 'active' ? getNavItemsByRole(role) : [];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-6 bg-slate-950/60 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-md">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block leading-tight">
                Smart Circular
              </span>
              <span className="text-xs font-semibold tracking-wider text-emerald-400 uppercase">
                Village (SCV)
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase flex items-center justify-between">
            <span>{t('navSectionTitle')}</span>
            <span className="text-[10px] text-emerald-400 font-mono capitalize">[{role || 'guest'}]</span>
          </div>

          {navItems.length === 0 ? (
            <div className="p-4 text-xs text-slate-400 bg-slate-800/50 rounded-xl border border-slate-700/60 text-center">
              Account pending verification. Menu is restricted.
            </div>
          ) : (
            navItems.map((item) => {
              const Icon = item.icon;
              const titleText = item.key && t(item.key) !== item.key ? t(item.key) : (item.title || item.key);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    )
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{titleText}</span>
                </NavLink>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 m-4 bg-slate-800/60 rounded-xl border border-slate-700/50">
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-300">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="capitalize">{t('userAccess')}: {role || 'User'}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">SCV Platform v1.9</p>
        </div>
      </aside>
    </>
  );
};
