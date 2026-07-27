import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { getSession, Session } from "@/server/auth/session";
import { ApiError, requireAuth, requirePermission, requireSuperAdmin } from "@/server/auth/guards";

type Handler<Ctx> = (request: NextRequest, ctx: { session: Session } & Ctx) => Promise<Response>;

interface Options {
  permission?: string;
  requireSuperAdmin?: boolean;
}

/**
 * Padroniza autenticação/autorização e o formato de erro das rotas de API
 * autenticadas (rotas públicas do site/checkout não usam isto).
 */
export function withApiHandler<Ctx = Record<string, never>>(
  handler: Handler<Ctx>,
  options: Options = {}
) {
  return async (request: NextRequest, routeCtx: Ctx): Promise<Response> => {
    try {
      const session = requireAuth(await getSession());
      if (options.requireSuperAdmin) requireSuperAdmin(session);
      if (options.permission) requirePermission(session, options.permission);
      return await handler(request, { session, ...routeCtx });
    } catch (error) {
      if (error instanceof ApiError) {
        return NextResponse.json({ message: error.message }, { status: error.status });
      }
      if (error instanceof ZodError) {
        return NextResponse.json({ message: "Dados inválidos", issues: error.issues }, { status: 422 });
      }
      console.error(error);
      return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
  };
}

/**
 * Versão pública — sem autenticação — mas com o mesmo tratamento de erro
 * padronizado (usada pelo site de vendas: catálogo, checkout, chat da IA).
 */
export function withPublicApiHandler<Ctx = Record<string, never>>(
  handler: (request: NextRequest, ctx: Ctx) => Promise<Response>
) {
  return async (request: NextRequest, routeCtx: Ctx): Promise<Response> => {
    try {
      return await handler(request, routeCtx);
    } catch (error) {
      if (error instanceof ApiError) {
        return NextResponse.json({ message: error.message }, { status: error.status });
      }
      if (error instanceof ZodError) {
        return NextResponse.json({ message: "Dados inválidos", issues: error.issues }, { status: 422 });
      }
      console.error(error);
      return NextResponse.json({ message: "Erro interno" }, { status: 500 });
    }
  };
}
