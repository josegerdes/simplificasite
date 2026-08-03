"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bot, CheckCircle2, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
            {!isLoading && conversations?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Sheet open={Boolean(selectedId)} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Conversa com {detail?.personaName ?? "—"}</SheetTitle>
            <SheetDescription>
              {detail && new Date(detail.createdAt).toLocaleString("pt-BR")}
              {detail?.converted && ` · Convertido${detail.convertedCourseSlug ? ` (${detail.convertedCourseSlug})` : ""}`}
            </SheetDescription>
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
