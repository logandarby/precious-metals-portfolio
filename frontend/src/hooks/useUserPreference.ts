import {
  useCallback,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  getUserPreference,
  setUserPreference,
} from "@/services/userPreferences";

type UserPreferenceOptions<T> = {
  validate?: (value: unknown) => value is T;
};

type UserPreferenceField<T> = {
  value: T;
  setValue: Dispatch<SetStateAction<T>>;
  onChange: (value: T) => void;
  reset: () => void;
};

export function useUserPreference<T>(
  key: string,
  fallback: T,
  options: UserPreferenceOptions<T> = {},
): UserPreferenceField<T> {
  const [value, setValue] = useState<T>(() => {
    const stored = getUserPreference<unknown>(key, fallback);
    return options.validate && !options.validate(stored) ? fallback : (stored as T);
  });

  const updateValue = useCallback((nextValue: SetStateAction<T>): void => {
    setValue((currentValue) => {
      const resolvedValue =
        typeof nextValue === "function"
          ? (nextValue as (value: T) => T)(currentValue)
          : nextValue;
      setUserPreference(key, resolvedValue);
      return resolvedValue;
    });
  }, [key]);

  const onChange = useCallback(
    (nextValue: T): void => updateValue(nextValue),
    [updateValue],
  );

  const reset = useCallback((): void => updateValue(fallback), [fallback, updateValue]);

  return { value, setValue: updateValue, onChange, reset };
}