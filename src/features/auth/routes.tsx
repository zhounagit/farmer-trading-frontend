import { lazy } from 'react';
import { type RouteObject } from 'react-router-dom';
import AuthFeatureWrapper from './components/AuthFeatureWrapper';

// Lazy load auth components from local feature directory
const LoginPage = lazy(() => import('./components/LoginPage'));
const RegisterPage = lazy(() => import('./components/RegisterPage'));
const ForgotPasswordPage = lazy(
  () => import('./components/ForgotPasswordPage')
);
const ResetPasswordPage = lazy(() => import('./components/ResetPasswordPage'));
const ChangePasswordPage = lazy(
  () => import('./components/ChangePasswordPage')
);
const AdminAuthPage = lazy(() => import('./components/AdminAuthPage'));
const ClearTokenPage = lazy(() => import('./components/ClearTokenPage'));

export const authRoutes: RouteObject[] = [
  {
    path: '/login',
    element: (
      <AuthFeatureWrapper>
        <LoginPage />
      </AuthFeatureWrapper>
    ),
  },
  {
    path: '/register',
    element: (
      <AuthFeatureWrapper>
        <RegisterPage />
      </AuthFeatureWrapper>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <AuthFeatureWrapper>
        <ForgotPasswordPage />
      </AuthFeatureWrapper>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <AuthFeatureWrapper>
        <ResetPasswordPage />
      </AuthFeatureWrapper>
    ),
  },
  {
    path: '/change-password',
    element: (
      <AuthFeatureWrapper>
        <ChangePasswordPage />
      </AuthFeatureWrapper>
    ),
  },
  {
    path: '/admin/auth/:submissionId',
    element: (
      <AuthFeatureWrapper>
        <AdminAuthPage />
      </AuthFeatureWrapper>
    ),
  },
  {
    path: '/clear-token',
    element: (
      <AuthFeatureWrapper>
        <ClearTokenPage />
      </AuthFeatureWrapper>
    ),
  },
];

export default authRoutes;
