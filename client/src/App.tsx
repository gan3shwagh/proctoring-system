import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleProtectedRoute } from './components/RoleProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { Dashboard } from './pages/Dashboard';
import { ExamPage } from './pages/ExamPage';
import { InstructorDashboard } from './pages/InstructorDashboard';
import { LiveProctoringView } from './pages/LiveProctoringView';
import { ExamManagement } from './pages/ExamManagement';

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

          {/* Protected routes - Instructors only */}
          <Route
            path="/instructor"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['instructor', 'admin']}>
                  <InstructorDashboard />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/live-proctoring/:examId"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['instructor', 'admin']}>
                  <LiveProctoringView />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/exam-management"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={['instructor', 'admin']}>
                  <ExamManagement />
                </RoleProtectedRoute>
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
