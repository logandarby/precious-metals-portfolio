import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { AppHeader } from "@/components/AppHeader";
import { Toaster } from "@/components/ui/sonner";
import { DashboardPage } from "@/pages/DashboardPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";

function CenteredOutlet() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted p-6">
      <Outlet />
    </div>
  );
}

function SessionGate() {
  const initialized = useAppSelector((state) => state.auth.initialized);
  if (!initialized) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-muted p-6">
        <p className="text-sm text-muted-foreground">Checking session…</p>
      </div>
    );
  }
  return <Outlet />;
}

function GuestOnly() {
  const user = useAppSelector((state) => state.auth.user);
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}

function RequireAuth() {
  const user = useAppSelector((state) => state.auth.user);
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return (
    <div className="flex min-h-svh flex-col bg-muted">
      <AppHeader />
      <div className="flex flex-1 items-center justify-center p-6">
        <Outlet />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Routes>
        <Route element={<SessionGate />}>
          <Route element={<CenteredOutlet />}>
            <Route element={<GuestOnly />}>
              <Route path="/" element={<LoginPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>
          </Route>
          <Route element={<RequireAuth />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}
