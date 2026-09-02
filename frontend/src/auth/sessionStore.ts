// TODO: This will eventually be migrated over to a Redux Store slice

import { me } from '@/api/auth'

export type SessionSnapshot = {
  identity: string | null
  loading: boolean
}

let snapshot: SessionSnapshot = { identity: null, loading: true }
const listeners = new Set<() => void>()
let started = false

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

export function getSessionSnapshot() {
  return snapshot
}

export function subscribeSession(onChange: () => void) {
  listeners.add(onChange)
  if (!started) {
    started = true
    void refreshSession()
  }
  return () => {
    listeners.delete(onChange)
  }
}

export async function refreshSession(): Promise<string | null> {
  try {
    const identity = await me()
    snapshot = { identity, loading: false }
    emit()
    return identity
  } catch {
    snapshot = { identity: null, loading: false }
    emit()
    return null
  }
}
