"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Mail, MessageCircle, ShoppingCart } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/data-table/data-table";
import { apiFetch } from "@/lib/api-client";
import { useSession } from "@/components/layout/session-context";
import { AbandonedCartAdmin } from "@/app/(dashboard)/abandoned-carts/types";

const STEP_LABEL: Record<string, string> = {
  identify: "Parou no CPF/celular",
  details: "Parou nos dados",
  payment: "Parou no pagamento",
};

const STATUS_LABEL: Record<string, { label: string; variant: "success" | "outline" | "warning" | "destructive" }> = {
  open: { label: "Em aberto", variant: "warning" },
  contacted: { label: "Contatado", variant: "outline" },
  converted: { label: "Convertido", variant: "success" },
  lost: { label: "Perdido", variant: "destructive" },
};

export default function AbandonedCartsPage() {
  const queryClient = useQueryClient();
  const session = useSession();
  const [statusFilter, setStatusFilter] = useState<string>("open");
  const [selected, setSelected] = useState<AbandonedCartAdmin | null>(null);

  const { data: carts, isLoading } = useQuery<AbandonedCartAdmin[]>({
    queryKey: ["abandoned-carts"],
    queryFn: () => apiFetch("/api/abandoned-carts"),
    refetchInterval: 30000,
  });

  const filtered = useMemo(() => {
    if (!carts) return [];
    if (statusFilter === "all") return carts;
    return carts.filter((c) => c.status === statusFilter);
  }, [carts, statusFilter]);

  const columns: ColumnDef<AbandonedCartAdmin>[] = [
    {
      accessorKey: "studentName",
      header: "Nome",
      cell: ({ row }) => row.original.studentName ?? <span className="text-muted-foreground">Não informado</span>,
    },
    {
      accessorKey: "studentPhone",
      header: "Celular",
      cell: ({ row }) => row.original.studentPhone ?? <span className="text-muted-foreground">—</span>,
    },
    { accessorKey: "courseName", header: "Curso interessado" },
    {
      accessorKey: "step",
      header: "Onde parou",
      cell: ({ row }) => <Badge variant="outline">{STEP_LABEL[row.original.step] ?? row.original.step}</Badge>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const info = STATUS_LABEL[row.original.status];
        return <Badge variant={info?.variant ?? "outline"}>{info?.label ?? row.original.status}</Badge>;
      },
    },
    {
      accessorKey: "lastActivityAt",
      header: "Última atividade",
      cell: ({ row }) => new Date(row.original.lastActivityAt).toLocaleString("pt-BR"),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Carrinhos abandonados</h1>
          <p className="text-sm text-muted-foreground">
            Quem começou o checkout mas não terminou a matrícula — entre em contato manualmente com o que já foi preenchido.
          </p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Em aberto</SelectItem>
            <SelectItem value="contacted">Contatado</SelectItem>
            <SelectItem value="converted">Convertido</SelectItem>
            <SelectItem value="lost">Perdido</SelectItem>
            <SelectItem value="all">Todos os status</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        isLoading={isLoading}
        onRowClick={(row) => setSelected(row)}
        emptyState={
          <div className="py-4">
            <ShoppingCart className="mx-auto mb-2 h-8 w-8 opacity-50" />
            Nenhum carrinho abandonado por aqui
          </div>
        }
      />

      <Sheet open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {selected && (
            <CartDetail
              cart={carts?.find((c) => c.id === selected.id) ?? selected}
              canManage={session.permissions.includes("sales.manage") || session.isSuperAdmin}
              onUpdated={() => queryClient.invalidateQueries({ queryKey: ["abandoned-carts"] })}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function CartDetail({
  cart,
  canManage,
  onUpdated,
}: {
  cart: AbandonedCartAdmin;
  canManage: boolean;
  onUpdated: () => void;
}) {
  const [note, setNote] = useState("");

  const updateStatus = useMutation({
    mutationFn: (status: string) => apiFetch(`/api/abandoned-carts/${cart.id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: onUpdated,
    onError: (error: Error) => toast.error(error.message),
  });

  const addNote = useMutation({
    mutationFn: () => apiFetch(`/api/abandoned-carts/${cart.id}/notes`, { method: "POST", body: JSON.stringify({ note }) }),
    onSuccess: () => {
      setNote("");
      onUpdated();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const whatsappHref = cart.studentPhone
    ? `https://wa.me/55${cart.studentPhone}?text=${encodeURIComponent(
        `Oi${cart.studentName ? " " + cart.studentName.split(" ")[0] : ""}! Vi que você começou a matrícula em ${cart.courseName} na Simplifica Doctor — posso te ajudar a finalizar?`
      )}`
    : null;

  return (
    <div className="space-y-6">
      <SheetHeader>
        <SheetTitle>{cart.studentName ?? "Lead sem nome"}</SheetTitle>
        <SheetDescription>{cart.courseName}</SheetDescription>
      </SheetHeader>

      <div className="space-y-2 text-sm">
        <p className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          {STEP_LABEL[cart.step] ?? cart.step}
        </p>
        {cart.studentEmail && (
          <p className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            {cart.studentEmail}
          </p>
        )}
        {cart.studentPhone && (
          <p className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
            {cart.studentPhone}
          </p>
        )}
        {cart.studentCpf && <p className="text-muted-foreground">CPF: {cart.studentCpf}</p>}
        {!cart.studentEmail && !cart.studentPhone && !cart.studentCpf && (
          <p className="text-muted-foreground">Só temos o nome digitado — sem contato pra chamar ainda.</p>
        )}
      </div>

      {whatsappHref && (
        <Button asChild variant="cta" className="w-full">
          <a href={whatsappHref} target="_blank" rel="noreferrer">
            <MessageCircle className="mr-2 h-4 w-4" />
            Chamar no WhatsApp
          </a>
        </Button>
      )}

      <Separator />

      <div className="space-y-1.5">
        <Label>Status</Label>
        <Select value={cart.status} onValueChange={(v) => updateStatus.mutate(v)} disabled={!canManage}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Em aberto</SelectItem>
            <SelectItem value="contacted">Contatado</SelectItem>
            <SelectItem value="converted">Convertido</SelectItem>
            <SelectItem value="lost">Perdido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="space-y-3">
        <Label>Histórico de contato</Label>
        <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-2">
          {cart.notes.length === 0 && <p className="p-2 text-sm text-muted-foreground">Nenhuma nota ainda</p>}
          {cart.notes.map((n, index) => (
            <div key={index} className="rounded-md bg-muted/50 p-2 text-sm">
              <p>{n.note}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {n.authorName} — {new Date(n.createdAt).toLocaleString("pt-BR")}
              </p>
            </div>
          ))}
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Textarea placeholder="Adicionar nota de contato" value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
            <Button onClick={() => addNote.mutate()} loading={addNote.isPending} disabled={!note.trim()}>
              Salvar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
