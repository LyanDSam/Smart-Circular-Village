import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * @deprecated /my-qr route removed. Redirects to /dashboard.
 */
export const MyQRPage = () => {
  return <Navigate to="/dashboard" replace />;
};
