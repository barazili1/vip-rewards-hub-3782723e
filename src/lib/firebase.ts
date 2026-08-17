const DB = "https://arfoush1-default-rtdb.europe-west1.firebasedatabase.app";

export type CodeEntry = {
  code: string;
  createdAt: number;
  /** null = lifetime */
  expiresAt: number | null;
  durationLabel: string;
};

export async function listCodes(): Promise<CodeEntry[]> {
  const res = await fetch(`${DB}/demon.json?_=${Date.now()}`);
  if (!res.ok) throw new Error("failed to load codes");
  const data = (await res.json()) as Record<string, CodeEntry> | null;
  if (!data) return [];
  return Object.entries(data)
    .map(([code, v]) => ({ ...v, code, expiresAt: v.expiresAt ?? null }))
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

export async function getCode(code: string): Promise<CodeEntry | null> {
  const key = encodeURIComponent(code.trim());
  const res = await fetch(`${DB}/demon/${key}.json?_=${Date.now()}`);
  if (!res.ok) return null;
  const data = (await res.json()) as CodeEntry | null;
  if (!data) return null;
  return { ...data, code: code.trim(), expiresAt: data.expiresAt ?? null };
}

export async function saveCode(entry: CodeEntry): Promise<void> {
  const key = encodeURIComponent(entry.code);
  const res = await fetch(`${DB}/demon/${key}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error("failed to save code");
}

export async function deleteCode(code: string): Promise<void> {
  const key = encodeURIComponent(code.trim());
  await fetch(`${DB}/demon/${key}.json`, { method: "DELETE" });
}

/* ------------------------- Apple of fortune signals ------------------------ */

/** m1..m50 values, m1 = bottom-left cell. 1 = rotten, 0 = good */
export async function getAppleSignals(): Promise<number[]> {
  const res = await fetch(`${DB}/m11.json?_=${Date.now()}`);
  if (!res.ok) throw new Error("failed to load signals");
  const data = (await res.json()) as Record<
    string,
    Record<string, string>
  > | null;
  return Array.from({ length: 50 }, (_, i) => {
    const k = `m${i + 1}`;
    const raw = data?.[k]?.[k];
    return Number(raw ?? 0) === 1 ? 1 : 0;
  });
}

/** rotten count per row, bottom row first */
const ROW_ROTTEN = [1, 1, 1, 1, 2, 2, 2, 3, 3, 4];

export function generateAppleSignals(): number[] {
  const values = Array.from({ length: 50 }, () => 0);
  ROW_ROTTEN.forEach((count, row) => {
    const cols = [0, 1, 2, 3, 4].sort(() => Math.random() - 0.5).slice(0, count);
    for (const col of cols) values[row * 5 + col] = 1;
  });
  return values;
}

export async function setAppleSignals(values: number[]): Promise<void> {
  const payload: Record<string, Record<string, string>> = {};
  values.forEach((v, i) => {
    const k = `m${i + 1}`;
    payload[k] = { [k]: String(v) };
  });
  const res = await fetch(`${DB}/m11.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("failed to save signals");
}
