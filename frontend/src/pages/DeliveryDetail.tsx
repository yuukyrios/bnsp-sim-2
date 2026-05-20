import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Plus, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/StatusBadge";
import { WeightBar } from "@/components/WeightBar";
import { ItemForm } from "@/components/forms/ItemForm";
import { getDeliveries, updateDelivery } from "@/api/deliveryApi";
import { createItem, deleteItem, getItems, updateItem } from "@/api/itemApi";
import { DELIVERY_STATUSES, type DeliveryStatus, type Item } from "@/api/types";
import { toast } from "@/hooks/use-toast";

export default function DeliveryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const did = Number(id);

  const deliveriesQ = useQuery({ queryKey: ["deliveries"], queryFn: getDeliveries });
  const itemsQ = useQuery({ queryKey: ["items"], queryFn: getItems });

  const delivery = deliveriesQ.data?.find((d) => d.id === did);
  const linked = (itemsQ.data ?? []).filter((i) => i.delivery_id === did);
  const unassigned = (itemsQ.data ?? []).filter((i) => i.delivery_id == null);

  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const totals = useMemo(() => {
    const totalWeight = linked.reduce((s, i) => s + Number(i.item_weight || 0), 0);
    const profit = delivery
      ? (Number(delivery.sell_price) - Number(delivery.buy_price)) * totalWeight
      : 0;
    const overloaded = !!delivery && totalWeight > Number(delivery.weight_limit);
    const remaining = delivery ? Number(delivery.weight_limit) - totalWeight : 0;
    return { totalWeight, profit, overloaded, remaining };
  }, [linked, delivery]);

  const statusM = useMutation({
    mutationFn: (status: DeliveryStatus) => updateDelivery(did, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["deliveries"] }),
  });

  const createItemM = useMutation({
    mutationFn: (v: any) => createItem(v),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items"] });
      toast({ title: "Item added" });
      setOpen(false);
      setEditingItem(null);
    },
    onError: (e: any) => toast({ title: "Failed", description: e?.response?.data?.message || e.message, variant: "destructive" }),
  });

  const updateItemM = useMutation({
    mutationFn: ({ id, v }: { id: number; v: any }) => updateItem(id, v),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items"] });
      toast({ title: "Item updated" });
      setOpen(false);
      setEditingItem(null);
    },
    onError: (e: any) => toast({ title: "Failed", description: e?.response?.data?.message || e.message, variant: "destructive" }),
  });

  const removeItemM = useMutation({
    mutationFn: (iid: number) => deleteItem(iid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items"] });
      toast({ title: "Item deleted" });
    },
  });

  const unassignM = useMutation({
    mutationFn: (iid: number) => updateItem(iid, { delivery_id: null }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items"] });
      toast({ title: "Item unassigned" });
    },
  });

  const assignM = useMutation({
    mutationFn: (iid: number) => updateItem(iid, { delivery_id: did }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items"] });
      toast({ title: "Item assigned" });
    },
    onError: (e: any) => toast({ title: "Failed", description: e?.response?.data?.message || e.message, variant: "destructive" }),
  });

  if (deliveriesQ.isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!delivery) {
    return (
      <div className="space-y-3">
        <Button variant="ghost" onClick={() => navigate("/deliveries")}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
        </Button>
        <p>Delivery not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Button variant="ghost" asChild>
          <Link to="/deliveries"><ArrowLeft className="h-4 w-4 mr-1.5" /> All deliveries</Link>
        </Button>
        <div className="flex items-center gap-2">
          <Select value={delivery.status} onValueChange={(v) => statusM.mutate(v as DeliveryStatus)}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {DELIVERY_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {totals.overloaded && (
        <div className="rounded-md bg-destructive/10 text-destructive px-4 py-3 flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4" />
          This delivery is overloaded ({totals.totalWeight.toFixed(2)} kg / {delivery.weight_limit} kg).
        </div>
      )}

      <Card className="p-5">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-semibold">{delivery.delivery_name}</h2>
            <p className="text-sm text-muted-foreground">
              Courier: <span className="text-foreground font-medium">{delivery.courier}</span> · {delivery.type}
            </p>
          </div>
          <StatusBadge status={delivery.status} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          <div>
            <p className="text-xs text-muted-foreground">Buy / Sell</p>
            <p className="font-medium">{delivery.buy_price} / {delivery.sell_price} QAR</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Items</p>
            <p className="font-medium">{linked.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total weight</p>
            <p className="font-medium">{totals.totalWeight.toFixed(2)} kg</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Profit</p>
            <p className="font-medium">{totals.profit.toFixed(2)} QAR</p>
          </div>
        </div>
        <div className="mt-4">
          <WeightBar used={totals.totalWeight} limit={Number(delivery.weight_limit)} />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b flex-wrap gap-3">
          <h3 className="font-semibold">Assigned items</h3>
          <div className="flex items-center gap-2">
            {unassigned.length > 0 && (
              <Select onValueChange={(v) => assignM.mutate(Number(v))}>
                <SelectTrigger className="w-[220px]"><SelectValue placeholder="Assign existing item…" /></SelectTrigger>
                <SelectContent>
                  {unassigned.map((i) => {
                    const fits = Number(i.item_weight) <= totals.remaining;
                    return (
                      <SelectItem key={i.id} value={String(i.id)} disabled={!fits}>
                        {i.item_name} ({i.customer}) · {Number(i.item_weight).toFixed(2)} kg{!fits ? " — too heavy" : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
            <Button onClick={() => { setEditingItem(null); setOpen(true); }}>
              <Plus className="h-4 w-4 mr-1.5" /> New item
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Weight</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linked.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No items assigned yet.</TableCell></TableRow>
              ) : linked.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-medium">{i.item_name}</TableCell>
                  <TableCell>{i.customer}</TableCell>
                  <TableCell className="text-right">{Number(i.item_weight).toFixed(2)} kg</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingItem(i); setOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => unassignM.mutate(i.id)}>
                        Unassign
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => removeItemM.mutate(i.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditingItem(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit item" : "New item"}</DialogTitle>
          </DialogHeader>
          <ItemForm
            initial={editingItem ?? undefined}
            deliveries={deliveriesQ.data ?? []}
            items={itemsQ.data ?? []}
            lockedDeliveryId={editingItem ? undefined : did}
            submitting={createItemM.isPending || updateItemM.isPending}
            onCancel={() => { setOpen(false); setEditingItem(null); }}
            onSubmit={(v) => editingItem ? updateItemM.mutate({ id: editingItem.id, v }) : createItemM.mutate(v)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}