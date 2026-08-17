import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Play, Plus, RotateCcw } from "lucide-react";
import { TopBar } from "@/components/dark-vip/TopBar";
import { LiveWins } from "@/components/dark-vip/LiveWins";
import { BrandName } from "@/components/dark-vip/BrandName";
import { CodeTimer, useCodeGuard } from "@/components/dark-vip/CodeTimer";
import logo from "@/assets/brand-logo.jpg";

export const Route = createFileRoute("/mines")({
  head: () => ({
    meta: [
      { title: "Mines — DARK BET" },
      {
        name: "description",
        content:
          "لوحة إشارات Mines داخل DARK BET: شبكة 5×5 مع اختيار عدد الألماس.",
      },
      { property: "og:title", content: "Mines — DARK BET" },
      {
        property: "og:description",
        content: "اختر عدد الألماس واضغط بدأ لعرض إشارات Mines.",
      },
    ],
  }),
  component: MinesPage,
});

const DIAMOND =
  "https://cdn.phototourl.com/free/2026-08-17-e3b71f26-b498-4c17-a686-b7c4abd7f85a.png";
const PRESETS = [1, 3, 5, 10, 15];

function MinesPage() {
  const { session, ready } = useCodeGuard();
  const [count, setCount] = useState(3);
  const [cells, setCells] = useState<boolean[] | null>(null);

  const clamp = (n: number) => Math.min(24, Math.max(1, n));

  const start = () => {
    const idx = Array.from({ length: 25 }, (_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = idx[i]!;
      idx[i] = idx[j]!;
      idx[j] = tmp;
    }
    const picked = new Set(idx.slice(0, count));
    setCells(Array.from({ length: 25 }, (_, i) => picked.has(i)));
  };

  const restart = () => setCells(null);

  if (!ready || !session) return null;

  return (
    <div className="min-h-screen">
      <TopBar backTo="/login" usersOnline={4821} />

      <main className="mx-auto w-full max-w-xl px-5 pb-16">
        <section className="mt-6 flex flex-col items-center">
          <img
            src={logo}
            alt="شعار DARK BET"
            width={112}
            height={112}
            className="size-20 object-contain drop-shadow-[0_0_25px_rgba(212,175,55,0.35)]"
          />
          <BrandName className="mt-3 text-lg" />
          <p className="mt-1 font-display text-[10px] tracking-[0.4em] text-primary">
            MINES
          </p>
        </section>

        <CodeTimer session={session} />

        <section className="surface-card mt-5 rounded-3xl p-4">
          <div className="mx-auto grid w-fit grid-cols-5 gap-2">
            {Array.from({ length: 25 }).map((_, i) => (
              <span
                key={i}
                className="flex size-[70px] items-center justify-center overflow-hidden rounded-[20px] border border-border bg-secondary/30"
              >
                {cells?.[i] ? (
                  <img
                    src={DIAMOND}
                    alt=""
                    loading="lazy"
                    className="size-full object-contain p-1.5"
                  />
                ) : null}
              </span>
            ))}
          </div>
        </section>

        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setCount((c) => clamp(c - 1))}
            aria-label="ناقص"
            className="flex size-11 items-center justify-center rounded-[15px] border border-border bg-secondary/40 text-foreground active:scale-95"
          >
            <Minus className="size-4" />
          </button>
          <input
            value={count}
            onChange={(e) => {
              const n = Number(e.target.value.replace(/\D/g, ""));
              setCount(Number.isFinite(n) && n > 0 ? clamp(n) : 1);
            }}
            inputMode="numeric"
            className="h-11 w-24 rounded-[15px] border border-input bg-secondary/40 text-center font-display text-lg font-extrabold text-foreground outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={() => setCount((c) => clamp(c + 1))}
            aria-label="زائد"
            className="flex size-11 items-center justify-center rounded-[15px] border border-border bg-secondary/40 text-foreground active:scale-95"
          >
            <Plus className="size-4" />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setCount(p)}
              className={`flex h-[30px] w-[70px] items-center justify-center rounded-[12px] border font-display text-sm font-bold transition-colors ${
                count === p
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border bg-secondary/30 text-muted-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={start}
            className="flex h-12 items-center justify-center gap-2 rounded-[15px] bg-foreground font-display text-sm font-extrabold text-background shadow-lg transition-transform active:scale-[0.98]"
          >
            <Play className="size-4" />
            بدأ
          </button>
          <button
            onClick={restart}
            className="bg-gold flex h-12 items-center justify-center gap-2 rounded-[15px] font-display text-sm font-extrabold text-primary-foreground transition-transform active:scale-[0.98]"
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
