// frontend/lib/api.ts
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// Re-export everything from googleSheets so the app has a single import source
export * from "./googleSheets";
