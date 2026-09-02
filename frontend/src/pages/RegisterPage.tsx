import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { CircleAlert } from "lucide-react";
import { isRejectedApiError } from "@/api/client";
import { useAppDispatch } from "@/store/hooks";
import { registerUser } from "@/store/authSlice";
import { PasswordStrengthBar } from "@/components/PasswordStrengthBar";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  EMAIL_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  registerSchema,
  type RegisterFormValues,
} from "@/lib/authValidation";

const REGISTER_FIELDS = new Set<keyof RegisterFormValues>([
  "email",
  "password",
  "confirmPassword",
]);

export function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError: setFieldError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  const password = useWatch({ control, name: "password" });

  async function onValid({ email, password }: RegisterFormValues) {
    setError(null);
    try {
      await dispatch(registerUser({ email, password })).unwrap();
      toast.success("You've registered successfully");
      navigate("/portfolios", { replace: true });
    } catch (cause) {
      if (isRejectedApiError(cause)) {
        for (const [field, message] of Object.entries(cause.fieldErrors)) {
          if (REGISTER_FIELDS.has(field as keyof RegisterFormValues)) {
            setFieldError(field as keyof RegisterFormValues, {
              type: "server",
              message,
            });
          }
        }
        setError(cause.message);
      } else {
        setError("Registration failed");
      }
    }
  }

  function onInvalid() {
    setError("Please fix the highlighted fields and try again.");
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>
          Create an account to track your metals.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4"
          noValidate
          onSubmit={handleSubmit(onValid, onInvalid)}
        >
          <div className="grid gap-2">
            <Label htmlFor="register-email">Email</Label>
            <Input
              id="register-email"
              type="email"
              autoComplete="email"
              maxLength={EMAIL_MAX_LENGTH}
              {...register("email")}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={
                errors.email ? "register-email-error" : undefined
              }
            />
            {errors.email ? (
              <p id="register-email-error" className="text-xs text-destructive">
                {errors.email.message}
              </p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="register-password">Password</Label>
            <Input
              id="register-password"
              type="password"
              autoComplete="new-password"
              minLength={PASSWORD_MIN_LENGTH}
              maxLength={PASSWORD_MAX_LENGTH}
              {...register("password")}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password
                  ? "register-password-error"
                  : "register-password-hint"
              }
            />
            <p
              id="register-password-hint"
              className="text-xs text-muted-foreground"
            >
              Use {PASSWORD_MIN_LENGTH}-{PASSWORD_MAX_LENGTH} characters with
              uppercase, lowercase, and a number.
            </p>
            <PasswordStrengthBar password={password} />
            {errors.password ? (
              <p
                id="register-password-error"
                className="text-xs text-destructive"
              >
                {errors.password.message}
              </p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="register-confirm-password">Confirm password</Label>
            <Input
              id="register-confirm-password"
              type="password"
              autoComplete="new-password"
              maxLength={PASSWORD_MAX_LENGTH}
              {...register("confirmPassword")}
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={
                errors.confirmPassword
                  ? "register-confirm-password-error"
                  : undefined
              }
            />
            {errors.confirmPassword ? (
              <p
                id="register-confirm-password-error"
                className="text-xs text-destructive"
              >
                {errors.confirmPassword.message}
              </p>
            ) : null}
          </div>
          {error ? (
            <Alert variant="destructive">
              <CircleAlert />
              <AlertTitle>Could not register</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating…" : "Create account"}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="button"
          variant="link"
          className="px-0"
          onClick={() => navigate("/")}
        >
          Back to log in
        </Button>
      </CardFooter>
    </Card>
  );
}
