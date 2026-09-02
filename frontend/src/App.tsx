import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useSession } from '@/auth/useSession'
import { Toaster } from '@/components/ui/sonner'
import { DashboardPage } from '@/pages/DashboardPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'

function CenteredOutlet() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted p-6">
      <Outlet />
    </div>
  )
}

function SessionGate() {
  const { loading } = useSession()
  if (loading) {
    return <p className="text-sm text-muted-foreground">Checking session…</p>
  }
  return <Outlet />
}

function GuestOnly() {
  const { identity } = useSession()
  if (identity) {
    return <Navigate to="/dashboard" replace />
  }
  return <Outlet />
}

function RequireAuth() {
  const { identity } = useSession()
  if (!identity) {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<CenteredOutlet />}>
          <Route element={<SessionGate />}>
            <Route element={<GuestOnly />}>
              <Route path="/" element={<LoginPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>
            <Route element={<RequireAuth />}>
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
      <Toaster />
    </>
  )
}
