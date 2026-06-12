import { Loader2 } from "lucide-react";

export function Spinner({ size = "md", className = "" }) {
  const s = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-10 h-10", xl: "w-14 h-14" };
  return <Loader2 className={`animate-spin text-primary ${s[size] || s.md} ${className}`} />;
}

export function PageLoader({ message = "Loading…" }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      </div>
      <p className="text-sm text-muted-foreground font-medium">{message}</p>
    </div>
  );
}

export function SectionLoader({ rows = 3 }) {
  return (
    <div className="space-y-3 animate-pulse p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-muted shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3 bg-muted rounded-full w-3/4" />
            <div className="h-3 bg-muted rounded-full w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="h-3 w-2/5 bg-muted rounded-full" />
          <div className="h-7 w-1/3 bg-muted rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function Overlay() {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <Spinner size="xl" />
    </div>
  );
}

export default PageLoader;
