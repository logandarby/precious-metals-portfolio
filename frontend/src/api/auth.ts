import { apiJson, invalidateCsrfToken } from './client'

export async function register(email: string, password: string): Promise<void> {
  await apiJson('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function login(email: string, password: string): Promise<string> {
  const message = await apiJson<string>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  invalidateCsrfToken()
  return message
}

let meLoad: Promise<string> | null = null

export async function me(): Promise<string> {
  if (!meLoad) {
    meLoad = apiJson<string>('/api/auth/me').finally(() => {
      meLoad = null
    })
  }
  return meLoad
}
