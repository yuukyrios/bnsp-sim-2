import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Delivery, Item } from "@/api/types";

const UNASSIGNED = "__unassigned__";

const schema = z.object({
  item_name: z.string().trim().min(1, "Required").max(100),
  customer: z.string().trim().min(1, "Required").max(100),
  item_weight: z.coerce.number().min(0.01, "Must be > 0"),
  delivery_id: z.string(),
});

export type ItemFormValues = z.output<typeof schema>;
type ItemFormInput = z.input<typeof schema>;

interface Props {
  initial?: Partial<Item>;
  deliveries: Delivery[];
  items: Item[];
  onSubmit: (values: { item_name: string; customer: string; item_weight: number; delivery_id: number | null }) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
  lockedDeliveryId?: number;
}

export const ItemForm = ({ initial, deliveries, items, onSubmit, onCancel, submitting, lockedDeliveryId }: Props) => {
  const form = useForm<ItemFormInput, unknown, ItemFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      item_name: initial?.item_name ?? "",
      customer: initial?.customer ?? "",
      item_weight: initial?.item_weight ?? 1,
      delivery_id:
        lockedDeliveryId != null
          ? String(lockedDeliveryId)
          : initial?.delivery_id != null
            ? String(initial.delivery_id)
            : UNASSIGNED,
    },
  });

  const selected = form.watch("delivery_id");
  const weight = Number(form.watch("item_weight")) || 0;

  const capacity = useMemo(() => {
    if (selected === UNASSIGNED) return null;
    const id = Number(selected);
    const d = deliveries.find((x) => x.id === id);
    if (!d) return null;
    const used = items
      .filter((it) => it.delivery_id === id && it.id !== initial?.id)
      .reduce((sum, it) => sum + Number(it.item_weight || 0), 0);
    const remaining = d.weight_limit - used;
    return { d, used, remaining };
  }, [selected, deliveries, items, initial?.id]);

  const willOverflow = capacity ? weight > capacity.remaining : false;

  const submit = form.handleSubmit((values) => {
    if (willOverflow) return;
    onSubmit({
      item_name: values.item_name,
      customer: values.customer,
      item_weight: Number(values.item_weight),
      delivery_id: values.delivery_id === UNASSIGNED ? null : Number(values.delivery_id),
    });
  });

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="item_name">Item name</Label>
          <Input id="item_name" {...form.register("item_name")} placeholder="Lapis Legit" />
          {form.formState.errors.item_name && (
            <p className="text-xs text-destructive">{form.formState.errors.item_name.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="customer">Customer</Label>
          <Input id="customer" {...form.register("customer")} placeholder="Nuri" />
          {form.formState.errors.customer && (
            <p className="text-xs text-destructive">{form.formState.errors.customer.message}</p>
          )}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="item_weight">Weight (kg)</Label>
          <Input id="item_weight" type="number" step="0.01" {...form.register("item_weight")} />
          {form.formState.errors.item_weight && (
            <p className="text-xs text-destructive">{form.formState.errors.item_weight.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Delivery</Label>
          <Select
            value={form.watch("delivery_id")}
            onValueChange={(v) => form.setValue("delivery_id", v)}
            disabled={lockedDeliveryId != null}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
              {deliveries.map((d) => (
                <SelectItem key={d.id} value={String(d.id)}>
                  {d.delivery_name} ({d.courier})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {capacity && (
        <div className={`rounded-md p-3 text-sm ${willOverflow ? "bg-destructive/10 text-destructive" : "bg-muted/50"}`}>
          {capacity.d.delivery_name}: {capacity.used.toFixed(2)} / {capacity.d.weight_limit} kg used —
          remaining {capacity.remaining.toFixed(2)} kg.
          {willOverflow && " This item exceeds the limit."}
        </div>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={submitting || willOverflow}>{submitting ? "Saving…" : "Save"}</Button>
      </div>
    </form>
  );
};