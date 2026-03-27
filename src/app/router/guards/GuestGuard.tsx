// src/app/router/guards/GuestGuard.tsx
import type { JSX } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthSession } from '@/features/auth/hooks/useAuthSession';

export const GuestGuard = (): JSX.Element => {
  const { isChecking, isAuthorized } = useAuthSession();

  if (isChecking) return <div>Loading...</div>;
  if (isAuthorized) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};
