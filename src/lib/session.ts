export type ActiveSession = {
  code: string;
  expiresAt: number | null;
};

const KEY = "dark-vip-session";
const ADMIN_KEY = "dark-vip-admin";
export const ADMIN_ID = "000111000";
export const APPLE_SIGNAL_CODE = "7ARFOUSHX11";

export function saveSession(session: ActiveSession) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(KEY, JSON.stringify(session));
}

export function readSession(): ActiveSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ActiveSession;
    if (!parsed?.code) return null;
    if (parsed.expiresAt !== null && parsed.expiresAt <= Date.now()) {
      clearSession();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(KEY);
}

export function grantAdmin() {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(ADMIN_KEY, "1");
}

export function isAdmin(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(ADMIN_KEY) === "1";
}

export function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
