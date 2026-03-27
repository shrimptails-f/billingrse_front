// src/app/router/guards/AuthGuard.tsx
import type { JSX } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';

export const AuthGuard = (): JSX.Element => {
  const location = useLocation();
  const { isChecking, isUnauthorized } = useAuthSession();

  if (isChecking) return <div>Loading...</div>;
  if (isUnauthorized) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};
