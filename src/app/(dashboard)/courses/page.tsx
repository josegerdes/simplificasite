"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { BookOpen, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api-client";
import { CourseAdmin } from "@/app/(dashboard)/courses/types";

const STATUS_LABEL: Record<string, { label: string; variant: "success" | "outline" | "warning" | "destructive" }> = {
  DRAFT: { label: "Rascunho", variant: "outline" },
  PUBLISHED: { label: "Publicado", variant: "success" },
  SOLD_OUT: { label: "Esgotado", variant: "warning" },
  CLOSED: { label: "Encerrado", variant: "destructive" },
};

const createCourseSchema = z.object({
  name: z.string().min(2, "Informe o nome"),
  modality: z.enum(["PRESENCIAL", "ONLINE"]),
  shortDescription: z.string().min(1, "Informe uma descrição curta"),
  workloadHours: z.coerce.number().int().positive("Informe a carga horária"),
  price: z.coerce.number().min(0, "Informe o valor da matrícula"),
});
type CreateCourseValues = z.infer<typeof createCourseSchema>;

export default function CoursesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);

  const { data: courses, isLoading } = useQuery<CourseAdmin[]>({
    queryKey: ["courses"],
    queryFn: () => apiFetch("/api/courses"),
  });

  const form = useForm<CreateCourseValues>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: { name: "", modality: "PRESENCIAL", shortDescription: "", workloadHours: 0, price: 500 },
  });

  const createCourse = useMutation({
    mutationFn: (values: CreateCourseValues) =>
      apiFetch<CourseAdmin>("/api/courses", { method: "POST", body: JSON.stringify(values) }),
    onSuccess: (course) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Curso criado — configure a ementa e publique quando estiver pronto");
      setCreateOpen(false);
      form.reset();
      router.push(`/courses/${course.id}`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cursos</h1>
          <p className="text-sm text-muted-foreground">Presenciais e online — ementa, vagas e preço de matrícula</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Novo curso
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo curso</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit((values) => createCourse.mutate(values))}
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do curso</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="modality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modalidade</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PRESENCIAL">Presencial</SelectItem>
                          <SelectItem value="ONLINE">Online</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição curta</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="workloadHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Carga horária (h)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor da matrícula (R$)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" loading={createCourse.isPending}>
                    Criar curso
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Curso</TableHead>
              <TableHead>Modalidade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Vagas</TableHead>
              <TableHead>Preço</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && courses?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  <BookOpen className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  Nenhum curso cadastrado ainda
                </TableCell>
              </TableRow>
            )}
            {courses?.map((course) => (
              <TableRow key={course.id} className="cursor-pointer" onClick={() => router.push(`/courses/${course.id}`)}>
                <TableCell className="font-medium">{course.name}</TableCell>
                <TableCell>{course.modality === "PRESENCIAL" ? "Presencial" : "Online"}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_LABEL[course.status]?.variant ?? "outline"}>
                    {STATUS_LABEL[course.status]?.label ?? course.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {course.seatsLimit ? `${course.seatsSold}/${course.seatsLimit}` : "Sem limite"}
                </TableCell>
                <TableCell>
                  {course.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
