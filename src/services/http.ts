import { API_BASE_URL } from '@/constants/api';

const CONNECTION_ERROR = 'Sin conexión. Comprobá tu red.';

type ErrorBody = {
  message?: string | string[];
};

function parseBody(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function messageFromBody(body: unknown, status: number): string {
  if (body && typeof body === 'object' && 'message' in body) {
    const raw = (body as ErrorBody).message;
    if (typeof raw === 'string' && raw.trim()) return raw;
    if (Array.isArray(raw) && raw.length > 0) return raw.map(String).join('\n');
  }
  return `HTTP ${status}`;
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new Error(CONNECTION_ERROR);
  }

  const body = parseBody(await res.text());

  if (!res.ok) {
    throw new Error(messageFromBody(body, res.status));
  }

  return body as T;
}
