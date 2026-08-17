export function BrandName({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-extrabold tracking-[0.25em] ${className}`}>
      <span className="text-gold">DARK</span>
      <span className="text-foreground"> VIP</span>
    </span>
  );
}
