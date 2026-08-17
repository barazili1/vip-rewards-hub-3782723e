import { useNavigate } from "@tanstack/react-router";
import { Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { deleteCode } from "@/lib/firebase";
import {
  clearSession,
  formatRemaining,
  readSession,
  type ActiveSession,
} from "@/lib/session";

/** Guards a game page with an active code and renders a countdown. */
export function useCodeGuard() {
  const navigate = useNavigate();
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const current = readSession();
    setReady(true);
    if (!current) {
      void navigate({ to: "/" });
      return;
    }
    setSession(current);
  }, [navigate]);

  return { session, ready };
}

export function CodeTimer({ session }: { session: ActiveSession }) {
  const navigate = useNavigate();
  const [left, setLeft] = useState<number | null>(
    session.expiresAt === null ? null : session.expiresAt - Date.now(),
  );

  useEffect(() => {
    if (session.expiresAt === null) return;
    const id = window.setInterval(() => {
      const remaining = session.expiresAt! - Date.now();
      setLeft(remaining);
      if (remaining <= 0) {
        window.clearInterval(id);
        clearSession();
        void deleteCode(session.code).catch(() => {});
        void navigate({ to: "/" });
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [session, navigate]);

  const isLow = left !== null && left < 60_000;

  return (
    <div
      className={`mt-5 flex items-center justify-between rounded-[15px] border px-4 py-3 backdrop-blur-md ${
        isLow
          ? "border-destructive/50 bg-destructive/10"
          : "border-primary/30 bg-primary/5"
      }`}
    >
      <div className="flex items-center gap-2">
        <Timer
          className={`size-4 ${isLow ? "text-destructive" : "text-primary"}`}
        />
        <span className="font-display text-[10px] tracking-[0.3em] text-muted-foreground">
          CODE TIME LEFT
        </span>
      </div>
      <span
        className={`font-display text-lg font-extrabold tabular-nums ${
          isLow ? "text-destructive" : "text-foreground"
        }`}
      >
        {left === null ? "LIFETIME" : formatRemaining(left)}
      </span>
    </div>
  );
}
