"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, Circle, Download, Plus, Sparkles, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { AiFieldButton } from "@/components/admin/ai-field-button";
import { ChecklistItem, CourseAdmin, CourseStatus, EmentaState } from "@/app/(dashboard)/courses/types";

const STATUS_OPTIONS: { value: CourseStatus; label: string }[] = [
  { value: "DRAFT", label: "Rascunho" },
  { value: "PUBLISHED", label: "Publicado" },
  { value: "SOLD_OUT", label: "Esgotado" },
  { value: "CLOSED", label: "Encerrado (turma já aconteceu)" },
];

export default function CourseShowPage({ params }: { params: { courseId: string } }) {
  const { courseId } = params;
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: course, isLoading } = useQuery<CourseAdmin>({
    queryKey: ["courses", courseId],
    queryFn: () => apiFetch(`/api/courses/${courseId}`),
  });

  const updateCourse = useMutation({
    mutationFn: (patch: Partial<CourseAdmin>) =>
      apiFetch<CourseAdmin>(`/api/courses/${courseId}`, { method: "PATCH", body: JSON.stringify(patch) }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["courses", courseId], updated);
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteCourse = useMutation({
    mutationFn: () => apiFetch(`/api/courses/${courseId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Curso excluído");
      router.push("/courses");
    },
    onError: (error: Error) => {
      if (error instanceof ApiClientError && error.status === 409) {
        toast.error("Este curso já tem matrículas — encerre-o (status \"Encerrado\") em vez de excluir");
      } else {
        toast.error(error.message);
      }
    },
  });

  if (isLoading || !course) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{course.name}</h1>
            <Badge variant={course.status === "PUBLISHED" ? "success" : course.status === "SOLD_OUT" ? "warning" : "outline"}>
              {STATUS_OPTIONS.find((s) => s.value === course.status)?.label ?? course.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">/{course.slug}</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={course.status}
            onValueChange={(value: CourseStatus) => {
              const pending = course.checklist.filter((item) => !item.done).length;
              if (value === "PUBLISHED" && pending > 0 && !confirm(`Ainda há ${pending} pendência(s) no checklist. Publicar mesmo assim?`)) {
                return;
              }
              updateCourse.mutate({ status: value });
            }}
          >
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir &quot;{course.name}&quot;?</AlertDialogTitle>
                <AlertDialogDescription>
                  Essa ação não pode ser desfeita. Cursos com matrículas não podem ser excluídos — use o status
                  &quot;Encerrado&quot; nesse caso.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteCourse.mutate()}>Excluir</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="sales">Ferramentas de venda</TabsTrigger>
          <TabsTrigger value="ementa">Ementa</TabsTrigger>
          <TabsTrigger value="checklist">
            Pendências
            {course.checklist.some((item) => !item.done) && (
              <Badge variant="warning" className="ml-1.5 px-1.5 py-0 text-[10px]">
                {course.checklist.filter((item) => !item.done).length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4">
          <CourseDetailsForm course={course} onSave={(patch) => updateCourse.mutate(patch)} />
        </TabsContent>

        <TabsContent value="sales" className="mt-4">
          <SalesToolsForm course={course} onSave={(patch) => updateCourse.mutate(patch)} />
        </TabsContent>

        <TabsContent value="ementa" className="mt-4">
          <EmentaBuilder courseId={courseId} course={course} />
        </TabsContent>

        <TabsContent value="checklist" className="mt-4">
          <ChecklistPanel courseId={courseId} course={course} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ChecklistPanel({ courseId, course }: { courseId: string; course: CourseAdmin }) {
  const queryClient = useQueryClient();
  const [newLabel, setNewLabel] = useState("");

  const save = useMutation({
    mutationFn: (items: ChecklistItem[]) =>
      apiFetch<CourseAdmin>(`/api/courses/${courseId}/checklist`, { method: "PUT", body: JSON.stringify({ items }) }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["courses", courseId], updated);
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const done = course.checklist.filter((item) => item.done).length;
  const total = course.checklist.length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  function toggle(id: string) {
    save.mutate(course.checklist.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
  }
  function remove(id: string) {
    save.mutate(course.checklist.filter((item) => item.id !== id));
  }
  function add() {
    if (!newLabel.trim()) return;
    save.mutate([
      ...course.checklist,
      { id: crypto.randomUUID(), label: newLabel.trim(), done: false, isDefault: false },
    ]);
    setNewLabel("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Checklist de preparação do curso</CardTitle>
        <p className="text-sm text-muted-foreground">
          Da coleta de conteúdo com o professor até as artes de divulgação — marque o que já foi feito antes
          de publicar.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {done}/{total} concluído
            </span>
            <span className="text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>

        <Separator />

        <div className="space-y-1">
          {course.checklist.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent/50">
              <Checkbox checked={item.done} onCheckedChange={() => toggle(item.id)} />
              <span className={item.done ? "flex-1 text-sm text-muted-foreground line-through" : "flex-1 text-sm"}>
                {item.label}
              </span>
              {item.done ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground/40" />
              )}
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => remove(item.id)}>
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Adicionar pendência personalizada"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
          />
          <Button variant="outline" onClick={add}>
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CourseDetailsForm({
  course,
  onSave,
}: {
  course: CourseAdmin;
  onSave: (patch: Partial<CourseAdmin>) => void;
}) {
  const [form, setForm] = useState(course);
  useEffect(() => setForm(course), [course]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Informações do curso</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Modalidade</Label>
            <Select value={form.modality} onValueChange={(v) => setForm({ ...form, modality: v as any })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRESENCIAL">Presencial</SelectItem>
                <SelectItem value="ONLINE">Online</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label>Descrição curta (aparece nos cards)</Label>
            <AiFieldButton
              courseId={course.id}
              field="shortDescription"
              onResult={(value) => setForm({ ...form, shortDescription: String(value) })}
            />
          </div>
          <Textarea rows={2} value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label>Descrição completa (aparece na página do curso)</Label>
            <AiFieldButton
              courseId={course.id}
              field="longDescription"
              onResult={(value) => setForm({ ...form, longDescription: String(value) })}
            />
          </div>
          <Textarea rows={5} value={form.longDescription} onChange={(e) => setForm({ ...form, longDescription: e.target.value })} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>Carga horária (h)</Label>
            <Input type="number" value={form.workloadHours} onChange={(e) => setForm({ ...form, workloadHours: Number(e.target.value) })} />
          </div>
          <div className="space-y-1.5">
            <Label>Local</Label>
            <Input value={form.location ?? ""} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Data de início (texto livre)</Label>
            <Input
              value={form.startDate ?? ""}
              placeholder="ex: 06 de Agosto"
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Imagem de capa</Label>
          <p className="text-xs text-muted-foreground">
            Tamanho ideal: 1200×800px (proporção 3:2) — aparece nos cards do site e no topo da página do curso.
          </p>
          <ImageUploadField value={form.coverImageUrl} onChange={(url) => setForm({ ...form, coverImageUrl: url })} aspectClassName="aspect-[3/2]" />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label>Destaques (um por linha)</Label>
            <AiFieldButton
              courseId={course.id}
              field="highlights"
              onResult={(value) => setForm({ ...form, highlights: Array.isArray(value) ? value : [String(value)] })}
            />
          </div>
          <Textarea
            rows={4}
            value={form.highlights.join("\n")}
            onChange={(e) => setForm({ ...form, highlights: e.target.value.split("\n").filter(Boolean) })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Instrutores (um por linha)</Label>
          <Textarea
            rows={2}
            value={form.instructors.join("\n")}
            onChange={(e) => setForm({ ...form, instructors: e.target.value.split("\n").filter(Boolean) })}
          />
        </div>
        <div className="flex justify-end">
          <Button
            onClick={() =>
              onSave({
                name: form.name,
                modality: form.modality,
                shortDescription: form.shortDescription,
                longDescription: form.longDescription,
                workloadHours: form.workloadHours,
                location: form.location,
                startDate: form.startDate,
                coverImageUrl: form.coverImageUrl,
                highlights: form.highlights,
                instructors: form.instructors,
              } as Partial<CourseAdmin>)
            }
          >
            Salvar alterações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SalesToolsForm({ course, onSave }: { course: CourseAdmin; onSave: (patch: Partial<CourseAdmin>) => void }) {
  const [form, setForm] = useState(course);
  useEffect(() => setForm(course), [course]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Preço, vagas e urgência</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Valor da matrícula (R$)</Label>
            <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          </div>
          <div className="space-y-1.5">
            <Label>Valor &quot;de&quot; (opcional, mostra tachado)</Label>
            <Input
              type="number"
              step="0.01"
              value={form.originalPrice ?? ""}
              onChange={(e) => setForm({ ...form, originalPrice: e.target.value ? Number(e.target.value) : null })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Limite de vagas (vazio = sem limite)</Label>
            <Input
              type="number"
              value={form.seatsLimit ?? ""}
              onChange={(e) => setForm({ ...form, seatsLimit: e.target.value ? Number(e.target.value) : null })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Vagas vendidas</Label>
            <Input type="number" value={form.seatsSold} disabled />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Prazo do preço promocional (contador de urgência)</Label>
          <Input
            type="datetime-local"
            value={form.promoDeadline ? form.promoDeadline.slice(0, 16) : ""}
            onChange={(e) => setForm({ ...form, promoDeadline: e.target.value ? new Date(e.target.value).toISOString() : null })}
          />
        </div>
        <Separator />
        <div className="space-y-1.5">
          <Label>Pixel do Facebook — sobrescrever para este curso</Label>
          <div className="flex items-center gap-3">
            <Switch
              checked={form.pixelOverride.enabled}
              onCheckedChange={(checked) => setForm({ ...form, pixelOverride: { ...form.pixelOverride, enabled: checked } })}
            />
            <Input
              placeholder="Pixel ID específico deste curso"
              disabled={!form.pixelOverride.enabled}
              value={form.pixelOverride.pixelId ?? ""}
              onChange={(e) => setForm({ ...form, pixelOverride: { ...form.pixelOverride, pixelId: e.target.value } })}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={() =>
              onSave({
                price: form.price,
                originalPrice: form.originalPrice,
                seatsLimit: form.seatsLimit,
                promoDeadline: form.promoDeadline,
                pixelOverride: form.pixelOverride,
              } as Partial<CourseAdmin>)
            }
          >
            Salvar alterações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EmentaBuilder({ courseId, course }: { courseId: string; course: CourseAdmin }) {
  const queryClient = useQueryClient();
  const { data: ementa, isLoading } = useQuery<EmentaState>({
    queryKey: ["ementa", courseId],
    queryFn: () => apiFetch(`/api/courses/${courseId}/ementa`),
  });
  const [modules, setModules] = useState<EmentaState["modules"]>([]);
  useEffect(() => {
    if (ementa) setModules(ementa.modules);
  }, [ementa]);

  const generate = useMutation({
    mutationFn: () => apiFetch<EmentaState>(`/api/courses/${courseId}/ementa/generate`, { method: "POST" }),
    onSuccess: (result) => {
      setModules(result.modules);
      toast.success("Rascunho gerado — revise antes de publicar");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const save = useMutation({
    mutationFn: () =>
      apiFetch<EmentaState>(`/api/courses/${courseId}/ementa`, { method: "PUT", body: JSON.stringify({ modules }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ementa", courseId] });
      toast.success("Ementa salva");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const togglePublish = useMutation({
    mutationFn: (published: boolean) =>
      apiFetch(`/api/courses/${courseId}/ementa`, { method: "PATCH", body: JSON.stringify({ published }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses", courseId] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function addModule() {
    setModules([...modules, { title: "Novo módulo", topics: [] }]);
  }
  function updateModuleTitle(index: number, title: string) {
    setModules(modules.map((m, i) => (i === index ? { ...m, title } : m)));
  }
  function updateTopics(index: number, topicsText: string) {
    setModules(modules.map((m, i) => (i === index ? { ...m, topics: topicsText.split("\n").filter(Boolean) } : m)));
  }
  function removeModule(index: number) {
    setModules(modules.filter((_, i) => i !== index));
  }

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Construtor de ementa</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => generate.mutate()} loading={generate.isPending}>
              <Sparkles className="h-4 w-4" />
              Gerar com IA
            </Button>
            <Button onClick={() => save.mutate()} loading={save.isPending}>
              Salvar ementa
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-md border px-3 py-2.5">
            <div>
              <p className="text-sm font-medium">Publicar ementa no site</p>
              <p className="text-xs text-muted-foreground">
                Quando ativo, o botão &quot;Baixar ementa (PDF)&quot; aparece na página pública do curso
              </p>
            </div>
            <Switch checked={course.ementaPublished} onCheckedChange={(checked) => togglePublish.mutate(checked)} />
          </div>

          {course.ementaPublished && (
            <Link
              href={`/api/public/courses/${course.slug}/ementa-pdf`}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <Download className="h-3.5 w-3.5" />
              Pré-visualizar PDF publicado
            </Link>
          )}

          <Separator />

          <div className="space-y-4">
            {modules.map((module, index) => (
              <div key={index} className="space-y-2 rounded-md border p-3">
                <div className="flex items-center gap-2">
                  <Input
                    value={module.title}
                    onChange={(e) => updateModuleTitle(index, e.target.value)}
                    className="font-medium"
                  />
                  <Button size="icon" variant="ghost" onClick={() => removeModule(index)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <Textarea
                  rows={3}
                  placeholder="Um tópico por linha"
                  value={module.topics.join("\n")}
                  onChange={(e) => updateTopics(index, e.target.value)}
                />
              </div>
            ))}
            <Button variant="outline" onClick={addModule}>
              <Plus className="h-4 w-4" />
              Adicionar módulo
            </Button>
            {modules.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nenhum módulo ainda — use &quot;Gerar com IA&quot; para começar rápido, ou adicione manualmente.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
