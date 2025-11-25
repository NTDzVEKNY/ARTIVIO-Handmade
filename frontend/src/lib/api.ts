export const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? '/api';

export async function apiGet<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: 'GET', ...init });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API GET ${path} failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  return data as T;
}