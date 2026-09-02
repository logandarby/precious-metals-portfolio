import { cn } from "@/lib/utils";
import { getPasswordStrength } from "@/lib/authValidation";

const SEGMENT_COLORS = [
  "bg-destructive",
  "bg-amber-500",
  "bg-yellow-500",
  "bg-emerald-500",
] as const;

const LABEL_COLORS = [
  "text-muted-foreground",
  "text-destructive",
  "text-amber-600 dark:text-amber-400",
  "text-yellow-600 dark:text-yellow-400",
  "text-emerald-600 dark:text-emerald-400",
] as const;

type PasswordStrengthBarProps = {
  password: string;
};

export function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
  const { score, label } = getPasswordStrength(password);
  const fillColor =
    score === 0 ? "bg-muted-foreground/40" : SEGMENT_COLORS[score - 1];

  return (
    <div className="grid gap-1.5">
      <div
        role="meter"
        aria-label="Password strength"
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={score}
        aria-valuetext={label}
        className="grid grid-cols-4 gap-1"
      >
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className={cn(
              "h-1.5 rounded-full bg-muted",
              score > index && fillColor,
            )}
          />
        ))}
      </div>
      <p className={cn("text-xs", LABEL_COLORS[score])}>
        {password ? `Password strength: ${label}` : "Password strength"}
      </p>
    </div>
  );
}
