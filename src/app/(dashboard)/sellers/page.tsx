"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, ShoppingBag, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api-client";

interface SellerAdmin {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  active: boolean;
}

interface UserOption {
  id: string;
  name: string;
  email: string;
}

const createSellerFormSchema = z.object({
  userId: z.string().min(1, "Selecione um usuário"),
  phone: z.string().optional(),
});
type CreateSellerFormValues = z.infer<typeof createSellerFormSchema>;

export default function SellersPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);

  const { data: sellers, isLoading } = useQuery<SellerAdmin[]>({ queryKey: ["sellers"], queryFn: () => apiFetch("/api/sellers") });
  const { data: users } = useQuery<UserOption[]>({ queryKey: ["users"], queryFn: () => apiFetch("/api/users") });

  const availableUsers = (users ?? []).filter((user) => !sellers?.some((seller) => seller.userId === user.id));

  const form = useForm<CreateSellerFormValues>({
    resolver: zodResolver(createSellerFormSchema),
    defaultValues: { userId: "", phone: "" },
  });

  const createSeller = useMutation({
    mutationFn: (values: CreateSellerFormValues) =>
      apiFetch<SellerAdmin>("/api/sellers", {
        method: "POST",
        body: JSON.stringify({ userId: values.userId, phone: values.phone || null }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
      toast.success("Vendedor criado");
      setCreateOpen(false);
      form.reset();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const toggleActive = useMutation({
    mutationFn: (payload: { id: string; active: boolean }) =>
      apiFetch(`/api/sellers/${payload.id}`, { method: "PATCH", body: JSON.stringify({ active: payload.active }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sellers"] }),
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteSeller = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/sellers/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
      toast.success("Vendedor removido");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Vendedores</h1>
          <p className="text-sm text-muted-foreground">
            Matrículas aprovadas são atribuídas automaticamente por rodízio entre vendedores ativos
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Novo vendedor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo vendedor</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form className="space-y-4" onSubmit={form.handleSubmit((values) => createSeller.mutate(values))}>
                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usuário</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um usuário" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableUsers.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} — {user.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone (opcional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" loading={createSeller.isPending}>
                    Criar vendedor
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendedor</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={4}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && sellers?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  <ShoppingBag className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  Nenhum vendedor cadastrado ainda
                </TableCell>
              </TableRow>
            )}
            {sellers?.map((seller) => (
              <TableRow key={seller.id}>
                <TableCell>
                  <p className="font-medium">{seller.name}</p>
                  <p className="text-xs text-muted-foreground">{seller.email}</p>
                </TableCell>
                <TableCell>{seller.phone ?? "—"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={seller.active}
                      onCheckedChange={(active) => toggleActive.mutate({ id: seller.id, active })}
                    />
                    <Badge variant={seller.active ? "success" : "outline"}>{seller.active ? "Ativo" : "Inativo"}</Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      if (confirm(`Remover o vendedor "${seller.name}"?`)) deleteSeller.mutate(seller.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
