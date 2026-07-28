"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api-client";

export type AiAssistField = "shortDescription" | "longDescription" | "highlights";

interface AiAssistResponse {
  value: string | string[];
}

/** Ícone no canto superior direito de um campo — gera/melhora só aquele campo com IA.
 *  Nunca salva sozinho: só preenche o formulário, o admin revisa e clica em Salvar. */
export function AiFieldButton({
  courseId,
  field,
  onResult,
}: {
  courseId: string;
  field: AiAssistField;
  onResult: (value: string | string[]) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const data = await apiFetch<AiAssistResponse>(`/api/courses/${courseId}/ai-assist`, {
        method: "POST",
        body: JSON.stringify({ field }),
      });
      onResult(data.value);
      toast.success("Sugestão gerada — revise antes de salvar");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao gerar com IA");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      title="Gerar/melhorar com IA"
      className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
      IA
    </button>
  );
}
