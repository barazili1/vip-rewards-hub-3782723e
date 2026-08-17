import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Copy, KeyRound, Loader2, RefreshCw, Shuffle, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { TopBar } from "@/components/dark-vip/TopBar";
import { deleteCode, listCodes, saveCode, type CodeEntry } from "@/lib/firebase";
import { formatRemaining, isAdmin } from "@/lib/session";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "لوحة تحكم الأكواد — DARK VIP" },
      {
        name: "description",
        content: "لوحة الأدمن لإنشاء أكواد الدخول وتحديد مدة صلاحيتها في DARK VIP.",
      },
      { property: "og:title", content: "لوحة تحكم الأكواد — DARK VIP" },
      {
        property: "og:description",
        content: "إنشاء وإدارة أكواد الدخول المؤقتة لأعضاء DARK VIP.",
      },
    ],
  }),
  component: AdminPage,
});

const DURATIONS: { label: string; ms: number | null }[] = [
  { label: "30 دقيقة", ms: 30 * 60_000 },
  { label: "ساعة واحدة", ms: 60 * 60_000 },
  { label: "12 ساعة", ms: 12 * 60 * 60_000 },
  { label: "24 ساعة", ms: 24 * 60 * 60_000 },
  { label: "7 أيام", ms: 7 * 24 * 60 * 60_000 },
  { label: "مدى الحياة", ms: null },
];

function randomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part = (n: number) =>
    Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `DV-${part(4)}-${part(4)}`;
}

function AdminPage() {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(false);
  const [code, setCode] = useState("");
  const [durationIndex, setDurationIndex] = useState(0);
  const [codes, setCodes] = useState<CodeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!isAdmin()) {
      void navigate({ to: "/" });
      return;
    }
    setAllowed(true);
  }, [navigate]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setCodes(await listCodes());
    } catch {
      toast.error("تعذّر تحميل الأكواد");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!allowed) return;
    void refresh();
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [allowed, refresh]);

  if (!allowed) return null;

  const handleSave = async () => {
    const value = code.trim().toUpperCase();
    if (!value) {
      toast.error("أدخل نص الكود أولاً");
      return;
    }
    const duration = DURATIONS[durationIndex]!;
    setSaving(true);
    try {
      await saveCode({
        code: value,
        createdAt: Date.now(),
        expiresAt: duration.ms === null ? null : Date.now() + duration.ms,
        durationLabel: duration.label,
      });
      toast.success("تم حفظ وتفعيل الكود");
      setCode("");
      await refresh();
    } catch {
      toast.error("تعذّر حفظ الكود");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (value: string) => {
    await deleteCode(value);
    toast.success("تم حذف الكود");
    await refresh();
  };

  return (
    <div className="min-h-screen">
      <TopBar backTo="/login" usersOnline={2481} />

      <main className="mx-auto w-full max-w-xl px-5 pb-16 pt-6">
        <header className="text-center">
          <p className="font-display text-[10px] tracking-[0.45em] text-primary">
            DARK VIP PANEL
          </p>
          <h1 className="mt-2 font-display text-2xl font-extrabold text-foreground">
            لوحة تحكم الأكواد
          </h1>
        </header>

        <section className="surface-card animate-rise mt-6 rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-extrabold text-foreground">
              إنشاء مفتاح مرور جديد
            </h2>
            <span className="rounded-full border border-primary/50 bg-primary/15 px-2.5 py-0.5 font-display text-[10px] font-bold tracking-[0.18em] text-primary">
              GENERATOR
            </span>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">أدخل نص كود المرور</p>
          <div className="mt-2 grid grid-cols-[1fr_auto] gap-3">
            <div className="flex items-center gap-3 rounded-[15px] border border-input bg-secondary/40 px-4 focus-within:border-primary">
              <KeyRound className="size-4 text-primary" />
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="مثال : DARK-7738-VIP"
                className="h-12 w-full bg-transparent font-display text-sm tracking-[0.1em] outline-none placeholder:text-muted-foreground"
              />
            </div>
            <button
              onClick={() => setCode(randomCode())}
              className="flex h-12 items-center gap-2 rounded-[15px] border border-primary/40 bg-primary/10 px-4 font-display text-xs font-bold text-primary"
            >
              <Shuffle className="size-4" />
              توليد
            </button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">اختر مدة صلاحية الكود</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {DURATIONS.map((d, i) => (
              <button
                key={d.label}
                onClick={() => setDurationIndex(i)}
                className={`h-11 rounded-[15px] border text-xs font-semibold transition-colors ${
                  i === durationIndex
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-secondary/30 text-muted-foreground"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-[15px] bg-foreground font-display text-sm font-extrabold text-background disabled:opacity-60"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            حفظ وتفعيل الكود بالسيرفر
          </button>
        </section>

        <section className="surface-card animate-rise mt-5 rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-extrabold text-foreground">
              الأكواد الفعالة
            </h2>
            <button
              onClick={() => void refresh()}
              aria-label="تحديث"
              className="flex size-9 items-center justify-center rounded-full border border-border text-primary"
            >
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <ul className="mt-4 space-y-3">
            {codes.length === 0 && !loading ? (
              <li className="text-center text-xs text-muted-foreground">
                لا توجد أكواد بعد
              </li>
            ) : null}
            {codes.map((entry) => {
              const expired =
                entry.expiresAt !== null && entry.expiresAt <= now;
              return (
                <li
                  key={entry.code}
                  className={`flex items-center justify-between gap-3 rounded-[15px] border px-3 py-3 ${
                    expired
                      ? "border-destructive/40 bg-destructive/5"
                      : "border-primary/30 bg-primary/5"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-extrabold tracking-[0.1em] text-foreground">
                      {entry.code}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {entry.durationLabel} ·{" "}
                      <span className={expired ? "text-destructive" : "text-primary"}>
                        {expired
                          ? "منتهي"
                          : entry.expiresAt === null
                            ? "نشط"
                            : formatRemaining(entry.expiresAt - now)}
                      </span>
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => {
                        void navigator.clipboard.writeText(entry.code);
                        toast.success("تم نسخ الكود");
                      }}
                      aria-label="نسخ"
                      className="flex size-9 items-center justify-center rounded-[12px] border border-border text-foreground"
                    >
                      <Copy className="size-4" />
                    </button>
                    <button
                      onClick={() => void handleDelete(entry.code)}
                      aria-label="حذف"
                      className="flex size-9 items-center justify-center rounded-[12px] border border-destructive/50 text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </main>
    </div>
  );
}
