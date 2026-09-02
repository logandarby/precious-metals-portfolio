import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { CircleAlert } from "lucide-react";
import { isRejectedApiError } from "@/api/client";
import { useAppDispatch } from "@/store/hooks";
import { loginUser } from "@/store/authSlice";
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
  loginSchema,
  type LoginFormValues,
} from "@/lib/authValidation";

const LOGIN_FIELDS = new Set<keyof LoginFormValues>(["email", "password"]);

export function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onValid({ email, password }: LoginFormValues) {
    setError(null);
    try {
      await dispatch(loginUser({ email, password })).unwrap();
      navigate("/portfolios", { replace: true });
    } catch (cause) {
      if (isRejectedApiError(cause)) {
        for (const [field, message] of Object.entries(cause.fieldErrors)) {
          if (LOGIN_FIELDS.has(field as keyof LoginFormValues)) {
            setFieldError(field as keyof LoginFormValues, {
              type: "server",
              message,
            });
          }
        }
        setError(cause.message);
      } else {
        setError("Login failed");
      }
    }
  }

  function onInvalid() {
    setError("Please fix the highlighted fields and try again.");
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Log In</CardTitle>
        <CardDescription>Sign in with your email and password.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4"
          noValidate
          onSubmit={handleSubmit(onValid, onInvalid)}
        >
          <div className="grid gap-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              maxLength={EMAIL_MAX_LENGTH}
              {...register("email")}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "login-email-error" : undefined}
            />
            {errors.email ? (
              <p id="login-email-error" className="text-xs text-destructive">
                {errors.email.message}
              </p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              maxLength={PASSWORD_MAX_LENGTH}
              {...register("password")}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={
                errors.password ? "login-password-error" : undefined
              }
            />
            {errors.password ? (
              <p id="login-password-error" className="text-xs text-destructive">
                {errors.password.message}
              </p>
            ) : null}
          </div>
          {error ? (
            <Alert variant="destructive">
              <CircleAlert />
              <AlertTitle>Could not sign in</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Log in"}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="button"
          variant="link"
          className="px-0"
          onClick={() => navigate("/register")}
        >
          Create an account
        </Button>
      </CardFooter>
    </Card>
  );
}
