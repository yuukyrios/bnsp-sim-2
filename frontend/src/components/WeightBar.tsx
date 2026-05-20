import { cn } from "@/lib/utils";

interface Props {
  used: number;
  limit: number;
  showLabel?: boolean;
}

export const WeightBar = ({ used, limit, showLabel = true }: Props) => {
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const overloaded = used > limit;
  return (
    <div className="w-full min-w-[120px]">
      {showLabel && (
        <div className="flex justify-between text-xs mb-1">
          <span className={cn(overloaded && "text-destructive font-medium")}>
            {used.toFixed(1)} / {limit} kg
          </span>
          {overloaded && <span className="text-destructive font-medium">Overloaded</span>}
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            overloaded ? "bg-destructive" : pct > 85 ? "bg-warning" : "bg-primary",
          )}
          style={{ width: `${overloaded ? 100 : pct}%` }}
        />
      </div>
    </div>
  );
};