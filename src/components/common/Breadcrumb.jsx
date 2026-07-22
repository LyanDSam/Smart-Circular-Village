import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumb = ({ title }) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2">
      <Link
        to="/dashboard"
        className="flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const formattedName =
          name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' ');

        return (
          <React.Fragment key={routeTo}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            {isLast ? (
              <span className="font-medium text-slate-800 dark:text-slate-200 capitalize">
                {title || formattedName}
              </span>
            ) : (
              <Link
                to={routeTo}
                className="hover:text-emerald-600 dark:hover:text-emerald-400 capitalize transition-colors"
              >
                {formattedName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
