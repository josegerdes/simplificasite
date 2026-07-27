"use client";

import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { GraduationCap, TrendingUp, Users, Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api-client";
import { formatBRL } from "@/lib/format";

interface DashboardStats {
  enrollmentsToday: number;
  enrollmentsWeek: number;
  enrollmentsMonth: number;
  totalApproved: number;
  totalAll: number;
  revenue: number;
  conversionRate: number;
  sellerRanking: { name: string; count: number }[];
  topCourses: { name: string; count: number }[];
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: () => apiFetch("/api/dashboard/stats"),
  });

  if (isLoading || !stats) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral de vendas de matrículas</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<GraduationCap className="h-5 w-5" />} label="Matrículas hoje" value={String(stats.enrollmentsToday)} />
        <StatCard icon={<GraduationCap className="h-5 w-5" />} label="Matrículas no mês" value={String(stats.enrollmentsMonth)} />
        <StatCard icon={<Wallet className="h-5 w-5" />} label="Receita total" value={formatBRL(stats.revenue)} />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Taxa de conversão" value={`${stats.conversionRate}%`} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cursos com mais matrículas</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topCourses.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma matrícula aprovada ainda</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.topCourses} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2 space-y-0">
            <Users className="h-4 w-4" />
            <CardTitle className="text-base">Ranking de vendedores</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.sellerRanking.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma matrícula atribuída ainda</p>
            ) : (
              <ul className="space-y-3">
                {stats.sellerRanking.map((seller, index) => (
                  <li key={seller.name} className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {index + 1}. {seller.name}
                    </span>
                    <span className="text-muted-foreground">{seller.count} matrícula(s)</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className="rounded-full bg-primary/10 p-3 text-primary">{icon}</div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
