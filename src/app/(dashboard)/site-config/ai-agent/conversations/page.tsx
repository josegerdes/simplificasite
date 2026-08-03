"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bot, CheckCircle2, Trash2, User } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiFetch } from "@/lib/api-client";

interface ConversationSummary {
  id: string;
  sessionId: string;
  personaName: string | null;
  messageCount: number;
  firstMessage: string;
  converted: boolean;
  convertedCourseSlug: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ConversationDetail {
  id: string;
  sessionId: string;
  personaName: string | null;
  messages: { role: "user" | "assistant"; content: string; createdAt: string }[];
  converted: boolean;
  convertedCourseSlug: string | null;
  createdAt: string;
}

export default function AiConversationsPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: conversations, isLoading } = useQuery<ConversationSummary[]>({
    queryKey: ["ai-conversations"],
    queryFn: () => apiFetch("/api/ai-conversations"),
  });

  const { data: detail } = useQuery<ConversationDetail>({
    queryKey: ["ai-conversations", selectedId],
    queryFn: () => apiFetch(`/api/ai-conversations/${selectedId}`),
    enabled: Boolean(selectedId),
  });

  const deleteConversation = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/ai-conversations/${id}`, { method: "DELETE" }),
    onSuccess: (_data, id) => {
      toast.success("Conversa excluída");
      queryClient.invalidateQueries({ queryKey: ["ai-conversations"] });
      if (selectedId === id) setSelectedId(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Conversas do vendedor IA</h1>
        <p className="text-sm text-muted-foreground">Revise a qualidade dos atendimentos automáticos e identifique leads quentes</p>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendedor</TableHead>
              <TableHead>Primeira mensagem</TableHead>
              <TableHead>Mensagens</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Última atividade</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && conversations?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Nenhuma conversa registrada ainda
                </TableCell>
              </TableRow>
            )}
            {conversations?.map((conversation) => (
              <TableRow key={conversation.id} className="cursor-pointer" onClick={() => setSelectedId(conversation.id)}>
                <TableCell>{conversation.personaName ?? "—"}</TableCell>
                <TableCell className="max-w-md truncate">{conversation.firstMessage}</TableCell>
                <TableCell>{conversation.messageCount}</TableCell>
                <TableCell>
                  {conversation.converted ? (
                    <Badge variant="success" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Convertido
                    </Badge>
                  ) : (
                    <Badge variant="outline">Em andamento</Badge>
                  )}
                </TableCell>
                <TableCell>{new Date(conversation.updatedAt).toLocaleString("pt-BR")}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir esta conversa?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Essa ação não pode ser desfeita — o histórico de mensagens com {conversation.personaName ?? "o vendedor"} vai
                          ser apagado permanentemente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteConversation.mutate(conversation.id)}>Excluir</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Sheet open={Boolean(selectedId)} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <div className="flex items-start justify-between gap-2">
              <div>
                <SheetTitle>Conversa com {detail?.personaName ?? "—"}</SheetTitle>
                <SheetDescription>
                  {detail && new Date(detail.createdAt).toLocaleString("pt-BR")}
                  {detail?.converted && ` · Convertido${detail.convertedCourseSlug ? ` (${detail.convertedCourseSlug})` : ""}`}
                </SheetDescription>
              </div>
              {detail && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir esta conversa?</AlertDialogTitle>
                      <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteConversation.mutate(detail.id)}>Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            {detail?.messages.map((message, index) => (
              <div key={index} className={`flex gap-2 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className="mt-0.5 shrink-0 rounded-full bg-muted p-1.5">
                  {message.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>
                <div className={`rounded-lg px-3 py-2 text-sm ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
