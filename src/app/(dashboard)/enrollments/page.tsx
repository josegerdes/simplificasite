"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { GraduationCap, Mail, MapPin, Phone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/data-table/data-table";
import { apiFetch } from "@/lib/api-client";
import { formatBRL } from "@/lib/format";
import { useSession } from "@/components/layout/session-context";
import { EnrollmentAdmin } from "@/app/(dashboard)/enrollments/types";

const PAYMENT_LABEL: Record<string, { label: string; variant: "success" | "outline" | "warning" | "destructive" }> = {
  pending: { label: "Pendente", variant: "warning" },
  approved: { label: "Aprovado", variant: "success" },
  rejected: { label: "Rejeitado", variant: "destructive" },
  refunded: { label: "Reembolsado", variant: "outline" },
  cancelled: { label: "Cancelado", variant: "outline" },
};

const CONTACT_LABEL: Record<string, string> = {
  not_contacted: "Não contatado",
  contacted: "Contatado",
  converted: "Convertido",
  lost: "Perdido",
};

interface SellerOption {
  id: string;
  name: string;
}

export default function EnrollmentsPage() {
  const queryClient = useQueryClient();
  const session = useSession();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<EnrollmentAdmin | null>(null);

  const { data: enrollments, isLoading } = useQuery<EnrollmentAdmin[]>({
    queryKey: ["enrollments"],
    queryFn: () => apiFetch("/api/enrollments"),
  });
  const { data: sellers } = useQuery<SellerOption[]>({
    queryKey: ["sellers"],
    queryFn: () => apiFetch("/api/sellers"),
    enabled: session.permissions.includes("people.manage") || session.isSuperAdmin,
  });

  const filtered = useMemo(() => {
    if (!enrollments) return [];
    if (statusFilter === "all") return enrollments;
    return enrollments.filter((e) => e.contactStatus === statusFilter);
  }, [enrollments, statusFilter]);

  const columns: ColumnDef<EnrollmentAdmin>[] = [
    { accessorKey: "studentName", header: "Aluno" },
    { accessorKey: "courseName", header: "Curso" },
    {
      accessorKey: "paymentStatus",
      header: "Pagamento",
      cell: ({ row }) => {
        const info = PAYMENT_LABEL[row.original.paymentStatus];
        return <Badge variant={info?.variant ?? "outline"}>{info?.label ?? row.original.paymentStatus}</Badge>;
      },
    },
    {
      accessorKey: "contactStatus",
      header: "Contato",
      cell: ({ row }) => <Badge variant="outline">{CONTACT_LABEL[row.original.contactStatus]}</Badge>,
    },
    {
      accessorKey: "amount",
      header: "Valor",
      cell: ({ row }) => formatBRL(row.original.amount),
    },
    {
      accessorKey: "createdAt",
      header: "Data",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("pt-BR"),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Matrículas</h1>
          <p className="text-sm text-muted-foreground">Acompanhe e entre em contato com quem se matriculou</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status de contato</SelectItem>
            <SelectItem value="not_contacted">Não contatado</SelectItem>
            <SelectItem value="contacted">Contatado</SelectItem>
            <SelectItem value="converted">Convertido</SelectItem>
            <SelectItem value="lost">Perdido</SelectItem>
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
            <GraduationCap className="mx-auto mb-2 h-8 w-8 opacity-50" />
            Nenhuma matrícula encontrada
          </div>
        }
      />

      <Sheet open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {selected && (
            <EnrollmentDetail
              enrollment={enrollments?.find((e) => e.id === selected.id) ?? selected}
              sellers={sellers ?? []}
              canManage={session.permissions.includes("sales.manage") || session.isSuperAdmin}
              onUpdated={() => queryClient.invalidateQueries({ queryKey: ["enrollments"] })}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function EnrollmentDetail({
  enrollment,
  sellers,
  canManage,
  onUpdated,
}: {
  enrollment: EnrollmentAdmin;
  sellers: SellerOption[];
  canManage: boolean;
  onUpdated: () => void;
}) {
  const [note, setNote] = useState("");

  const updateStatus = useMutation({
    mutationFn: (contactStatus: string) =>
      apiFetch(`/api/enrollments/${enrollment.id}`, { method: "PATCH", body: JSON.stringify({ contactStatus }) }),
    onSuccess: onUpdated,
    onError: (error: Error) => toast.error(error.message),
  });

  const reassign = useMutation({
    mutationFn: (sellerId: string) =>
      apiFetch(`/api/enrollments/${enrollment.id}`, { method: "PATCH", body: JSON.stringify({ sellerId }) }),
    onSuccess: onUpdated,
    onError: (error: Error) => toast.error(error.message),
  });

  const addNote = useMutation({
    mutationFn: () => apiFetch(`/api/enrollments/${enrollment.id}/notes`, { method: "POST", body: JSON.stringify({ note }) }),
    onSuccess: () => {
      setNote("");
      onUpdated();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const address = enrollment.address;
  const addressLine = [address.street, address.neighborhood, address.city, address.state].filter(Boolean).join(", ");

  return (
    <div className="space-y-6">
      <SheetHeader>
        <SheetTitle>{enrollment.studentName}</SheetTitle>
        <SheetDescription>{enrollment.courseName}</SheetDescription>
      </SheetHeader>

      <div className="space-y-2 text-sm">
        <p className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          {enrollment.studentEmail}
        </p>
        <p className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          {enrollment.studentPhone}
        </p>
        {addressLine && (
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            {addressLine} {address.postalCode ? `— ${address.postalCode}` : ""}
          </p>
        )}
        <p className="text-muted-foreground">
          CPF: {enrollment.studentCpf}
          {enrollment.studentRg && ` · RG: ${enrollment.studentRg}`}
        </p>
      </div>

      <Separator />

      <div className="space-y-1.5">
        <Label>Status de contato</Label>
        <Select value={enrollment.contactStatus} onValueChange={(v) => updateStatus.mutate(v)} disabled={!canManage}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="not_contacted">Não contatado</SelectItem>
            <SelectItem value="contacted">Contatado</SelectItem>
            <SelectItem value="converted">Convertido</SelectItem>
            <SelectItem value="lost">Perdido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {sellers.length > 0 && (
        <div className="space-y-1.5">
          <Label>Vendedor responsável</Label>
          <Select value={enrollment.sellerId ?? "none"} onValueChange={(v) => reassign.mutate(v === "none" ? "" : v)} disabled={!canManage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem vendedor</SelectItem>
              {sellers.map((seller) => (
                <SelectItem key={seller.id} value={seller.id}>
                  {seller.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Separator />

      <div className="space-y-3">
        <Label>Histórico de contato</Label>
        <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-2">
          {enrollment.notes.length === 0 && <p className="p-2 text-sm text-muted-foreground">Nenhuma nota ainda</p>}
          {enrollment.notes.map((n, index) => (
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
