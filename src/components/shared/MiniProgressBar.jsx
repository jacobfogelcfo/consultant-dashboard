import { cn } from "@/lib/utils";

export function MiniProgressBar({ value, max, color = "#6366f1", className, showWarning = true }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const isOver = value > max;
  const isWarning = pct > 80 && !isOver;

  return (
    <div className={cn("w-full h-1.5 bg-muted rounded-full overflow-hidden", className)}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${Math.min(100, pct)}%`,
          backgroundColor: isOver ? '#ef4444' : isWarning ? '#f59e0b' : color,
        }}
      />
    </div>
  );
}