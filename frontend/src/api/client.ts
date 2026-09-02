const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

type CsrfResponse = {
  headerName: string;
  parameterName: string;
  token: string;
};

let csrfToken: string | null = null;
let csrfHeaderName = "X-CSRF-TOKEN";
let csrfLoad: Promise<void> | null = null;

export function invalidateCsrfToken(): void {
  csrfToken = null;
}

async function loadCsrfToken(): Promise<void> {
  if (csrfToken) {
    return;
  }
  if (!csrfLoad) {
    csrfLoad = fetch(`${API_BASE_URL}/api/auth/csrf`, {
      credentials: "include",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load CSRF token (${response.status})`);
        }
        const data = (await response.json()) as CsrfResponse;
        csrfToken = data.token;
        csrfHeaderName = data.headerName;
      })
      .finally(() => {
        csrfLoad = null;
      });
  }
  await csrfLoad;
}

type ErrorBody = {
  detail?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
};

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string>;

  constructor(
    status: number,
    message: string,
    fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export type RejectedApiError = {
  message: string;
  status: number;
  fieldErrors: Record<string, string>;
};

export function toRejectedApiError(error: unknown): RejectedApiError {
  if (error instanceof ApiError) {
    return {
      message: error.message,
      status: error.status,
      fieldErrors: error.fieldErrors,
    };
  }
  return { message: "Request failed", status: 0, fieldErrors: {} };
}

export function isRejectedApiError(error: unknown): error is RejectedApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    "fieldErrors" in error &&
    typeof (error as RejectedApiError).message === "string" &&
    typeof (error as RejectedApiError).fieldErrors === "object"
  );
}

async function readApiError(response: Response): Promise<ApiError> {
  const text = await response.text();
  if (!text) {
    return new ApiError(response.status, response.statusText);
  }
  try {
    const body = JSON.parse(text) as ErrorBody;
    return new ApiError(
      response.status,
      body.detail || body.message || response.statusText,
      body.fieldErrors ?? {},
    );
  } catch {
    return new ApiError(response.status, text);
  }
}

export async function apiRequest(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);

  if (UNSAFE_METHODS.has(method)) {
    await loadCsrfToken();
    if (!csrfToken) {
      throw new Error("CSRF token is missing");
    }
    headers.set(csrfHeaderName, csrfToken);
  }

  if (init.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    method,
    headers,
    credentials: "include",
  });
}

export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiRequest(path, init);
  if (!response.ok) {
    throw await readApiError(response);
  }
  if (
    response.status === 204 ||
    response.headers.get("Content-Length") === "0"
  ) {
    return undefined as T;
  }
  const contentType = response.headers.get("Content-Type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }
  return (await response.text()) as T;
}
