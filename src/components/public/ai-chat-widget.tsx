"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, ChevronLeft, Loader2, MessageCircle, Send, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { randomId } from "@/lib/random-id";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface Persona {
  id: string;
  name: string;
}

interface LeadInfo {
  name: string;
  whatsapp: string;
  interest: string;
}

function getSessionId(): string {
  const key = "sdv_chat_session";
  let id = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
  if (!id) {
    id = randomId();
    window.localStorage.setItem(key, id);
  }
  return id;
}

const COURSE_LINK_PATTERN = /\[\[curso:([a-z0-9-]+)\]\]/g;

/** Quebra o texto da IA em pedaços de texto normal + botões de curso onde aparecer o
 *  marcador [[curso:slug]] — é assim que o vendedor manda link de matrícula no chat. */
function CourseAwareMessage({ content, onCourseClick }: { content: string; onCourseClick: (slug: string) => void }) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const pattern = new RegExp(COURSE_LINK_PATTERN);
  let key = 0;

  while ((match = pattern.exec(content))) {
    if (match.index > lastIndex) parts.push(<span key={key++}>{content.slice(lastIndex, match.index)}</span>);
    const slug = match[1] ?? "";
    parts.push(
      <button
        key={key++}
        onClick={() => onCourseClick(slug)}
        className="mt-1 block w-full rounded-md bg-[#25d366] px-3 py-2 text-left text-sm font-semibold text-white transition-colors hover:bg-[#25d366]/90"
      >
        Ver curso e garantir vaga →
      </button>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < content.length) parts.push(<span key={key++}>{content.slice(lastIndex)}</span>);
  return <>{parts}</>;
}

