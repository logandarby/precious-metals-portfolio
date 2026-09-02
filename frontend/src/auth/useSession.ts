import { useSyncExternalStore } from 'react'
import { getSessionSnapshot, refreshSession, subscribeSession } from '@/auth/sessionStore'

export function useSession() {
  const { identity, loading } = useSyncExternalStore(
    subscribeSession,
    getSessionSnapshot,
    getSessionSnapshot,
  )
  return { identity, loading, refresh: refreshSession }
}
