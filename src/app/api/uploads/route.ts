import { randomUUID } from "crypto";
import path from "path";
import { mkdir, writeFile } from "fs/promises";

import { NextResponse } from "next/server";

import { withApiHandler } from "@/server/http/with-api-handler";
import { ApiError } from "@/server/auth/guards";

// Fora de `public/` no repo (fica só no volume Docker em runtime) — ver nota no
// docker-compose.yml sobre por que isso precisa de volume próprio, separado do
// `public/` que já vem embutido na imagem pelo build.
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

/** O `file.type` do multipart vem do navegador/cliente — fácil de forjar (ex: um .html
 *  renomeado com Content-Type "image/png"). Confere os primeiros bytes reais do arquivo
 *  contra a assinatura de cada formato antes de aceitar, em vez de confiar só no header. */
function matchesImageSignature(buffer: Buffer, mimeType: string): boolean {
  switch (mimeType) {
    case "image/jpeg":
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    case "image/png":
      return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    case "image/webp":
      return buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
    case "image/gif":
      return buffer.subarray(0, 4).toString("ascii") === "GIF8";
    default:
      return false;
  }
}

/** Só exige estar autenticado — quem pode USAR a imagem enviada (trocar a capa de um
 *  curso, o logo, o banner) já é controlado pela permissão da tela que salva a URL. */
export const POST = withApiHandler(async (request) => {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new ApiError(422, "Nenhum arquivo enviado");
  }
  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    throw new ApiError(422, "Formato não suportado — envie JPG, PNG, WEBP ou GIF");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new ApiError(422, "Arquivo muito grande — o limite é 5MB");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!matchesImageSignature(buffer, file.type)) {
    throw new ApiError(422, "O arquivo não é uma imagem válida desse formato");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const fileName = `${randomUUID()}${extension}`;
  await writeFile(path.join(UPLOAD_DIR, fileName), buffer);

  return NextResponse.json({ url: `/uploads/${fileName}` }, { status: 201 });
});