export function AiChatWidget({ brandName, personas }: { brandName: string; personas: Persona[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [leadInfo, setLeadInfo] = useState<LeadInfo | null>(null);
  const [qualifyForm, setQualifyForm] = useState({ name: "", whatsapp: "", interest: "" });
  const [qualifySubmitting, setQualifySubmitting] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Nunca deixa o widget vazio se a config ficar sem nenhum vendedor cadastrado.
  const roster = personas.length > 0 ? personas : [{ id: "atendimento", name: "Atendimento" }];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  function choosePersona(p: Persona) {
    setPersona(p);
  }

  function backToRoster() {
    setPersona(null);
    setLeadInfo(null);
    setQualifyForm({ name: "", whatsapp: "", interest: "" });
    setMessages([]);
    setInput("");
  }

  async function submitQualifyForm() {
    const name = qualifyForm.name.trim();
    const whatsapp = qualifyForm.whatsapp.trim();
    if (!name || whatsapp.length < 8 || !persona || qualifySubmitting) return;

    setQualifySubmitting(true);
    const info: LeadInfo = { name, whatsapp, interest: qualifyForm.interest.trim() };
    try {
      // Manda o lead pro CRM externo JÁ — mesmo que a pessoa feche o chat sem mandar
      // nenhuma mensagem, esse contato já foi capturado. Não bloqueia o chat se falhar
      // (a conversa continua funcionando), mas avisa — antes falhava 100% em silêncio.
      const res = await fetch("/api/public/ai-chat/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: getSessionId(),
          personaId: persona.id,
          leadInfo: { name: info.name, whatsapp: info.whatsapp, interest: info.interest || null },
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.message ?? "Não foi possível registrar seu contato — o chat vai continuar normalmente.");
      }
    } catch {
      toast.error("Não foi possível registrar seu contato — o chat vai continuar normalmente.");
    } finally {
      setQualifySubmitting(false);
    }

    setLeadInfo(info);
    const firstName = name.split(" ")[0];
    setMessages([
      {
        role: "assistant",
        content: info.interest
          ? `Oi, ${firstName}! 👋 Sou o ${persona.name}, consultor da ${brandName}. Vi que seu interesse é em "${info.interest}" — já vou te mostrar as melhores opções!`
          : `Oi, ${firstName}! 👋 Sou o ${persona.name}, consultor da ${brandName}. Me conta, o que você está buscando?`,
      },
    ]);
  }

  function handleCourseClick(slug: string) {
    const sessionId = getSessionId();
    fetch("/api/public/ai-chat/convert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, courseSlug: slug }),
    }).catch(() => {});
    router.push(`/cursos/${slug}`);
  }

  async function sendMessage() {
    const content = input.trim();
    if (!content || loading || !persona) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages([...nextMessages, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/public/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: getSessionId(),
          personaId: persona.id,
          leadInfo: leadInfo ? { name: leadInfo.name, whatsapp: leadInfo.whatsapp, interest: leadInfo.interest || null } : null,
          messages: nextMessages,
        }),
      });

      if (!response.ok || !response.body) {
        const data = await response.json().catch(() => ({}));
        setMessages([
          ...nextMessages,
          { role: "assistant", content: data.message ?? "Desculpe, não consegui responder agora. Tente novamente em instantes." },
        ]);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages([...nextMessages, { role: "assistant", content: assistantText }]);
      }
    } catch {
      setMessages([...nextMessages, { role: "assistant", content: "Desculpe, tive um problema de conexão. Tente novamente." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    // bottom-24 no mobile pra não ficar em cima da barra fixa de preço/CTA do checkout
    // (ver checkout-panel.tsx) — no desktop essa barra não existe, então volta pro canto normal.
    <div className="fixed bottom-24 right-4 z-50 lg:bottom-5 lg:right-5">
      {open && (
        <div className="mb-3 flex h-[480px] w-80 flex-col overflow-hidden rounded-xl border border-white/10 bg-brand-ink shadow-2xl sm:w-96">
          {!persona ? (
            <>
              <div className="bg-[#25d366] px-4 py-3 text-white">
                <p className="font-heading text-sm font-semibold">Fale com a gente</p>
                <p className="text-xs text-white/80">Escolha com quem você quer falar</p>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto p-3">
                {roster.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => choosePersona(p)}
                    className="flex w-full items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 text-left transition-colors hover:bg-white/10"
                  >
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
                      <Bot className="h-5 w-5 text-white" />
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-brand-ink bg-[#4ade80]" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{p.name}</p>
                      <p className="flex items-center gap-1 text-xs text-white/60">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" />
                        Online
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="border-t border-white/10 py-2 text-center text-xs text-white/50 hover:text-white"
              >
                Fechar
              </button>
            </>
          ) : !leadInfo ? (
            <>
              <div className="flex items-center gap-2.5 bg-[#25d366] px-4 py-3 text-white">
                <button onClick={backToRoster} aria-label="Voltar" className="rounded-full p-0.5 hover:bg-white/10">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="leading-tight">
                  <p className="font-heading text-sm font-semibold">Antes de começar</p>
                  <p className="text-xs text-white/80">Falando com {persona.name}</p>
                </div>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                <p className="text-sm text-white/70">
                  Me conta rapidinho seu nome, WhatsApp e o que você busca — isso ajuda a gente a já começar a
                  conversa entendendo o que você precisa, sem enrolação.
                </p>
                <div className="space-y-2.5">
                  <input
                    value={qualifyForm.name}
                    onChange={(e) => setQualifyForm({ ...qualifyForm, name: e.target.value })}
                    placeholder="Seu nome"
                    className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#25d366]"
                  />
                  <input
                    value={qualifyForm.whatsapp}
                    onChange={(e) => setQualifyForm({ ...qualifyForm, whatsapp: e.target.value })}
                    placeholder="Seu WhatsApp"
                    inputMode="tel"
                    className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#25d366]"
                  />
                  <input
                    value={qualifyForm.interest}
                    onChange={(e) => setQualifyForm({ ...qualifyForm, interest: e.target.value })}
                    placeholder="O que você busca? (opcional)"
                    onKeyDown={(e) => e.key === "Enter" && submitQualifyForm()}
                    className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#25d366]"
                  />
                </div>
                <Button
                  onClick={submitQualifyForm}
                  loading={qualifySubmitting}
                  disabled={!qualifyForm.name.trim() || qualifyForm.whatsapp.trim().length < 8}
                  className="w-full bg-[#25d366] text-white hover:bg-[#25d366]/90"
                >
                  Começar conversa
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between bg-[#25d366] px-4 py-3 text-white">
                <div className="flex items-center gap-2.5">
                  <button onClick={backToRoster} aria-label="Trocar de vendedor" className="rounded-full p-0.5 hover:bg-white/10">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
                    <Bot className="h-4.5 w-4.5" />
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#25d366] bg-[#4ade80]" />
                  </div>
                  <div className="leading-tight">
                    <p className="font-heading text-sm font-semibold">{persona.name}</p>
                    <p className="flex items-center gap-1 text-xs text-white/80">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" />
                      Online
                    </p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} aria-label="Fechar">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                      message.role === "user" ? "ml-auto bg-[#25d366] text-white" : "bg-white/10 text-white/90"
                    )}
                  >
                    {message.content ? (
                      <CourseAwareMessage content={message.content} onCourseClick={handleCourseClick} />
                    ) : loading && index === messages.length - 1 ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      ""
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 border-t border-white/10 p-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#25d366]"
                />
                <Button
                  size="icon"
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="bg-[#25d366] text-white shadow-lg shadow-[#25d366]/30 hover:bg-[#25d366]/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg shadow-[#25d366]/40 transition-transform hover:scale-105"
        aria-label="Abrir chat"
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <span className="relative">
            <MessageCircle className="h-6 w-6" />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#25d366] bg-[#4ade80]" />
          </span>
        )}
      </button>
    </div>
  );
}
