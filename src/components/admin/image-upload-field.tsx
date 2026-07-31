"use client";

import { useRef, useState } from "react";
import { ImageOff, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UploadResponse {
  url: string;
}

/** Preview + upload de arquivo (com fallback pra colar uma URL direto) — usado em todo
 *  campo de imagem do admin (logo, banner do hero, capa de curso). Upload vai pro
 *  volume persistente `public/uploads` (ver docker-compose.yml). */
export function ImageUploadField({
  value,
  onChange,
  aspectClassName = "aspect-video",
}: {
  value: string | null;
  onChange: (url: string) => void;
  aspectClassName?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/uploads", { method: "POST", body: formData });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message ?? "Falha ao enviar imagem");
      }
      const data: UploadResponse = await response.json();
      const previousUrl = value;
      onChange(data.url);
      toast.success("Imagem enviada");
      // Best-effort: apaga a imagem anterior pra não acumular arquivo órfão a cada troca —
      // só some imagem que a gente mesmo hospeda (/api/uploads/...), nunca uma URL externa.
      if (previousUrl?.startsWith("/api/uploads/")) {
        fetch(previousUrl, { method: "DELETE" }).catch(() => {});
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao enviar imagem");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className={`relative w-full overflow-hidden rounded-md border bg-muted ${aspectClassName}`}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageOff className="h-6 w-6" />
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="URL da imagem ou envie um arquivo" />
        <Button type="button" variant="outline" loading={uploading} onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-4 w-4" />
          Enviar
        </Button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      </div>
    </div>
  );
}
