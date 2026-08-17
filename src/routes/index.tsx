import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import logo from "@/assets/brand-logo.jpg";
import { BrandName } from "@/components/dark-vip/BrandName";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DARK VIP — نادي التوقعات الحصري" },
      {
        name: "description",
        content:
          "DARK VIP تطبيق حصري للأعضاء: سجّل الدخول بكودك واستمتع بتجربة أنيقة بثيم أسود وذهبي.",
      },
      { property: "og:title", content: "DARK VIP — نادي التوقعات الحصري" },
      {
        property: "og:description",
        content: "دخول حصري بالكود لأعضاء DARK VIP.",
      },
    ],
  }),
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const id = window.setInterval(() => {
      setProgress(Math.min(100, ((Date.now() - start) / 3000) * 100));
    }, 30);
    const timeout = window.setTimeout(() => navigate({ to: "/login" }), 3050);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-8">
      <img
        src={logo}
        alt="شعار DARK VIP"
        width={816}
        height={816}
        className="animate-glow-pulse size-36 object-contain"
      />

      <h1 className="animate-rise mt-8">
        <BrandName className="text-4xl" />
      </h1>

      <p className="animate-rise mt-3 text-[11px] tracking-[0.4em] text-muted-foreground">
        EXCLUSIVE MEMBERS CLUB
      </p>

      <div className="mt-12 w-full max-w-[240px]">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="bg-gold shine h-full rounded-full transition-[width] duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-3 flex justify-between text-[10px] tracking-widest text-muted-foreground">
          <span>LOADING</span>
          <span className="font-display text-primary">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    </main>
  );
}
