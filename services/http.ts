
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") || "https://server-04mx.onrender.com";

type Json = Record<string, any>;

export class HttpError extends Error {
  status: number;
  data?: any;
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.data = data;
  }
}

async function parseJSON(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text };
  }
}

export async function request<T = any>(
  path: string,
  init: RequestInit & { json?: Json } = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const res = await fetch(url, {
      ...init,
      headers,
      body: init.json ? JSON.stringify(init.json) : init.body,
      signal: controller.signal,
    });

    const data = await parseJSON(res);

    if (!res.ok) {
      const msg = data?.message || `HTTP ${res.status}`;
      throw new HttpError(msg, res.status, data);
    }

    return data as T;
  } catch (err: any) {
    if (err?.name === "AbortError") throw new HttpError("Request timed out", 408);
    if (err instanceof HttpError) throw err;
    throw new HttpError(err?.message || "Network error", 0);
  } finally {
    clearTimeout(timeout);
  }
}

export const http = {
  get: <T = any>(path: string, init?: RequestInit) => request<T>(path, { ...init, method: "GET" }),
  post: <T = any>(path: string, json?: Json, init?: RequestInit) =>
    request<T>(path, { ...init, method: "POST", json }),
  patch: <T = any>(path: string, json?: Json, init?: RequestInit) =>
    request<T>(path, { ...init, method: "PATCH", json }),
};