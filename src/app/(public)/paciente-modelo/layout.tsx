import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seja Paciente Modelo",
  description: "Faça seu tratamento odontológico com valor acessível, atendido por alunos supervisionados por professores especialistas na Simplifica Doctor.",
  alternates: { canonical: "/paciente-modelo" },
  openGraph: { title: "Seja Paciente Modelo", url: "/paciente-modelo" },
};

export default function PacienteModeloLayout({ children }: { children: React.ReactNode }) {
  return children;
}
