import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "primary" | "success" | "warning" | "info";
  hint?: string;
}

const accentMap: Record<NonNullable<Props["accent"]>, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
};

export const StatCard = ({ label, value, icon: Icon, accent = "primary", hint }: Props) => {
  return (
    <Card className="p-5 flex items-center gap-4 shadow-[var(--shadow-card)]">
      <div className={cn("h-12 w-12 rounded-lg flex items-center justify-center", accentMap[accent])}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold leading-tight truncate">{value}</p>
        {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
      </div>
    </Card>
  );
};