import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { ItemForm } from "@/components/forms/ItemForm";
import { createItem, deleteItem, getItems, updateItem } from "@/api/itemApi";
import { getDeliveries } from "@/api/deliveryApi";
import type { Item } from "@/api/types";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

export default function Items() {
  const qc = useQueryClient();
  const itemsQ = useQuery({ queryKey: ["items"], queryFn: getItems });
  const deliveriesQ = useQuery({ queryKey: ["deliveries"], queryFn: getDeliveries });

  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Item | null>(null);

  const items = itemsQ.data ?? [];
  const deliveries = deliveriesQ.data ?? [];
  const deliveryName = useMemo(() => {
    const m = new Map<number, string>();
    deliveries.forEach((d) => m.set(d.id, d.delivery_name));
    return m;
  }, [deliveries]);

  const filtered = items.filter((i) => {
    if (tab === "assigned" && i.delivery_id == null) return false;
    if (tab === "unassigned" && i.delivery_id != null) return false;
    if (search && !`${i.item_name} ${i.customer}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const createM = useMutation({
    mutationFn: (v: any) => createItem(v),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["items"] }); toast({ title: "Item created" }); setOpen(false); setEditing(null); },
    onError: (e: any) => toast({ title: "Failed", description: e?.response?.data?.message || e.message, variant: "destructive" }),
  });
  const updateM = useMutation({
    mutationFn: ({ id, v }: { id: number; v: any }) => updateItem(id, v),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["items"] }); toast({ title: "Item updated" }); setOpen(false); setEditing(null); },
    onError: (e: any) => toast({ title: "Failed", description: e?.response?.data?.message || e.message, variant: "destructive" }),
  });
  const deleteM = useMutation({
    mutationFn: (id: number) => deleteItem(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["items"] }); toast({ title: "Item deleted" }); setConfirmDelete(null); },
  });

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="assigned">Assigned</TabsTrigger>
              <TabsTrigger value="unassigned">Unassigned</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by item or customer" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
          </div>
          <Button onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus className="h-4 w-4 mr-1.5" /> New item
          </Button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Weight</TableHead>
                <TableHead>Delivery</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itemsQ.isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Loading…</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No items.</TableCell></TableRow>
              ) : filtered.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-medium">{i.item_name}</TableCell>
                  <TableCell>{i.customer}</TableCell>
                  <TableCell className="text-right">{Number(i.item_weight).toFixed(2)} kg</TableCell>
                  <TableCell>
                    {i.delivery_id == null ? (
                      <Badge variant="outline" className="bg-warning/15 text-warning border-warning/30">Unassigned</Badge>
                    ) : (
                      <Link to={`/deliveries/${i.delivery_id}`} className="text-primary hover:underline">
                        {i.delivery_name || deliveryName.get(i.delivery_id) || `#${i.delivery_id}`}
                      </Link>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(i); setOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setConfirmDelete(i)}>
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

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit item" : "New item"}</DialogTitle>
          </DialogHeader>
          <ItemForm
            initial={editing ?? undefined}
            deliveries={deliveries}
            items={items}
            submitting={createM.isPending || updateM.isPending}
            onCancel={() => { setOpen(false); setEditing(null); }}
            onSubmit={(v) => editing ? updateM.mutate({ id: editing.id, v }) : createM.mutate(v)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete item?</AlertDialogTitle>
            <AlertDialogDescription>{confirmDelete?.item_name} will be permanently removed.</AlertDialogDescription>
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