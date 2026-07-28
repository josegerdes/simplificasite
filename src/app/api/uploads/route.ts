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

  await mkdir(UPLOAD_DIR, { recursive: true });
  const fileName = `${randomUUID()}${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, fileName), buffer);

  return NextResponse.json({ url: `/uploads/${fileName}` }, { status: 201 });
});
