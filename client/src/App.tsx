import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleProtectedRoute } from './components/RoleProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { Dashboard } from './pages/Dashboard';
import { ExamPage } from './pages/ExamPage';

import { AdminDashboard } from './pages/AdminDashboard';
import { LiveProctoringView } from './pages/LiveProctoringView';
import { ExamManagement } from './pages/ExamManagement';
import { InstitutePage } from './pages/InstitutePage';
import { StudentProfile } from './pages/StudentProfile';
import { ExamHistory } from './pages/ExamHistory';
import { PerformanceAnalytics } from './pages/PerformanceAnalytics';
import { UserManagement } from './pages/UserManagement';
import { InstituteManagement } from './pages/InstituteManagement';
import { UpcomingExams } from './pages/UpcomingExams';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { PreExamFlow } from './pages/PreExamFlow';
import { SchedulingPage } from './pages/admin/SchedulingPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { ProctorManagementPage } from './pages/admin/ProctorManagementPage';
import { IntegrationsPage } from './pages/admin/IntegrationsPage';
import { BrandingPage } from './pages/admin/BrandingPage';
import { BillingPage } from './pages/admin/BillingPage';
import { AdminSettingsPage } from './pages/admin/SettingsPage';
import { AuditPage } from './pages/admin/AuditPage';
import { FlaggedIncidentsPage } from './pages/admin/FlaggedIncidentsPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected routes - Students */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exam/:id"
            element={
              <ProtectedRoute>
                <ExamPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exam/:id/precheck"
            element={
              <ProtectedRoute>
                <PreExamFlow />
              </ProtectedRoute>
            }
          />

          {/* Student Pages */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <StudentProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <ExamHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <PerformanceAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upcoming"
            element={
              <ProtectedRoute>
                <UpcomingExams />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Protected routes - Instructors only */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['instructor', 'admin']}>
                  <AdminDashboard />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/monitor/:examId"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['instructor', 'admin']}>
                  <LiveProctoringView />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/exams"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['instructor', 'admin']}>
                  <ExamManagement />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <UserManagement />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/institutes"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <InstituteManagement />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/scheduling"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['instructor', 'admin']}>
                  <SchedulingPage />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/monitoring"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['instructor', 'admin']}>
                  <LiveProctoringView />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['instructor', 'admin']}>
                  <ReportsPage />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/violations"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['instructor', 'admin']}>
                  <FlaggedIncidentsPage />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/proctors"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <ProctorManagementPage />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/integrations"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <IntegrationsPage />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/branding"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <BrandingPage />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/billing"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <BillingPage />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <AdminSettingsPage />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <AuditPage />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />

          {/* Institute Page - Protected or Public? Assuming Protected for now */}
          <Route
            path="/institute/:id"
            element={
              <ProtectedRoute>
                <InstitutePage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
