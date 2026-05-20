import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { DollarSign, Package, PackageX, Truck } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { getDeliveries } from "@/api/deliveryApi";
import { getItems } from "@/api/itemApi";

export default function Dashboard() {
  const deliveriesQ = useQuery({ queryKey: ["deliveries"], queryFn: getDeliveries });
  const itemsQ = useQuery({ queryKey: ["items"], queryFn: getItems });

  const deliveries = deliveriesQ.data ?? [];
  const items = itemsQ.data ?? [];

  const stats = useMemo(() => {
    const unassigned = items.filter((i) => i.delivery_id == null);
    const profit = deliveries.reduce((sum, d) => {
      const totalWeight = items
        .filter((i) => i.delivery_id === d.id)
        .reduce((s, i) => s + Number(i.item_weight || 0), 0);
      return sum + (Number(d.sell_price) - Number(d.buy_price)) * totalWeight;
    }, 0);
    return {
      totalDeliveries: deliveries.length,
      totalItems: items.length,
      unassigned: unassigned.length,
      profit,
    };
  }, [deliveries, items]);

  const recent = [...deliveries].slice(-5).reverse();
  const unassignedItems = items.filter((i) => i.delivery_id == null).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Deliveries" value={stats.totalDeliveries} icon={Truck} accent="primary" />
        <StatCard label="Items" value={stats.totalItems} icon={Package} accent="info" />
        <StatCard label="Unassigned" value={stats.unassigned} icon={PackageX} accent="warning" />
        <StatCard
          label="Total Profit"
          value={`${stats.profit.toFixed(2)} QAR`}
          icon={DollarSign}
          accent="success"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Recent deliveries</h2>
            <Link to="/deliveries" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          {deliveriesQ.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No deliveries yet.</p>
          ) : (
            <ul className="divide-y">
              {recent.map((d) => (
                <li key={d.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link to={`/deliveries/${d.id}`} className="font-medium hover:underline truncate block">
                      {d.delivery_name}
                    </Link>
                    <p className="text-xs text-muted-foreground truncate">
                      {d.courier} · {d.type}
                    </p>
                  </div>
                  <StatusBadge status={d.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Unassigned items</h2>
            <Link to="/items" className="text-sm text-primary hover:underline">Manage</Link>
          </div>
          {itemsQ.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : unassignedItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">All items are assigned.</p>
          ) : (
            <ul className="divide-y">
              {unassignedItems.map((i) => (
                <li key={i.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{i.item_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{i.customer}</p>
                  </div>
                  <span className="text-sm font-medium">{Number(i.item_weight).toFixed(2)} kg</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}