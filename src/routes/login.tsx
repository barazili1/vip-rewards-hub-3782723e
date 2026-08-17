import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Eye,
  EyeOff,
  KeyRound,
  LifeBuoy,
  Loader2,
  UserPlus,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import logo from "@/assets/brand-logo.jpg";
import gameApple from "@/assets/game-apple.jpg";
import gameCrash from "@/assets/game-crash.jpg";
import { BrandName } from "@/components/dark-vip/BrandName";
import { TopBar } from "@/components/dark-vip/TopBar";
import { getCode } from "@/lib/firebase";
import { clearSession, saveSession } from "@/lib/session";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول — DARK VIP" },
      {
        name: "description",
        content: "أدخل كود العضوية الخاص بك للدخول إلى تطبيق DARK VIP.",
      },
      { property: "og:title", content: "تسجيل الدخول — DARK VIP" },
      {
        property: "og:description",
        content: "أدخل كود العضوية الخاص بك للدخول إلى DARK VIP.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [code, setCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [checking, setChecking] = useState(false);
  const [picker, setPicker] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    const value = code.trim();
    if (!value) {
      toast.error("الرجاء إدخال الكود أولاً");
      return;
    }
    setChecking(true);
    try {
      const entry = await getCode(value);
      if (!entry) {
        clearSession();
        toast.error("الكود غير صحيح أو غير موجود");
        return;
      }
      if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
        clearSession();
        toast.error("انتهت صلاحية هذا الكود");
        return;
      }
      saveSession({ code: entry.code, expiresAt: entry.expiresAt ?? null });
      toast.success("تم التحقق من الكود بنجاح");
      setPicker(true);
    } catch {
      toast.error("تعذّر التحقق من الكود، حاول مرة أخرى");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen">
      <TopBar usersOnline={2481} />

      <main className="mx-auto w-full max-w-xl px-5 pt-10 pb-16">
        <section className="surface-card animate-rise glow px-6 py-9">
          <div className="flex flex-col items-center">
            <img
              src={logo}
              alt="شعار DARK VIP"
              loading="lazy"
              width={816}
              height={816}
              className="size-24 object-contain"
            />
            <h1 className="mt-5">
              <BrandName className="text-2xl" />
            </h1>
            <p className="mt-2 text-xs tracking-[0.3em] text-muted-foreground">
              MEMBERS LOGIN
            </p>
          </div>

          <div className="mt-9">
            <label
              htmlFor="code"
              className="mb-2 block text-sm text-muted-foreground"
            >
              كود الدخول
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-input bg-secondary/40 px-4 focus-within:border-primary focus-within:ring-2 focus-within:ring-ring">
              <KeyRound className="size-4 shrink-0 text-primary" />
              <input
                id="code"
                type={showCode ? "text" : "password"}
                autoComplete="off"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="أدخل الكود الخاص بك"
                className="h-13 w-full bg-transparent text-sm tracking-widest text-foreground outline-none placeholder:tracking-normal placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={() => setShowCode((v) => !v)}
                aria-label={showCode ? "إخفاء الكود" : "إظهار الكود"}
                className="shrink-0 text-muted-foreground transition-colors hover:text-primary"
              >
                {showCode ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          <button
            onClick={() => void handleLogin()}
            disabled={checking}
            className="mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-foreground font-display text-sm font-bold tracking-wide text-background transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            {checking ? <Loader2 className="size-4 animate-spin" /> : null}
            تسجيل الدخول
          </button>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <a
              href="https://t.me/B2BMEL"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-secondary/40 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              <LifeBuoy className="size-4 text-primary" />
              تحتاج لمساعدة
            </a>
            <Link
              to="/terms"
              className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-primary/50 bg-primary/10 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
            >
              <UserPlus className="size-4" />
              إنشاء حساب
            </Link>
          </div>
        </section>

        <p className="mt-8 text-center text-[11px] tracking-widest text-muted-foreground">
          DARK VIP © {new Date().getFullYear()}
        </p>
      </main>

      {picker ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-6 backdrop-blur-md">
          <div className="surface-card animate-rise relative w-full max-w-sm rounded-3xl p-6 text-center">
            <button
              onClick={() => setPicker(false)}
              aria-label="إغلاق"
              className="absolute left-4 top-4 flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground"
            >
              <X className="size-4" />
            </button>
            <p className="font-display text-[10px] tracking-[0.4em] text-primary">
              ACCESS GRANTED
            </p>
            <h3 className="mt-2 font-display text-lg font-extrabold text-foreground">
              اختر اللعبة
            </h3>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={() => void navigate({ to: "/aviator" })}
                className="group relative h-[100px] w-[150px] overflow-hidden rounded-[15px] border border-border"
              >
                <img src={gameCrash} alt="Aviator" className="size-full object-cover" />
                <span className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                <span className="absolute inset-x-0 bottom-1.5 font-display text-[11px] font-bold text-foreground">
                  Aviator
                </span>
              </button>
              <button
                onClick={() => void navigate({ to: "/apple" })}
                className="group relative h-[100px] w-[150px] overflow-hidden rounded-[15px] border border-primary/50"
              >
                <img src={gameApple} alt="Apple of fortune" className="size-full object-cover" />
                <span className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                <span className="absolute inset-x-0 bottom-1.5 font-display text-[11px] font-bold text-primary">
                  Apple of fortune
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
