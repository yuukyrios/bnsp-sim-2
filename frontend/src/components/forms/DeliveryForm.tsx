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
import { DELIVERY_STATUSES, DELIVERY_TYPES, type Delivery } from "@/api/types";

const schema = z.object({
  delivery_name: z.string().trim().min(1, "Required").max(100),
  courier: z.string().trim().min(1, "Required").max(100),
  buy_price: z.coerce.number().min(0, "Must be ≥ 0"),
  sell_price: z.coerce.number().min(0, "Must be ≥ 0"),
  weight_limit: z.coerce.number().min(0.1, "Must be > 0"),
  type: z.enum(["Indonesia to Qatar", "Qatar to Indonesia"]),
  status: z.enum(["Processed", "On The Way", "Arrived"]),
});

export type DeliveryFormValues = z.output<typeof schema>;
type DeliveryFormInput = z.input<typeof schema>;

interface Props {
  initial?: Partial<Delivery>;
  onSubmit: (values: DeliveryFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
}

export const DeliveryForm = ({ initial, onSubmit, onCancel, submitting }: Props) => {
  const form = useForm<DeliveryFormInput, unknown, DeliveryFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      delivery_name: initial?.delivery_name ?? "",
      courier: initial?.courier ?? "",
      buy_price: initial?.buy_price ?? 0,
      sell_price: initial?.sell_price ?? 0,
      weight_limit: initial?.weight_limit ?? 20,
      type: (initial?.type as DeliveryFormInput["type"]) ?? "Indonesia to Qatar",
      status: (initial?.status as DeliveryFormInput["status"]) ?? "Processed",
    },
  });

  const buy = form.watch("buy_price");
  const sell = form.watch("sell_price");
  const limit = form.watch("weight_limit");
  const potential = (Number(sell) - Number(buy)) * Number(limit);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="delivery_name">Delivery name</Label>
          <Input id="delivery_name" {...form.register("delivery_name")} placeholder="Budi Trip April" />
          {form.formState.errors.delivery_name && (
            <p className="text-xs text-destructive">{form.formState.errors.delivery_name.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="courier">Courier name</Label>
          <Input id="courier" {...form.register("courier")} placeholder="Budi" />
          {form.formState.errors.courier && (
            <p className="text-xs text-destructive">{form.formState.errors.courier.message}</p>
          )}
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="buy_price">Buy price (QAR/kg)</Label>
          <Input id="buy_price" type="number" step="0.01" {...form.register("buy_price")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sell_price">Sell price (QAR/kg)</Label>
          <Input id="sell_price" type="number" step="0.01" {...form.register("sell_price")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="weight_limit">Weight limit (kg)</Label>
          <Input id="weight_limit" type="number" step="0.01" {...form.register("weight_limit")} />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Type</Label>
          <Select
            value={form.watch("type") as string}
            onValueChange={(v) => form.setValue("type", v as DeliveryFormInput["type"])}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {DELIVERY_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select
            value={form.watch("status") as string}
            onValueChange={(v) => form.setValue("status", v as DeliveryFormInput["status"])}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {DELIVERY_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="rounded-md bg-muted/50 p-3 text-sm">
        Potential profit at full load:{" "}
        <span className="font-semibold">{isFinite(potential) ? potential.toFixed(2) : "0.00"} QAR</span>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={submitting}>{submitting ? "Saving…" : "Save"}</Button>
      </div>
    </form>
  );
};