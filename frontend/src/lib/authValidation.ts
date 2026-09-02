import { z } from 'zod'

export const EMAIL_MAX_LENGTH = 254
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 72

export const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
export const PASSWORD_COMPLEXITY_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/

export const AUTH_MESSAGES = {
  emailRequired: 'Email is required',
  emailInvalid: 'Email must be a valid email address',
  emailTooLong: `Email must be at most ${EMAIL_MAX_LENGTH} characters`,
  passwordRequired: 'Password is required',
  passwordTooLong: 'Password is too long',
  passwordLength: `Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters`,
  passwordComplexity:
    'Password must contain at least one lowercase letter, one uppercase letter, and one number',
  passwordConfirmRequired: 'Please confirm your password',
  passwordMismatch: 'Passwords do not match',
} as const

export const emailSchema = z
  .string()
  .trim()
  .min(1, AUTH_MESSAGES.emailRequired)
  .max(EMAIL_MAX_LENGTH, AUTH_MESSAGES.emailTooLong)
  .regex(EMAIL_PATTERN, AUTH_MESSAGES.emailInvalid)

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, AUTH_MESSAGES.passwordRequired)
    .max(PASSWORD_MAX_LENGTH, AUTH_MESSAGES.passwordTooLong),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    email: emailSchema,
    password: z
      .string()
      .min(1, AUTH_MESSAGES.passwordRequired)
      .min(PASSWORD_MIN_LENGTH, AUTH_MESSAGES.passwordLength)
      .max(PASSWORD_MAX_LENGTH, AUTH_MESSAGES.passwordLength)
      .regex(PASSWORD_COMPLEXITY_PATTERN, AUTH_MESSAGES.passwordComplexity),
    confirmPassword: z.string().min(1, AUTH_MESSAGES.passwordConfirmRequired),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: AUTH_MESSAGES.passwordMismatch,
    path: ['confirmPassword'],
  })

export type RegisterFormValues = z.infer<typeof registerSchema>

export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4
  label: 'Too short' | 'Weak' | 'Fair' | 'Good' | 'Strong'
}

export function getPasswordStrength(password: string): PasswordStrength {
  if (password.length === 0) {
    return { score: 0, label: 'Too short' }
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return { score: 0, label: 'Too short' }
  }

  const hasLower = /[a-z]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasDigit = /\d/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)
  const extraLong = password.length >= 12
  const variety = [hasLower, hasUpper, hasDigit, hasSpecial].filter(Boolean).length

  if (variety <= 1) {
    return { score: 1, label: 'Weak' }
  }
  if (variety === 2 || (variety === 3 && !extraLong)) {
    return { score: 2, label: 'Fair' }
  }
  if (variety === 3 || (variety === 4 && !extraLong)) {
    return { score: 3, label: 'Good' }
  }
  return { score: 4, label: 'Strong' }
}
