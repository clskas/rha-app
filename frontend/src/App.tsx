import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import EmployeeDetail from './pages/EmployeeDetail'
import EmployeeForm from './pages/EmployeeForm'
import Leaves from './pages/Leaves'
import LeaveForm from './pages/LeaveForm'
import Payroll from './pages/Payroll'
import Recruitment from './pages/Recruitment'
import Evaluations from './pages/Evaluations'
import Trainings from './pages/Trainings'
import Departements from './pages/Departements'
import Positions from './pages/Positions'
import Contracts from './pages/Contracts'
import Profile from './pages/Profile'
import AuditLog from './pages/AuditLog'
import ImportExcel from './pages/ImportExcel'
import LeaveCalendar from './pages/LeaveCalendar'

const roleRoutes: Record<string, string[]> = {
  '/employees': ['admin', 'rh', 'manager'],
  '/employees/new': ['admin', 'rh'],
  '/employees/:id': ['admin', 'rh', 'manager'],
  '/employees/:id/edit': ['admin', 'rh'],
  '/import-excel': ['admin', 'rh'],
  '/postes': ['admin', 'rh'],
  '/contracts': ['admin', 'rh'],
  '/departements': ['admin', 'rh'],
  '/payroll': ['admin', 'rh', 'employee'],
  '/recruitment': ['admin', 'rh'],
  '/audit': ['admin', 'rh'],
  '/leave-calendar': ['admin', 'rh', 'manager', 'employee'],
  '/trainings': ['admin', 'rh', 'manager', 'employee'],
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RoleRoute({ children, path }: { children: React.ReactNode; path: string }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
  const allowedRoles = roleRoutes[path]
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="employees" element={<RoleRoute path="/employees"><Employees /></RoleRoute>} />
          <Route path="employees/new" element={<RoleRoute path="/employees/new"><EmployeeForm /></RoleRoute>} />
          <Route path="employees/:id" element={<RoleRoute path="/employees/:id"><EmployeeDetail /></RoleRoute>} />
          <Route path="employees/:id/edit" element={<RoleRoute path="/employees/:id/edit"><EmployeeForm /></RoleRoute>} />
          <Route path="import-excel" element={<RoleRoute path="/import-excel"><ImportExcel /></RoleRoute>} />
          <Route path="postes" element={<RoleRoute path="/postes"><Positions /></RoleRoute>} />
          <Route path="contracts" element={<RoleRoute path="/contracts"><Contracts /></RoleRoute>} />
          <Route path="leaves" element={<Leaves />} />
          <Route path="leaves/new" element={<LeaveForm />} />
          <Route path="leave-calendar" element={<RoleRoute path="/leave-calendar"><LeaveCalendar /></RoleRoute>} />
          <Route path="payroll" element={<RoleRoute path="/payroll"><Payroll /></RoleRoute>} />
          <Route path="recruitment" element={<RoleRoute path="/recruitment"><Recruitment /></RoleRoute>} />
          <Route path="evaluations" element={<Evaluations />} />
          <Route path="trainings" element={<RoleRoute path="/trainings"><Trainings /></RoleRoute>} />
          <Route path="departements" element={<RoleRoute path="/departements"><Departements /></RoleRoute>} />
          <Route path="profile" element={<Profile />} />
          <Route path="audit" element={<RoleRoute path="/audit"><AuditLog /></RoleRoute>} />
        </Route>
      </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
