import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { status?: string; curso?: string };
}) {
  const isPending = searchParams.status === "pending" || searchParams.status === "in_process";

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      {isPending ? (
        <Clock className="mb-6 h-16 w-16 text-brand-teal" />
      ) : (
        <CheckCircle2 className="mb-6 h-16 w-16 text-brand-teal" />
      )}
      <h1 className="font-heading max-w-lg text-3xl font-bold text-white md:text-4xl">
        {isPending ? "Pré-reserva recebida!" : "Vaga garantida!"}
      </h1>
      {searchParams.curso && <p className="mt-3 text-white/70">{searchParams.curso}</p>}
      <p className="mt-4 max-w-md text-white/60">
        {isPending
          ? "Seu pagamento está em confirmação (isso é comum em Pix). Assim que confirmar, nosso time vai entrar em contato para finalizar seu cadastro."
          : "Recebemos sua matrícula com sucesso. Nosso time vai entrar em contato em breve para finalizar seu cadastro."}
      </p>
      <Button asChild size="lg" variant="cta" className="mt-8">
        <Link href="/cursos">Ver outros cursos</Link>
      </Button>
    </main>
  );
}
