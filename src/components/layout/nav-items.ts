import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Bot,
  Globe,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  Settings,
  Shield,
  ShoppingBag,
  Users,
} from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  permission?: string;
  requireSuperAdmin?: boolean;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Visão geral",
    items: [{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, permission: "dashboard.view" }],
  },
  {
    title: "Acadêmico",
    items: [{ title: "Cursos", url: "/courses", icon: BookOpen, permission: "courses.view" }],
  },
  {
    title: "Comercial",
    items: [
      { title: "Matrículas", url: "/enrollments", icon: GraduationCap, permission: "sales.view" },
      { title: "Vendedores", url: "/sellers", icon: ShoppingBag, permission: "people.manage" },
    ],
  },
  {
    title: "Site",
    items: [
      { title: "Configurações do site", url: "/site-config", icon: Globe, permission: "site-config.manage" },
      { title: "Vendedor IA", url: "/site-config/ai-agent", icon: Bot, permission: "site-config.manage" },
    ],
  },
  {
    title: "Administração",
    items: [
      { title: "Usuários", url: "/settings/users", icon: Users, permission: "users.manage" },
      { title: "Roles", url: "/settings/roles", icon: Shield, permission: "roles.manage" },
    ],
  },
  {
    title: "Ajuda",
    items: [{ title: "Documentação", url: "/docs", icon: HelpCircle }],
  },
];
