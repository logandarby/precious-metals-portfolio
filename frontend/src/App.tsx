import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { AppHeader } from "@/components/AppHeader";
import { Toaster } from "@/components/ui/sonner";
import { AddTransactionPage } from "@/pages/AddTransactionPage";
import { LoginPage } from "@/pages/LoginPage";
import { PortfolioDetailPage } from "@/pages/PortfolioDetailPage";
import { PortfolioListPage } from "@/pages/PortfolioListPage";
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
    return <Navigate to="/portfolios" replace />;
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
      <div className="flex flex-1 flex-col px-6 py-8">
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
            <Route path="/dashboard" element={<Navigate to="/portfolios" replace />} />
            <Route path="/portfolios" element={<PortfolioListPage />} />
            <Route path="/portfolios/:id" element={<PortfolioDetailPage />} />
            <Route
              path="/portfolios/:id/transactions/new"
              element={<AddTransactionPage />}
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}
