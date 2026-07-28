import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fale Conosco",
  description: "Dúvidas sobre cursos, matrícula, financeiro ou reclamações — fale com o time da Simplifica Doctor.",
  alternates: { canonical: "/contato" },
  openGraph: { title: "Fale Conosco", url: "/contato" },
};

export default function ContatoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
