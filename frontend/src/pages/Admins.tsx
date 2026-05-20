import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { createAdmin, deleteAdmin, getAdmins } from "@/api/adminApi";
import type { Admin } from "@/api/types";
import { getUser } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";

const schema = z
  .object({
    username: z.string().trim().min(3, "Min 3 characters").max(50),
    password: z.string().min(6, "Min 6 characters").max(100),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "Passwords don't match", path: ["confirm"] });

type Values = z.infer<typeof schema>;

export default function Admins() {
  const qc = useQueryClient();
  const adminsQ = useQuery({ queryKey: ["admins"], queryFn: getAdmins });
  const me = getUser();
  const [confirmDelete, setConfirmDelete] = useState<Admin | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "", confirm: "" },
  });

  const createM = useMutation({
    mutationFn: (v: { username: string; password: string }) => createAdmin(v),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admins"] });
      toast({ title: "Admin created" });
      form.reset();
    },
    onError: (e: any) => toast({ title: "Failed", description: e?.response?.data?.message || e.message, variant: "destructive" }),
  });

  const deleteM = useMutation({
    mutationFn: (id: number) => deleteAdmin(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admins"] });
      toast({ title: "Admin deleted" });
      setConfirmDelete(null);
    },
    onError: (e: any) => toast({ title: "Failed", description: e?.response?.data?.message || e.message, variant: "destructive" }),
  });

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="p-5 lg:col-span-2 overflow-hidden">
        <h2 className="font-semibold mb-3">Admins</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminsQ.isLoading ? (
                <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
              ) : (adminsQ.data ?? []).map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">
                    {a.username}
                    {me?.id === a.id && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {a.created_at ? new Date(a.created_at).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={me?.id === a.id}
                      onClick={() => setConfirmDelete(a)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-semibold mb-3 flex items-center gap-2"><UserPlus className="h-4 w-4" /> Add admin</h2>
        <form
          onSubmit={form.handleSubmit((v) => createM.mutate({ username: v.username, password: v.password }))}
          className="space-y-3"
        >
          <div className="space-y-1.5">
            <Label htmlFor="username">Username</Label>
            <Input id="username" {...form.register("username")} />
            {form.formState.errors.username && (
              <p className="text-xs text-destructive">{form.formState.errors.username.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...form.register("password")} />
            {form.formState.errors.password && (
              <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input id="confirm" type="password" {...form.register("confirm")} />
            {form.formState.errors.confirm && (
              <p className="text-xs text-destructive">{form.formState.errors.confirm.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={createM.isPending}>
            {createM.isPending ? "Creating…" : "Create admin"}
          </Button>
        </form>
      </Card>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete admin?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDelete?.username} will lose access immediately.
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