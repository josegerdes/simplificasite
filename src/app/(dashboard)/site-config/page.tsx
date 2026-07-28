"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api-client";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { SiteConfigAdmin } from "@/app/(dashboard)/site-config/types";
import { randomId } from "@/lib/random-id";

export default function SiteConfigPage() {
  const queryClient = useQueryClient();
  const { data: config, isLoading } = useQuery<SiteConfigAdmin>({
    queryKey: ["site-config"],
    queryFn: () => apiFetch("/api/site-config"),
  });
  const [form, setForm] = useState<SiteConfigAdmin | null>(null);
  useEffect(() => {
    if (config) setForm(config);
  }, [config]);

  const save = useMutation({
    mutationFn: (patch: Partial<SiteConfigAdmin>) =>
      apiFetch<SiteConfigAdmin>("/api/site-config", { method: "PATCH", body: JSON.stringify(patch) }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["site-config"], updated);
      toast.success("Configurações salvas");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (isLoading || !form) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configurações do site</h1>
        <p className="text-sm text-muted-foreground">Branding, conteúdo da landing, Pixel/Ads e ferramentas de venda</p>
      </div>

      <Tabs defaultValue="branding">
        <TabsList>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="content">Conteúdo</TabsTrigger>
          <TabsTrigger value="pixel">Pixel &amp; Ads</TabsTrigger>
          <TabsTrigger value="sales">Ferramentas de venda</TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Identidade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Nome da marca</Label>
                <Input value={form.brandName} onChange={(e) => setForm({ ...form, brandName: e.target.value })} />
              </div>
              <div className="max-w-xs space-y-1.5">
                <Label>Logo</Label>
                <p className="text-xs text-muted-foreground">
                  Tamanho ideal: 600×200px (proporção 3:1), fundo transparente (PNG) — aparece no menu do site.
                </p>
                <ImageUploadField value={form.logoUrl} onChange={(url) => setForm({ ...form, logoUrl: url })} aspectClassName="aspect-[3/1]" />
              </div>
              <div className="space-y-1.5">
                <Label>WhatsApp de contato (com DDI, ex: 5521999999999)</Label>
                <Input
                  value={form.whatsappNumber ?? ""}
                  onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Instagram (link completo)</Label>
                  <Input
                    placeholder="https://www.instagram.com/simplificadoctor/"
                    value={form.socialLinks.instagram ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, socialLinks: { ...form.socialLinks, instagram: e.target.value || null } })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Facebook (link completo)</Label>
                  <Input
                    placeholder="https://www.facebook.com/..."
                    value={form.socialLinks.facebook ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, socialLinks: { ...form.socialLinks, facebook: e.target.value || null } })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() =>
                    save.mutate({
                      brandName: form.brandName,
                      logoUrl: form.logoUrl,
                      whatsappNumber: form.whatsappNumber,
                      socialLinks: form.socialLinks,
                    })
                  }
                  loading={save.isPending}
                >
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="mt-4">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Hero da home</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Banner de fundo</Label>
                  <p className="text-xs text-muted-foreground">Tamanho ideal: 1920×1080px (bem larga) — ocupa a tela inteira atrás do título.</p>
                  <ImageUploadField
                    value={form.heroImageUrl}
                    onChange={(url) => setForm({ ...form, heroImageUrl: url })}
                    aspectClassName="aspect-video"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Título</Label>
                  <Textarea rows={2} value={form.heroTitle} onChange={(e) => setForm({ ...form, heroTitle: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Subtítulo</Label>
                  <Textarea rows={3} value={form.heroSubtitle} onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })} />
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() =>
                      save.mutate({ heroImageUrl: form.heroImageUrl, heroTitle: form.heroTitle, heroSubtitle: form.heroSubtitle })
                    }
                    loading={save.isPending}
                  >
                    Salvar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Unidades</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setForm({
                      ...form,
                      locations: [...form.locations, { id: randomId(), name: "", address: "", imageUrl: null }],
                    })
                  }
                >
                  <Plus className="h-4 w-4" />
                  Adicionar
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {form.locations.map((location, index) => (
                  <div key={location.id} className="flex gap-2 rounded-md border p-3">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Nome da unidade (ex: Unidade Rio de Janeiro)"
                        value={location.name}
                        onChange={(e) => {
                          const locations = [...form.locations];
                          locations[index] = { ...location, name: e.target.value };
                          setForm({ ...form, locations });
                        }}
                      />
                      <Input
                        placeholder="Endereço completo (usado no mini-mapa)"
                        value={location.address}
                        onChange={(e) => {
                          const locations = [...form.locations];
                          locations[index] = { ...location, address: e.target.value };
                          setForm({ ...form, locations });
                        }}
                      />
                      <div className="max-w-xs">
                        <ImageUploadField
                          value={location.imageUrl ?? ""}
                          onChange={(url) => {
                            const locations = [...form.locations];
                            locations[index] = { ...location, imageUrl: url || null };
                            setForm({ ...form, locations });
                          }}
                          aspectClassName="aspect-video"
                        />
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setForm({ ...form, locations: form.locations.filter((_, i) => i !== index) })}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button onClick={() => save.mutate({ locations: form.locations })} loading={save.isPending}>
                    Salvar unidades
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Pilares</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setForm({ ...form, pillars: [...form.pillars, { title: "", description: "" }] })}
                >
                  <Plus className="h-4 w-4" />
                  Adicionar
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {form.pillars.map((pillar, index) => (
                  <div key={index} className="flex gap-2 rounded-md border p-3">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Título"
                        value={pillar.title}
                        onChange={(e) => {
                          const pillars = [...form.pillars];
                          pillars[index] = { ...pillar, title: e.target.value };
                          setForm({ ...form, pillars });
                        }}
                      />
                      <Textarea
                        placeholder="Descrição"
                        rows={2}
                        value={pillar.description}
                        onChange={(e) => {
                          const pillars = [...form.pillars];
                          pillars[index] = { ...pillar, description: e.target.value };
                          setForm({ ...form, pillars });
                        }}
                      />
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setForm({ ...form, pillars: form.pillars.filter((_, i) => i !== index) })}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button onClick={() => save.mutate({ pillars: form.pillars })} loading={save.isPending}>
                    Salvar pilares
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">Depoimentos</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setForm({
                      ...form,
                      testimonials: [...form.testimonials, { id: randomId(), name: "", role: "", quote: "" }],
                    })
                  }
                >
                  <Plus className="h-4 w-4" />
                  Adicionar
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {form.testimonials.map((testimonial, index) => (
                  <div key={testimonial.id} className="flex gap-2 rounded-md border p-3">
                    <div className="flex-1 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Nome"
                          value={testimonial.name}
                          onChange={(e) => {
                            const testimonials = [...form.testimonials];
                            testimonials[index] = { ...testimonial, name: e.target.value };
                            setForm({ ...form, testimonials });
                          }}
                        />
                        <Input
                          placeholder="Cargo"
                          value={testimonial.role}
                          onChange={(e) => {
                            const testimonials = [...form.testimonials];
                            testimonials[index] = { ...testimonial, role: e.target.value };
                            setForm({ ...form, testimonials });
                          }}
                        />
                      </div>
                      <Textarea
                        placeholder="Depoimento"
                        rows={2}
                        value={testimonial.quote}
                        onChange={(e) => {
                          const testimonials = [...form.testimonials];
                          testimonials[index] = { ...testimonial, quote: e.target.value };
                          setForm({ ...form, testimonials });
                        }}
                      />
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        setForm({ ...form, testimonials: form.testimonials.filter((_, i) => i !== index) })
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button onClick={() => save.mutate({ testimonials: form.testimonials })} loading={save.isPending}>
                    Salvar depoimentos
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pixel" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Facebook Pixel &amp; Conversions API</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-md border px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium">Pixel ativo no site</p>
                  <p className="text-xs text-muted-foreground">Injeta o pixel base em todas as páginas públicas</p>
                </div>
                <Switch
                  checked={form.pixel.enabled}
                  onCheckedChange={(checked) => setForm({ ...form, pixel: { ...form.pixel, enabled: checked } })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Pixel ID</Label>
                  <Input
                    value={form.pixel.pixelId ?? ""}
                    onChange={(e) => setForm({ ...form, pixel: { ...form.pixel, pixelId: e.target.value } })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Test Event Code (Meta Events Manager)</Label>
                  <Input
                    value={form.pixel.testEventCode ?? ""}
                    onChange={(e) => setForm({ ...form, pixel: { ...form.pixel, testEventCode: e.target.value } })}
                  />
                </div>
              </div>
              <Separator />
              <p className="text-sm font-medium">Eventos disparados</p>
              <div className="space-y-2">
                {(
                  [
                    ["pageView", "PageView"],
                    ["viewContent", "ViewContent (página do curso)"],
                    ["initiateCheckout", "InitiateCheckout (abriu o checkout)"],
                    ["purchase", "Purchase (pagamento aprovado — client + Conversions API)"],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between rounded-md border px-3 py-2">
                    <span className="text-sm">{label}</span>
                    <Switch
                      checked={form.pixel.events[key]}
                      onCheckedChange={(checked) =>
                        setForm({ ...form, pixel: { ...form.pixel, events: { ...form.pixel.events, [key]: checked } } })
                      }
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                O token da Conversions API é configurado via variável de ambiente
                (FACEBOOK_CONVERSIONS_ACCESS_TOKEN) no servidor — nunca fica salvo no banco.
              </p>
              <div className="flex justify-end">
                <Button onClick={() => save.mutate({ pixel: form.pixel })} loading={save.isPending}>
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Defaults de ferramentas de venda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Limite de vagas padrão para novos cursos</Label>
                <Input
                  type="number"
                  value={form.salesTools.defaultSeatsLimit ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      salesTools: { ...form.salesTools, defaultSeatsLimit: e.target.value ? Number(e.target.value) : null },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between rounded-md border px-3 py-2.5">
                <p className="text-sm font-medium">Banner de urgência ativo</p>
                <Switch
                  checked={form.salesTools.urgencyBannerEnabled}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, salesTools: { ...form.salesTools, urgencyBannerEnabled: checked } })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Texto do banner de urgência</Label>
                <Input
                  value={form.salesTools.urgencyBannerText}
                  onChange={(e) => setForm({ ...form, salesTools: { ...form.salesTools, urgencyBannerText: e.target.value } })}
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => save.mutate({ salesTools: form.salesTools })} loading={save.isPending}>
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
