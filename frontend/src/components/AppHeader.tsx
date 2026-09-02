import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logoutUser } from '@/store/authSlice'
import { Button } from '@/components/ui/button'

export function AppHeader() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const [pending, setPending] = useState(false)

  async function handleLogout() {
    setPending(true)
    try {
      await dispatch(logoutUser()).unwrap()
    } finally {
      setPending(false)
    }
  }

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
      <p className="font-heading text-sm font-medium">Precious Metals Portfolio</p>
      <div className="flex items-center gap-3">
        {user ? <p className="text-sm text-muted-foreground">{user.email}</p> : null}
        <Button type="button" variant="outline" disabled={pending} onClick={() => void handleLogout()}>
          {pending ? 'Signing out…' : 'Log out'}
        </Button>
      </div>
    </header>
  )
}
