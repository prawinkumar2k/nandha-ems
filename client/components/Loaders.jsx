import { Loader2 } from "lucide-react";

/**
 * PageLoader – full-page centered spinner
 */
export function PageLoader({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-primary/20 animate-spin border-t-primary" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      </div>
      <p className="text-muted-foreground text-sm font-medium">{message}</p>
    </div>
  );
}

/**
 * InlineLoader – compact spinner for buttons/sections
 */
export function InlineLoader({ size = "sm", className = "" }) {
  const sizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };
  return (
    <Loader2
      className={`animate-spin text-current ${sizes[size] || sizes.sm} ${className}`}
    />
  );
}

/**
 * CardSkeleton – placeholder cards during data fetching
 */
export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3 animate-pulse">
      <div className="h-3 w-2/5 bg-muted rounded-full" />
      <div className="h-8 w-1/3 bg-muted rounded-full" />
    </div>
  );
}

/**
 * TableSkeleton – placeholder rows during data fetching
 */
export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-4 bg-muted rounded-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

export default PageLoader;
