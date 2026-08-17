import { useEffect, useState } from "react";

type Win = { id: string; bet: number; win: number };

function randomId() {
  const a = Math.floor(10 + Math.random() * 89);
  const b = Math.floor(10 + Math.random() * 89);
  return `${a}*******${b}`;
}

function randomWin(): Win {
  const bets = [20, 40, 50, 75, 100, 120, 200, 250];
  const bet = bets[Math.floor(Math.random() * bets.length)] ?? 50;

  const mult = 1.5 + Math.random() * 8;
  return { id: randomId(), bet, win: Math.round(bet * mult) };
}

const SEED: Win[] = [
  { id: "27*******81", bet: 50, win: 300 },
  { id: "41*******06", bet: 100, win: 640 },
  { id: "63*******19", bet: 20, win: 148 },
  { id: "18*******74", bet: 200, win: 910 },
  { id: "92*******35", bet: 75, win: 412 },
];

export function LiveWins() {
  const [rows, setRows] = useState<Win[]>(SEED);

  useEffect(() => {
    const t = setInterval(() => {
      setRows((prev) => [randomWin(), ...prev].slice(0, 5));
    }, 2200);
    return () => clearInterval(t);
  }, []);


  return (
    <section className="surface-card mt-6 overflow-hidden rounded-3xl">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="font-display text-[10px] font-bold tracking-[0.3em] text-primary">
          LATEST WINS
        </p>
        <span className="flex items-center gap-2 text-[10px] tracking-widest text-muted-foreground">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-70" />
            <span className="relative inline-flex size-2 rounded-full bg-accent" />
          </span>
          LIVE
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 border-b border-border px-4 py-2 font-display text-[10px] font-bold tracking-[0.12em] text-muted-foreground">
        <span>User id</span>
        <span className="text-center">BetAmount</span>
        <span className="text-right">WinAmount</span>
      </div>
      {rows.map((w, i) => (
        <div
          key={`${w.id}-${i}`}
          className="grid animate-rise grid-cols-3 gap-2 border-b border-border/60 px-4 py-2.5 text-xs last:border-0"
        >
          <span className="font-display text-foreground">{w.id}</span>
          <span className="text-center text-muted-foreground">{w.bet}</span>
          <span className="text-right font-display font-bold text-primary">
            {w.win}
          </span>
        </div>
      ))}
    </section>
  );
}
