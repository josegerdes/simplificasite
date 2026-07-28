import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ImageSpec {
  local: string;
  ondeConfigurar: string;
  tamanhoIdeal: string;
  proporcao: string;
  observacao: string;
}

const IMAGE_SPECS: ImageSpec[] = [
  {
    local: "Logo do site",
    ondeConfigurar: "Configurações do site → Branding",
    tamanhoIdeal: "600×200px",
    proporcao: "3:1",
    observacao: "PNG com fundo transparente. Aparece no menu — não recebe nenhum filtro de cor, mantém as cores originais do arquivo.",
  },
  {
    local: "Banner da home (hero)",
    ondeConfigurar: "Configurações do site → Conteúdo → Hero da home",
    tamanhoIdeal: "1920×1080px",
    proporcao: "16:9",
    observacao: "Imagem bem larga — ocupa a tela inteira atrás do título na home. Evite texto na imagem (o título do site fica por cima).",
  },
  {
    local: "Imagem de capa do curso",
    ondeConfigurar: "Cursos → abrir o curso → Detalhes → Imagem de capa",
    tamanhoIdeal: "1200×800px",
    proporcao: "3:2",
    observacao: "Aparece nos cards de curso (home e /cursos) e no topo da página do curso.",
  },
];

export default function DocsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Documentação</h1>
        <p className="text-sm text-muted-foreground">Guia rápido do painel administrativo do Simplifica Doctor.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tamanho das imagens do site</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Envie as imagens sempre no tamanho ideal abaixo — evita corte estranho ou imagem borrada. Formatos
            aceitos: JPG, PNG ou WebP, até 5MB por arquivo.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Local</th>
                  <th className="py-2 pr-4 font-medium">Onde configurar</th>
                  <th className="py-2 pr-4 font-medium">Tamanho ideal</th>
                  <th className="py-2 pr-4 font-medium">Proporção</th>
                  <th className="py-2 font-medium">Observação</th>
                </tr>
              </thead>
              <tbody>
                {IMAGE_SPECS.map((spec) => (
                  <tr key={spec.local} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{spec.local}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{spec.ondeConfigurar}</td>
                    <td className="py-3 pr-4 whitespace-nowrap">{spec.tamanhoIdeal}</td>
                    <td className="py-3 pr-4 whitespace-nowrap">{spec.proporcao}</td>
                    <td className="py-3 text-muted-foreground">{spec.observacao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
