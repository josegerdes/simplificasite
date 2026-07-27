"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api-client";
import { SiteConfigAdmin } from "@/app/(dashboard)/site-config/types";

const MODELS = ["gpt-4o-mini", "gpt-4o", "gpt-4.1-mini", "gpt-4.1"];

export default function AiAgentConfigPage() {
  const queryClient = useQueryClient();
  const { data: config, isLoading } = useQuery<SiteConfigAdmin>({
    queryKey: ["site-config"],
    queryFn: () => apiFetch("/api/site-config"),
  });
  const [form, setForm] = useState<SiteConfigAdmin["aiAgent"] | null>(null);
  useEffect(() => {
    if (config) setForm(config.aiAgent);
  }, [config]);

  const save = useMutation({
    mutationFn: (aiAgent: SiteConfigAdmin["aiAgent"]) =>
      apiFetch<SiteConfigAdmin>("/api/site-config", { method: "PATCH", body: JSON.stringify({ aiAgent }) }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["site-config"], updated);
      toast.success("Configuração do vendedor IA salva");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (isLoading || !form) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Vendedor IA</h1>
        <p className="text-sm text-muted-foreground">
          Chat no site que conhece cursos, preços e vagas em tempo real e ajuda o visitante a comprar
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configuração</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-md border px-3 py-2.5">
            <div>
              <p className="text-sm font-medium">Vendedor IA ativo no site</p>
              <p className="text-xs text-muted-foreground">Mostra a bolha de chat em todas as páginas públicas</p>
            </div>
            <Switch checked={form.enabled} onCheckedChange={(checked) => setForm({ ...form, enabled: checked })} />
          </div>

          <div className="space-y-1.5">
            <Label>Modelo</Label>
            <Select value={form.model} onValueChange={(model) => setForm({ ...form, model })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODELS.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Instruções extras (tom de voz, regras específicas de venda)</Label>
            <Textarea
              rows={6}
              placeholder="Ex: seja direto, sempre pergunte se a pessoa já é dentista formada, ofereça a matrícula assim que perceber interesse..."
              value={form.extraInstructions}
              onChange={(e) => setForm({ ...form, extraInstructions: e.target.value })}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            O restante do contexto (cursos publicados, preços, vagas restantes, ementa resumida) é montado
            automaticamente a cada conversa — não precisa duplicar essa informação aqui.
          </p>

          <div className="flex justify-end">
            <Button onClick={() => save.mutate(form)} loading={save.isPending}>
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
