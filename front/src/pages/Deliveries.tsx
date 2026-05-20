import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Eye, Pencil, Plus, Search, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StatusBadge } from "@/components/StatusBadge";
import { WeightBar } from "@/components/WeightBar";
import { DeliveryForm, type DeliveryFormValues } from "@/components/forms/DeliveryForm";
import {
  createDelivery,
  deleteDelivery,
  getDeliveries,
  updateDelivery,
} from "@/api/deliveryApi";
import { getItems } from "@/api/itemApi";
import { DELIVERY_STATUSES, DELIVERY_TYPES, type Delivery } from "@/api/types";
import { toast } from "@/hooks/use-toast";

export default function Deliveries() {
  const qc = useQueryClient();
  const deliveriesQ = useQuery({ queryKey: ["deliveries"], queryFn: getDeliveries });
  const itemsQ = useQuery({ queryKey: ["items"], queryFn: getItems });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Delivery | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Delivery | null>(null);

  const deliveries = deliveriesQ.data ?? [];
  const items = itemsQ.data ?? [];

  const computed = useMemo(() => {
    const map = new Map<number, { totalWeight: number; itemCount: number; profit: number; overloaded: boolean }>();
    deliveries.forEach((d) => {
      const linked = items.filter((i) => i.delivery_id === d.id);
      const totalWeight = linked.reduce((s, i) => s + Number(i.item_weight || 0), 0);
      const profit = (Number(d.sell_price) - Number(d.buy_price)) * totalWeight;
      map.set(d.id, {
        totalWeight,
        itemCount: linked.length,
        profit,
        overloaded: totalWeight > Number(d.weight_limit),
      });
    });
    return map;
  }, [deliveries, items]);

  const filtered = deliveries.filter((d) => {
    if (statusFilter !== "all" && d.status !== statusFilter) return false;
    if (typeFilter !== "all" && d.type !== typeFilter) return false;
    if (search && !`${d.delivery_name} ${d.courier}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const createM = useMutation({
    mutationFn: (v: DeliveryFormValues) => createDelivery(v),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deliveries"] });
      toast({ title: "Delivery created" });
      setOpen(false);
    },
    onError: (e: any) => toast({ title: "Failed", description: e?.response?.data?.message || e.message, variant: "destructive" }),
  });

  const updateM = useMutation({
    mutationFn: ({ id, v }: { id: number; v: DeliveryFormValues }) => updateDelivery(id, v),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deliveries"] });
      toast({ title: "Delivery updated" });
      setOpen(false);
      setEditing(null);
    },
    onError: (e: any) => toast({ title: "Failed", description: e?.response?.data?.message || e.message, variant: "destructive" }),
  });

  const deleteM = useMutation({
    mutationFn: (id: number) => deleteDelivery(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deliveries"] });
      qc.invalidateQueries({ queryKey: ["items"] });
      toast({ title: "Delivery deleted" });
      setConfirmDelete(null);
    },
    onError: (e: any) => toast({ title: "Failed", description: e?.response?.data?.message || e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or courier"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {DELIVERY_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {DELIVERY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus className="h-4 w-4 mr-1.5" /> New delivery
          </Button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Courier</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="min-w-[180px]">Weight</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead className="text-right">Profit (QAR)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveriesQ.isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-10 text-muted-foreground">Loading…</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-10 text-muted-foreground">No deliveries found.</TableCell></TableRow>
              ) : filtered.map((d) => {
                const c = computed.get(d.id) ?? { totalWeight: 0, itemCount: 0, profit: 0, overloaded: false };
                return (
                  <TableRow key={d.id} className={c.overloaded ? "bg-destructive/5" : ""}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-1.5">
                        {c.overloaded && <AlertTriangle className="h-4 w-4 text-destructive" />}
                        <Link to={`/deliveries/${d.id}`} className="hover:underline">{d.delivery_name}</Link>
                      </div>
                    </TableCell>
                    <TableCell>{d.courier}</TableCell>
                    <TableCell className="text-sm">{d.type}</TableCell>
                    <TableCell><StatusBadge status={d.status} /></TableCell>
                    <TableCell><WeightBar used={c.totalWeight} limit={Number(d.weight_limit)} /></TableCell>
                    <TableCell className="text-right">{c.itemCount}</TableCell>
                    <TableCell className="text-right">{c.profit.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button asChild variant="ghost" size="icon">
                          <Link to={`/deliveries/${d.id}`}><Eye className="h-4 w-4" /></Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { setEditing(d); setOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setConfirmDelete(d)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit delivery" : "New delivery"}</DialogTitle>
          </DialogHeader>
          <DeliveryForm
            initial={editing ?? undefined}
            submitting={createM.isPending || updateM.isPending}
            onCancel={() => { setOpen(false); setEditing(null); }}
            onSubmit={(v) => editing ? updateM.mutate({ id: editing.id, v }) : createM.mutate(v)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete delivery?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDelete?.delivery_name} will be removed. Linked items may become unassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDelete && deleteM.mutate(confirmDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}