"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { HelpCircle, Inbox, Mail, MessageSquareWarning, Phone, ShoppingBag, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api-client";

interface ContactMessageAdmin {
  id: string;
  category: "duvida" | "vendas" | "financeiro" | "reclamacao";
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: "new" | "in_progress" | "resolved";
  createdAt: string;
}

const CATEGORY_INFO: Record<string, { label: string; icon: typeof HelpCircle }> = {
  duvida: { label: "Dúvidas", icon: HelpCircle },
  vendas: { label: "Vendas", icon: ShoppingBag },
  financeiro: { label: "Financeiro", icon: Wallet },
  reclamacao: { label: "Reclamação", icon: MessageSquareWarning },
};

const STATUS_LABEL: Record<string, { label: string; variant: "warning" | "outline" | "success" }> = {
  new: { label: "Nova", variant: "warning" },
  in_progress: { label: "Em andamento", variant: "outline" },
  resolved: { label: "Resolvida", variant: "success" },
};

export default function ContactMessagesPage() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<ContactMessageAdmin | null>(null);

  const { data: messages, isLoading } = useQuery<ContactMessageAdmin[]>({
    queryKey: ["contact-messages"],
    queryFn: () => apiFetch("/api/contact-messages"),
  });

  const updateStatus = useMutation({
    mutationFn: (payload: { id: string; status: string }) =>
      apiFetch(`/api/contact-messages/${payload.id}`, { method: "PATCH", body: JSON.stringify({ status: payload.status }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contact-messages"] }),
    onError: (error: Error) => toast.error(error.message),
  });

  const newCount = useMemo(() => messages?.filter((m) => m.status === "new").length ?? 0, [messages]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Mensagens de contato</h1>
        <p className="text-sm text-muted-foreground">
          Dúvidas, vendas, financeiro e reclamações enviadas pela página de Contato do site
          {newCount > 0 && <span className="ml-2 font-medium text-warning">— {newCount} nova(s)</span>}
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Assunto</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Mensagem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && messages?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  <Inbox className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  Nenhuma mensagem recebida ainda
                </TableCell>
              </TableRow>
            )}
            {messages?.map((message) => {
              const category = CATEGORY_INFO[message.category];
              const status = STATUS_LABEL[message.status];
              return (
                <TableRow key={message.id} className="cursor-pointer" onClick={() => setSelected(message)}>
                  <TableCell>
                    <span className="flex items-center gap-1.5">
                      {category && <category.icon className="h-3.5 w-3.5 text-muted-foreground" />}
                      {category?.label ?? message.category}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{message.name}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">{message.message}</TableCell>
                  <TableCell>
                    <Badge variant={status?.variant ?? "outline"}>{status?.label ?? message.status}</Badge>
                  </TableCell>
                  <TableCell>{new Date(message.createdAt).toLocaleDateString("pt-BR")}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Sheet open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {selected && (
            <div className="space-y-6">
              <SheetHeader>
                <SheetTitle>{selected.name}</SheetTitle>
                <SheetDescription>{CATEGORY_INFO[selected.category]?.label ?? selected.category}</SheetDescription>
              </SheetHeader>

              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {selected.email}
                </p>
                {selected.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {selected.phone}
                  </p>
                )}
              </div>

              <div className="rounded-md bg-muted/50 p-3 text-sm">{selected.message}</div>

              <div className="space-y-1.5">
                <p className="text-sm font-medium">Status</p>
                <Select
                  value={selected.status}
                  onValueChange={(status) => {
                    updateStatus.mutate({ id: selected.id, status });
                    setSelected({ ...selected, status: status as ContactMessageAdmin["status"] });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Nova</SelectItem>
                    <SelectItem value="in_progress">Em andamento</SelectItem>
                    <SelectItem value="resolved">Resolvida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
