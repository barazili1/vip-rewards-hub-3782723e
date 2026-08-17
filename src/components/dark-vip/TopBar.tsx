import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { BrandName } from "./BrandName";

export function TopBar({
  usersOnline,
  backTo,
}: {
  usersOnline?: number;
  backTo?: string;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/30 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-xl items-center justify-between px-5">
        <div className="flex items-center gap-3">
          {backTo ? (
            <Link
              to={backTo}
              aria-label="رجوع"
              className="flex size-9 items-center justify-center rounded-full border border-border text-primary transition-colors hover:bg-secondary"
            >
              <ArrowLeft className="size-4" />
            </Link>
          ) : null}
          <BrandName className="text-base" />
        </div>

        {typeof usersOnline === "number" ? (
          <div className="flex items-center gap-2 rounded-full border border-border bg-secondary/20 px-3 py-1.5">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-70" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            <span className="text-[11px] tracking-wide text-muted-foreground">
              Users Online :
            </span>
            <span className="font-display text-xs font-bold text-primary">
              {usersOnline.toLocaleString("en-US")}
            </span>
          </div>
        ) : null}
      </div>
    </header>
  );
}
