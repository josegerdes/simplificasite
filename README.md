# Simplifica Doctor — Site de Vendas + Admin de Matrículas

Site de vendas (estilo "Netflix de odontologia") + painel administrativo para a Simplifica Doctor. Venda de matrículas com checkout embutido via Mercado Pago, geração automática de ementa por IA, vendedor virtual por chat (IA) e painel comercial completo.

## Stack

- Next.js 14 (App Router) + TypeScript
- MongoDB (driver nativo, sem ORM)
- Autenticação JWT via cookie, RBAC estilo Discord (roles com permissões, múltiplas roles por usuário)
- shadcn/ui + Tailwind CSS
- Mercado Pago (Payment Brick, `@mercadopago/sdk-react` + SDK `mercadopago` no servidor)
- OpenAI (ementa por IA + vendedor virtual)
- Facebook Pixel (client-side) + Conversions API (server-side)

## Rodando localmente

```bash
npm install
cp .env.example .env   # preencha DATABASE_URL, JWT_SECRET, APP_SECRET no mínimo
npm run dev
```

No primeiro boot (`npm run dev` ou `npm run build && npm start`), o sistema cria automaticamente:
- Um usuário administrador (`SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD`, padrão `admin@simplificadoctor.com` / `admin12345` — troque a senha assim que possível)
- O conteúdo institucional real (hero, pilares, depoimentos, localização) e 9 cursos presenciais de exemplo

Isso só acontece se o banco ainda estiver vazio (idempotente — não sobrescreve nada depois que o admin começa a editar).

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | sim | Connection string do MongoDB |
| `DB` | não (default `simplifica_doctor_vendas`) | Nome do banco |
| `JWT_SECRET` | sim | Segredo pra assinar o cookie de sessão do admin |
| `APP_SECRET` | sim | Reservado para uso futuro de criptografia de segredos |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | não | Credenciais do admin inicial |
| `NEXT_PUBLIC_SITE_URL` | recomendado | URL pública do site (usada na `notification_url` do webhook do Mercado Pago) |
| `MERCADOPAGO_ACCESS_TOKEN` | para vender | Token de acesso (server-side) da conta Mercado Pago |
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | para vender | Public key (client-side) — **veja nota sobre Docker abaixo** |
| `OPENAI_API_KEY` | para IA | Habilita geração de ementa por IA e o vendedor virtual |
| `FACEBOOK_CONVERSIONS_ACCESS_TOKEN` | opcional | Token da Conversions API — evento `Purchase` server-side (redundante ao pixel client-side, melhora a atribuição de anúncios) |

Sem `MERCADOPAGO_ACCESS_TOKEN`/`NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`, o checkout mostra uma mensagem de "pagamento indisponível" em vez de quebrar. Sem `OPENAI_API_KEY`, a geração de ementa por IA e o vendedor virtual mostram um erro amigável pedindo pra tentar mais tarde — o resto do site funciona normalmente.

### ⚠️ Nota importante sobre `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` no Docker

Variáveis `NEXT_PUBLIC_*` são embutidas no bundle JavaScript do navegador **durante o `npm run build`**, não em runtime. Por isso essa variável precisa estar disponível como **build arg** (não só como env var do container) — já configurado em `docker-compose.yml`. Se você mudar o valor depois de já ter feito o build da imagem, precisa **reconstruir a imagem** (não basta reiniciar o container) para o novo valor ter efeito.

## Deploy (Docker)

Mesmo padrão dos outros sistemas: 2 containers (`mongo` + `app`) via `docker-compose.yml`, pensado pra Dockploy.

```bash
cp .env.example .env   # preencha as variáveis de produção
docker compose up -d --build
```

O admin inicial e o conteúdo de exemplo são criados automaticamente no boot do container (via `instrumentation.ts`), sem precisar rodar `npm run seed` manualmente (a imagem de produção não inclui os arquivos fonte/`tsx`).

## Estrutura

- `src/app/(public)` — site de vendas (sem autenticação): home, catálogo (`/cursos`), detalhe do curso, sucesso da matrícula
- `src/app/(auth)` — login do admin
- `src/app/(dashboard)` — painel administrativo (protegido por sessão)
- `src/app/api` — rotas autenticadas (admin) e `src/app/api/public` — rotas públicas (catálogo, checkout, webhook, chat IA)
- `src/server/modules/<nome>` — cada módulo de domínio como `repository.ts` (acesso ao Mongo) + `service.ts` (regra de negócio) + `types.ts` (validação Zod)
- `src/server/rbac/permissions.ts` — catálogo de permissões (categorias + chaves) usado tanto no admin de Roles quanto nos guards das rotas

## Funcionalidades principais

- **Venda de matrícula rápida**: formulário único (dados completos do aluno, iguais aos que o Sistema do Aluno usa pra cadastro/contrato) + Mercado Pago Payment Brick embutido (sem redirect) — cartão, débito ou Pix.
- **Atribuição automática de vendedor**: toda matrícula aprovada é distribuída por rodízio entre os vendedores ativos.
- **Ementa automática**: geração por IA (OpenAI) a partir do nome/carga horária/descrição do curso, revisão manual no admin, exportação em PDF pública.
- **Checklist de preparação do curso**: guia o admin da coleta de conteúdo com o professor até a publicação (não bloqueia, só orienta).
- **Ferramentas de venda**: limite de vagas, preço promocional com contador de urgência, banner de urgência global, Pixel do Facebook com override por curso.
- **Vendedor IA**: chat público que conhece cursos/preços/vagas em tempo real (contexto montado a cada conversa, nunca hardcoded), conversas revisáveis no admin.
- **Turmas realizadas**: cursos com status "Encerrado" aparecem como prova social no catálogo, sem CTA de compra.
