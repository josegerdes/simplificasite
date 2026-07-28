"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, MessageCircle, Send, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { randomId } from "@/lib/random-id";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
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

export function AiChatWidget({ brandName }: { brandName: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: `Oi! 👋 Sou o assistente virtual da ${brandName}. Quer ajuda para escolher um curso ou já sabe qual quer garantir sua vaga?` },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function sendMessage() {
    const content = input.trim();
    if (!content || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages([...nextMessages, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/public/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: getSessionId(), messages: nextMessages }),
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
          <div className="flex items-center justify-between bg-brand-teal px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span className="font-heading text-sm font-semibold">Vendedor virtual</span>
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
                  message.role === "user" ? "ml-auto bg-brand-teal text-white" : "bg-white/10 text-white/90"
                )}
              >
                {message.content || (loading && index === messages.length - 1 ? <Loader2 className="h-4 w-4 animate-spin" /> : "")}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 border-t border-white/10 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Digite sua mensagem..."
              className="flex-1 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-brand-teal"
            />
            <Button size="icon" variant="cta" onClick={sendMessage} disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-teal text-white shadow-lg shadow-brand-teal/40 transition-transform hover:scale-105"
        aria-label="Abrir chat"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
