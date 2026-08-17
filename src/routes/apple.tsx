import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Play, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { TopBar } from "@/components/dark-vip/TopBar";
import { LiveWins } from "@/components/dark-vip/LiveWins";
import { BrandName } from "@/components/dark-vip/BrandName";
import { CodeTimer, useCodeGuard } from "@/components/dark-vip/CodeTimer";
import {
  generateAppleSignals,
  getAppleSignals,
  setAppleSignals,
} from "@/lib/firebase";
import { APPLE_SIGNAL_CODE } from "@/lib/session";
import logo from "@/assets/brand-logo.jpg";

export const Route = createFileRoute("/apple")({
  head: () => ({
    meta: [
      { title: "Apple of Fortune — DARK VIP" },
      {
        name: "description",
        content:
          "لوحة إشارات Apple of Fortune داخل DARK VIP: 10 صفوف مع الأودد الخاص بكل صف.",
      },
      { property: "og:title", content: "Apple of Fortune — DARK VIP" },
      {
        property: "og:description",
        content: "اضغط Start لعرض إشارات التفاح لكل صف.",
      },
    ],
  }),
  component: ApplePage,
});

const CELL_EMPTY = "https://logo12.gamer.gd/cvb.png";
const CELL_GOOD = "https://logo12.gamer.gd/apple.png";
const CELL_BAD = "https://logo12.gamer.gd/poi.png";

// من تحت لفوق: 1.23 ... 349.43
const ODDS = [1.23, 1.54, 1.93, 2.41, 4.02, 6.71, 11.18, 27.97, 69.93, 349.43];

/** local fallback signals (m1 = bottom-left) */
function localSignals() {
  return generateAppleSignals();
}

function ApplePage() {
  const { session, ready } = useCodeGuard();
  const [signals, setSignals] = useState<number[] | null>(null);
  const [busy, setBusy] = useState(false);

  const useFirebase = session?.code.trim().toUpperCase() === APPLE_SIGNAL_CODE;

  const start = async () => {
    setBusy(true);
    try {
      setSignals(useFirebase ? await getAppleSignals() : localSignals());
    } catch {
      toast.error("تعذّر تحميل التوقعات");
    } finally {
      setBusy(false);
    }
  };

  const restart = async () => {
    setSignals(null);
    if (!useFirebase) return;
    setBusy(true);
    try {
      const next = generateAppleSignals();
      await setAppleSignals(next);
      toast.success("تم تحديث التوقعات");
    } catch {
      toast.error("تعذّر تحديث التوقعات");
    } finally {
      setBusy(false);
    }
  };

  if (!ready || !session) return null;

  const rowsTopDown = [...ODDS].reverse();

  return (
    <div className="min-h-screen">
      <TopBar backTo="/login" />

      <main className="mx-auto w-full max-w-xl px-5 pb-16">
        <section className="mt-6 flex flex-col items-center">
          <img
            src={logo}
            alt="شعار DARK VIP"
            width={112}
            height={112}
            className="size-20 object-contain drop-shadow-[0_0_25px_rgba(212,175,55,0.35)]"
          />
          <BrandName className="mt-3 text-lg" />
          <p className="mt-1 font-display text-[10px] tracking-[0.4em] text-primary">
            APPLE OF FORTUNE
          </p>
        </section>

        <CodeTimer session={session} />

        <section className="surface-card mt-5 rounded-3xl p-4">
          <div className="flex flex-col gap-2">
            {rowsTopDown.map((odd, rowFromTop) => {
              const row = 9 - rowFromTop; // 0 = bottom row (m1..m5)
              return (
                <div key={odd} className="flex items-center justify-center gap-2">
                  <span className="w-14 shrink-0 text-left font-display text-[11px] font-bold text-primary">
                    {odd.toFixed(2)}
                  </span>
                  <div className="flex gap-2">
                    {Array.from({ length: 5 }).map((_, col) => {
                      const value = signals ? signals[row * 5 + col] : null;
                      const src =
                        value === null
                          ? CELL_EMPTY
                          : value === 1
                            ? CELL_BAD
                            : CELL_GOOD;
                      return (
                        <span
                          key={col}
                          className="flex size-[50px] items-center justify-center overflow-hidden rounded-[12px] border border-border bg-secondary/30"
                        >
                          <img
                            src={src}
                            alt=""
                            loading="lazy"
                            className="size-full object-contain p-0.5"
                          />
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={() => void start()}
            disabled={busy}
            className="flex h-12 items-center justify-center gap-2 rounded-[15px] bg-foreground font-display text-sm font-extrabold text-background shadow-lg transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Play className="size-4" />
            )}
            بدأ
          </button>
          <button
            onClick={() => void restart()}
            disabled={busy}
            className="bg-gold flex h-12 items-center justify-center gap-2 rounded-[15px] font-display text-sm font-extrabold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            <RotateCcw className="size-4" />
            اعاده بدأ
          </button>
        </div>

        <LiveWins />
      </main>
    </div>
  );
}
