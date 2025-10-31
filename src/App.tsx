import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ManagerDashboard } from '@/pages/manager/ManagerDashboard'
import { ProjectsPage } from '@/pages/manager/ProjectsPage'
import { ResourcesPage } from '@/pages/manager/ResourcesPage'
import { TeamPage } from '@/pages/manager/TeamPage'
import { EmployeeDashboard } from '@/pages/employee/EmployeeDashboard'
import { MyProjectsPage } from '@/pages/employee/MyProjectsPage'
import { ProfilePage } from '@/pages/employee/ProfilePage'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Manager Routes */}
            <Route
              path="/manager/*"
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<ManagerDashboard />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="resources" element={<ResourcesPage />} />
              <Route path="team" element={<TeamPage />} />
            </Route>

            {/* Employee Routes */}
            <Route
              path="/employee/*"
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<EmployeeDashboard />} />
              <Route path="projects" element={<MyProjectsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
