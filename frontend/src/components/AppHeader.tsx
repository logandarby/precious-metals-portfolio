import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutUser, selectName } from "@/store/authSlice";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  const dispatch = useAppDispatch();
  const username = useAppSelector(selectName);
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    try {
      await dispatch(logoutUser()).unwrap();
    } finally {
      setPending(false);
    }
  }

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
      <Link
        to="/portfolios"
        className="font-heading text-sm font-medium tracking-[0.08em] uppercase"
      >
        Precious Metals
      </Link>
      <div className="flex items-center gap-3">
        {username ? (
          <p className="text-sm text-muted-foreground">{username}</p>
        ) : null}
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => void handleLogout()}
        >
          {pending ? "Signing out…" : "Log out"}
        </Button>
      </div>
    </header>
  );
}
