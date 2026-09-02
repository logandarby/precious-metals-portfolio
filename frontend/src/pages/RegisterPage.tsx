import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircleAlert, CircleCheck } from 'lucide-react'
import { register } from '@/api/auth'
import { ApiError } from '@/api/client'
import { PasswordStrengthBar } from '@/components/PasswordStrengthBar'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  EMAIL_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
} from '@/lib/authValidation'

type FieldErrors = {
  email?: string
  password?: string
  confirmPassword?: string
}

export function RegisterPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  function collectFieldErrors(): FieldErrors {
    return {
      email: validateEmail(email) ?? undefined,
      password: validatePassword(password) ?? undefined,
      confirmPassword: validatePasswordConfirmation(password, confirmPassword) ?? undefined,
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextFieldErrors = collectFieldErrors()
    setFieldErrors(nextFieldErrors)
    setError(null)
    setStatus(null)

    if (nextFieldErrors.email || nextFieldErrors.password || nextFieldErrors.confirmPassword) {
      setError('Please fix the highlighted fields and try again.')
      return
    }

    setPending(true)
    try {
      await register(email.trim(), password)
      setStatus('Account created. You can log in now.')
    } catch (cause) {
      if (cause instanceof ApiError) {
        setFieldErrors((current) => ({
          ...current,
          ...cause.fieldErrors,
        }))
        setError(cause.message)
      } else {
        setError('Registration failed')
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>Create an account to track your metals.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" noValidate onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="register-email">Email</Label>
            <Input
              id="register-email"
              type="email"
              name="email"
              autoComplete="email"
              maxLength={EMAIL_MAX_LENGTH}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setFieldErrors((current) => ({ ...current, email: undefined }))
              }}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'register-email-error' : undefined}
              required
            />
            {fieldErrors.email ? (
              <p id="register-email-error" className="text-xs text-destructive">
                {fieldErrors.email}
              </p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="register-password">Password</Label>
            <Input
              id="register-password"
              type="password"
              name="password"
              autoComplete="new-password"
              minLength={PASSWORD_MIN_LENGTH}
              maxLength={PASSWORD_MAX_LENGTH}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                setFieldErrors((current) => ({ ...current, password: undefined }))
              }}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? 'register-password-error' : 'register-password-hint'}
              required
            />
            <p id="register-password-hint" className="text-xs text-muted-foreground">
              Use {PASSWORD_MIN_LENGTH}-{PASSWORD_MAX_LENGTH} characters with uppercase, lowercase, and a number.
            </p>
            <PasswordStrengthBar password={password} />
            {fieldErrors.password ? (
              <p id="register-password-error" className="text-xs text-destructive">
                {fieldErrors.password}
              </p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="register-confirm-password">Confirm password</Label>
            <Input
              id="register-confirm-password"
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              maxLength={PASSWORD_MAX_LENGTH}
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value)
                setFieldErrors((current) => ({ ...current, confirmPassword: undefined }))
              }}
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
              aria-describedby={fieldErrors.confirmPassword ? 'register-confirm-password-error' : undefined}
              required
            />
            {fieldErrors.confirmPassword ? (
              <p id="register-confirm-password-error" className="text-xs text-destructive">
                {fieldErrors.confirmPassword}
              </p>
            ) : null}
          </div>
          {status ? (
            <Alert role="status">
              <CircleCheck />
              <AlertTitle>Account created</AlertTitle>
              <AlertDescription>{status}</AlertDescription>
            </Alert>
          ) : null}
          {error ? (
            <Alert variant="destructive">
              <CircleAlert />
              <AlertTitle>Could not register</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <Button type="submit" disabled={pending}>
            {pending ? 'Creating…' : 'Create account'}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="button" variant="link" className="px-0" onClick={() => navigate('/')}>
          Back to log in
        </Button>
      </CardFooter>
    </Card>
  )
}

