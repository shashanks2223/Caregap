import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';

// Caregiver Pages
import { CaregiverOnboarding } from './pages/caregiver/CaregiverOnboarding';
import { CaregiverDashboard } from './pages/caregiver/CaregiverDashboard';
import { CaregiverProfilePage } from './pages/caregiver/CaregiverProfilePage';
import { CaregiverPlansPage } from './pages/caregiver/CaregiverPlansPage';
import { CaregiverPoliciesPage } from './pages/caregiver/CaregiverPoliciesPage';
import { SubmitClaimPage } from './pages/caregiver/SubmitClaimPage';
import { ClaimTrackingPage } from './pages/caregiver/ClaimTrackingPage';
import { CaregiverNotificationsPage } from './pages/caregiver/CaregiverNotificationsPage';
import { CaregiverSettingsPage } from './pages/caregiver/CaregiverSettingsPage';

// Employer Pages
import { EmployerOnboarding } from './pages/employer/EmployerOnboarding';
import { EmployerDashboard } from './pages/employer/EmployerDashboard';
import { EmployerCaregiversPage } from './pages/employer/EmployerCaregiversPage';
import { EmployerVerificationsPage } from './pages/employer/EmployerVerificationsPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminClaimsPage } from './pages/admin/AdminClaimsPage';
import { AdminCaregiversPage } from './pages/admin/AdminCaregiversPage';
import { AdminEmployersPage } from './pages/admin/AdminEmployersPage';
import { AdminPlansPage } from './pages/admin/AdminPlansPage';
import { AdminRiskReviewPage } from './pages/admin/AdminRiskReviewPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xs text-slate-400">Authenticating...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to proper role home
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'employer') return <Navigate to="/employer" replace />;
    return <Navigate to="/caregiver" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Caregiver Portal */}
          <Route
            path="/caregiver"
            element={
              <ProtectedRoute allowedRoles={['caregiver']}>
                <CaregiverDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/caregiver/onboarding"
            element={
              <ProtectedRoute allowedRoles={['caregiver']}>
                <CaregiverOnboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/caregiver/profile"
            element={
              <ProtectedRoute allowedRoles={['caregiver']}>
                <CaregiverProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/caregiver/plans"
            element={
              <ProtectedRoute allowedRoles={['caregiver']}>
                <CaregiverPlansPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/caregiver/policies"
            element={
              <ProtectedRoute allowedRoles={['caregiver']}>
                <CaregiverPoliciesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/caregiver/submit-claim"
            element={
              <ProtectedRoute allowedRoles={['caregiver']}>
                <SubmitClaimPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/caregiver/claims"
            element={
              <ProtectedRoute allowedRoles={['caregiver']}>
                <ClaimTrackingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/caregiver/notifications"
            element={
              <ProtectedRoute allowedRoles={['caregiver']}>
                <CaregiverNotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/caregiver/settings"
            element={
              <ProtectedRoute allowedRoles={['caregiver']}>
                <CaregiverSettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Employer Portal */}
          <Route
            path="/employer"
            element={
              <ProtectedRoute allowedRoles={['employer']}>
                <EmployerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/onboarding"
            element={
              <ProtectedRoute allowedRoles={['employer']}>
                <EmployerOnboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/caregivers"
            element={
              <ProtectedRoute allowedRoles={['employer']}>
                <EmployerCaregiversPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employer/verifications"
            element={
              <ProtectedRoute allowedRoles={['employer']}>
                <EmployerVerificationsPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Underwriter Portal */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/claims"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminClaimsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/caregivers"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminCaregiversPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/employers"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminEmployersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/plans"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPlansPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/risk-review"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminRiskReviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/fraud-queue"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminAuditLogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminAuditLogsPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

