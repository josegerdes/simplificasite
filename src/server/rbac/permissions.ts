/**
 * Catálogo fixo de permissões, agrupado por categoria (estilo painel de
 * permissões do Discord). `roles` no banco guardam um array de chaves daqui.
 */
export interface PermissionDef {
  key: string;
  label: string;
  description: string;
}

export interface PermissionCategory {
  key: string;
  label: string;
  permissions: PermissionDef[];
}

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    permissions: [
      { key: "dashboard.view", label: "Ver dashboard", description: "Visualizar KPIs de vendas e desempenho geral" },
    ],
  },
  {
    key: "courses",
    label: "Cursos",
    permissions: [
      { key: "courses.view", label: "Ver cursos", description: "Visualizar cursos e suas configurações" },
      { key: "courses.manage", label: "Gerenciar cursos", description: "Criar, editar e publicar cursos" },
    ],
  },
  {
    key: "ementa",
    label: "Ementa",
    permissions: [
      {
        key: "ementa.manage",
        label: "Gerenciar ementa",
        description: "Gerar (com IA), editar e publicar a ementa de cada curso",
      },
    ],
  },
  {
    key: "sales",
    label: "Vendas / Matrículas",
    permissions: [
      { key: "sales.view", label: "Ver minhas matrículas", description: "Ver as matrículas atribuídas a mim" },
      {
        key: "sales.view_all",
        label: "Ver todas as matrículas",
        description: "Ver as matrículas de todos os vendedores",
      },
      {
        key: "sales.manage",
        label: "Gerenciar matrículas",
        description: "Atualizar status de contato, reatribuir vendedor e adicionar notas",
      },
    ],
  },
  {
    key: "people",
    label: "Pessoas",
    permissions: [{ key: "people.manage", label: "Gerenciar vendedores", description: "Criar e editar vendedores" }],
  },
  {
    key: "site-config",
    label: "Configurações do site",
    permissions: [
      {
        key: "site-config.manage",
        label: "Gerenciar configurações do site",
        description: "Branding, conteúdo, Pixel/Ads, vendedor IA e ferramentas de venda",
      },
    ],
  },
  {
    key: "administration",
    label: "Administração",
    permissions: [
      { key: "users.manage", label: "Gerenciar usuários", description: "Criar/editar usuários e atribuir roles" },
      { key: "roles.manage", label: "Gerenciar roles", description: "Criar/editar roles e permissões" },
    ],
  },
];

export const ALL_PERMISSIONS: string[] = PERMISSION_CATEGORIES.flatMap((category) =>
  category.permissions.map((permission) => permission.key)
);

export function isValidPermission(key: string): boolean {
  return ALL_PERMISSIONS.includes(key);
}
