import { redirectToSigninWithReturn } from "@/lib/auth-redirect";

interface ApiFetchSuccess<T> {
  data: T;
  error?: never;
  statusCode?: never;
}

interface ApiFetchError {
  data?: never;
  error: string;
  statusCode?: number;
}

export type ApiFetchResult<T> = ApiFetchSuccess<T> | ApiFetchError;

export interface FetchJsonOptions extends RequestInit {
  redirectOn401?: boolean;
}

function shouldSetJsonHeader(body: BodyInit | null | undefined): boolean {
  if (!body) return false;
  if (body instanceof FormData) return false;
  if (body instanceof URLSearchParams) return false;
  if (body instanceof Blob) return false;
  if (body instanceof ArrayBuffer) return false;
  return true;
}

function extractErrorMessage(payload: unknown, statusCode: number): string {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const message = (payload as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
    if (Array.isArray(message)) {
      const firstString = message.find(
        (item): item is string => typeof item === "string" && item.trim().length > 0,
      );
      if (firstString) return firstString;
    }
  }

  return `Request failed with status ${statusCode}`;
}

async function parseResponsePayload(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;

  const text = await response.text();
  if (!text) return undefined;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function fetchJson<T>(
  url: string,
  options?: FetchJsonOptions,
): Promise<ApiFetchResult<T>> {
  try {
    const { redirectOn401 = true, ...requestOptions } = options ?? {};
    const headers = new Headers(options?.headers ?? {});
    if (!headers.has("Content-Type") && shouldSetJsonHeader(options?.body)) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(url, {
      ...requestOptions,
      headers,
      credentials: requestOptions.credentials ?? "include",
    });

    const payload = await parseResponsePayload(response);

    if (!response.ok) {
      if (response.status === 401 && redirectOn401) {
        redirectToSigninWithReturn();
      }

      return {
        error: extractErrorMessage(payload, response.status),
        statusCode: response.status,
      };
    }

    return { data: payload as T };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}
