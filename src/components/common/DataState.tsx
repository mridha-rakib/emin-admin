import { AlertCircle, Inbox, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

/** Loading / error / empty placeholder used by every data-driven dashboard page. */
export function DataState({
  isLoading,
  error,
  isEmpty,
  emptyTitle,
  emptyDescription,
  onRetry,
  className,
}: {
  isLoading?: boolean;
  error?: string;
  isEmpty?: boolean;
  emptyTitle: string;
  emptyDescription?: string;
  onRetry?: () => void;
  className?: string;
}) {
  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center gap-2 rounded-2xl border border-border/80 bg-card py-14 text-sm text-muted-foreground", className)}>
        <RefreshCw className="h-4 w-4 animate-spin" />
        Loading…
      </div>
    );
  }
  if (error) {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 py-12 text-center", className)}>
        <AlertCircle className="h-6 w-6 text-destructive" />
        <p className="max-w-md text-sm font-medium text-destructive">{error}</p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted">
            Retry
          </button>
        )}
      </div>
    );
  }
  if (isEmpty) {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card py-14 text-center", className)}>
        <Inbox className="h-7 w-7 text-muted-foreground/60" />
        <p className="text-sm font-semibold text-foreground">{emptyTitle}</p>
        {emptyDescription && <p className="max-w-md text-xs text-muted-foreground">{emptyDescription}</p>}
      </div>
    );
  }
  return null;
}
