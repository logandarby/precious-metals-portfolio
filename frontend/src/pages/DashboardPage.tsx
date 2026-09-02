import { useSession } from '@/auth/useSession'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function DashboardPage() {
  const { identity, refresh } = useSession()

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
        <CardDescription>
          This page is only available when your session is active.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <p>{identity ?? 'Signed in.'}</p>
        <p className="text-muted-foreground">
          Refresh the page to confirm the session persists across reloads.
        </p>
        <Button type="button" variant="outline" onClick={() => void refresh()}>
          Recheck session
        </Button>
      </CardContent>
    </Card>
  )
}
