import { Session } from "@/server/auth/session";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function requireAuth(session: Session | null): Session {
  if (!session) throw new ApiError(401, "Não autenticado");
  return session;
}

export function requirePermission(session: Session, permission: string): void {
  if (!session.permissions.has(permission)) {
    throw new ApiError(403, `Permissão necessária: ${permission}`);
  }
}

export function requireSuperAdmin(session: Session): void {
  if (!session.isSuperAdmin) {
    throw new ApiError(403, "Só o administrador geral pode fazer isso");
  }
}

/** Vendedor comum só enxerga as matrículas atribuídas a ele — `sales.view_all`
 *  (ou super admin) libera a visão de tudo. `null` = sem restrição. */
export function resolveSellerScope(session: Session): { sellerId: string | null } {
  if (session.isSuperAdmin || session.permissions.has("sales.view_all")) {
    return { sellerId: null };
  }
  return { sellerId: session.sellerId };
}
