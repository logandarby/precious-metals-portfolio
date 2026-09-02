import { apiJson, invalidateCsrfToken } from "./client";

export type MeResponse = {
  id: string;
  email: string;
};

export async function register(
  email: string,
  password: string,
): Promise<MeResponse> {
  const user = await apiJson<MeResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  invalidateCsrfToken();
  return user;
}

export async function login(
  email: string,
  password: string,
): Promise<MeResponse> {
  const user = await apiJson<MeResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  invalidateCsrfToken();
  return user;
}

let meLoad: Promise<MeResponse> | null = null;

export async function me(): Promise<MeResponse> {
  if (!meLoad) {
    meLoad = apiJson<MeResponse>("/api/auth/me").finally(() => {
      meLoad = null;
    });
  }
  return meLoad;
}

export async function logout(): Promise<void> {
  await apiJson<void>("/logout", { method: "POST" });
  invalidateCsrfToken();
}
