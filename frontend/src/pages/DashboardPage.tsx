import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCurrentUser } from "@/store/authSlice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DashboardPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
        <CardDescription>
          This page is only available when your session is active.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <p>{user ? `Signed in as ${user.email}` : "Signed in."}</p>
        <p className="text-muted-foreground">
          Refresh the page to confirm the session persists across reloads.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => void dispatch(fetchCurrentUser())}
        >
          Recheck session
        </Button>
      </CardContent>
    </Card>
  );
}
