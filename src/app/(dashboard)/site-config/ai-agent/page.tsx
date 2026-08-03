"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Eye, Plus, RefreshCw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api-client";
import { randomId } from "@/lib/random-id";
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

  const [previewPersonaId, setPreviewPersonaId] = useState<string | null>(null);
  const {
    data: preview,
    isFetching: previewLoading,
    refetch: refetchPreview,
  } = useQuery<{ prompt: string }>({
    queryKey: ["ai-agent-preview", previewPersonaId],
    queryFn: () =>
      apiFetch(`/api/site-config/ai-agent/preview${previewPersonaId ? `?personaId=${previewPersonaId}` : ""}`),
    enabled: false,
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Vendedores</CardTitle>
            <p className="text-sm text-muted-foreground">
              Todos rodam a mesma IA por trás — o visitante escolhe com quem falar no chat, e cada um pode ter
              instruções próprias (tom, especialidade, o que priorizar).
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setForm({
                ...form,
                personas: [...form.personas, { id: randomId(), name: "", extraInstructions: "" }],
              })
            }
          >
            <Plus className="h-4 w-4" />
            Adicionar vendedor
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {form.personas.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhum vendedor cadastrado — adicione pelo menos um pra o chat funcionar.
            </p>
          )}
          {form.personas.map((persona, index) => (
            <div key={persona.id} className="flex gap-2 rounded-md border p-3">
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Nome (ex: Pedro Lemos)"
                  value={persona.name}
                  onChange={(e) => {
                    const personas = [...form.personas];
                    personas[index] = { ...persona, name: e.target.value };
                    setForm({ ...form, personas });
                  }}
                />
                <Textarea
                  placeholder="Instruções específicas deste vendedor (opcional) — ex: especialista em implantodontia, tom mais técnico..."
                  rows={2}
                  value={persona.extraInstructions}
                  onChange={(e) => {
                    const personas = [...form.personas];
                    personas[index] = { ...persona, extraInstructions: e.target.value };
                    setForm({ ...form, personas });
                  }}
                />
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setForm({ ...form, personas: form.personas.filter((_, i) => i !== index) })}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          <div className="flex justify-end">
            <Button onClick={() => save.mutate(form)} loading={save.isPending}>
              Salvar vendedores
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">O que a IA está vendo agora</CardTitle>
            <p className="text-sm text-muted-foreground">
              Prompt completo montado ao vivo do banco — cursos publicados, preços, vagas restantes, ementa e
              as instruções extras acima. É exatamente isso que o vendedor selecionado recebe numa conversa agora.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {form.personas.length > 1 && (
              <Select value={previewPersonaId ?? form.personas[0]?.id} onValueChange={setPreviewPersonaId}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {form.personas.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name || "(sem nome)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button variant="outline" size="sm" onClick={() => refetchPreview()} loading={previewLoading}>
              {preview ? <RefreshCw className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {preview ? "Atualizar" : "Visualizar"}
            </Button>
          </div>
        </CardHeader>
        {preview && (
          <CardContent>
            <pre className="max-h-[500px] overflow-y-auto whitespace-pre-wrap rounded-md border bg-muted/40 p-4 text-xs leading-relaxed">
              {preview.prompt}
            </pre>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
