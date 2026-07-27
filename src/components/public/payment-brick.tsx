"use client";

import { useEffect, useState } from "react";
import { Payment, initMercadoPago } from "@mercadopago/sdk-react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/api-client";

const PUBLIC_KEY = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;

let initialized = false;
function ensureInit() {
  if (!initialized && PUBLIC_KEY) {
    initMercadoPago(PUBLIC_KEY, { locale: "pt-BR" });
    initialized = true;
  }
}

interface PayResponse {
  status: string;
  detail: string | null;
}

export function PaymentBrick({
  enrollmentId,
  amount,
  payerEmail,
  onResult,
}: {
  enrollmentId: string;
  amount: number;
  payerEmail: string;
  onResult: (status: string) => void;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureInit();
  }, []);

  if (!PUBLIC_KEY) {
    return (
      <div className="rounded-md border border-warning/40 bg-warning/10 p-4 text-sm text-warning">
        Pagamento indisponível no momento — configuração do Mercado Pago pendente. Entre em contato pelo WhatsApp
        para finalizar sua matrícula.
      </div>
    );
  }

  return (
    <div className="min-h-[300px]">
      {!ready && <p className="mb-2 text-center text-sm text-muted-foreground">Carregando formas de pagamento…</p>}
      <Payment
        initialization={{ amount, payer: { email: payerEmail } }}
        customization={{
          paymentMethods: { creditCard: "all", debitCard: "all", bankTransfer: "all", ticket: [] },
        }}
        onReady={() => setReady(true)}
        onError={(error) => {
          console.error("[payment-brick]", error);
          toast.error("Erro ao carregar o pagamento — recarregue a página e tente novamente");
        }}
        onSubmit={async ({ formData }) => {
          try {
            const result = await apiFetch<PayResponse>(`/api/public/checkout/${enrollmentId}/pay`, {
              method: "POST",
              body: JSON.stringify(formData),
            });
            onResult(result.status);
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Não foi possível processar o pagamento");
            throw error;
          }
        }}
      />
    </div>
  );
}
