import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DeliveryStatus } from "@/api/types";

const map: Record<DeliveryStatus, string> = {
  Processed: "bg-warning/15 text-warning border-warning/30",
  "On The Way": "bg-info/15 text-info border-info/30",
  Arrived: "bg-success/15 text-success border-success/30",
};

export const StatusBadge = ({ status }: { status: DeliveryStatus }) => (
  <Badge variant="outline" className={cn("font-medium", map[status])}>
    {status}
  </Badge>
);