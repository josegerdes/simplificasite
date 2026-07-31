import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { connectDB } from "@/server/db/client";
import { collections } from "@/server/db/collections";
import { withApiHandler } from "@/server/http/with-api-handler";
import { ApiError } from "@/server/auth/guards";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

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
 *  curso, o logo, o banner) já é controlado pela permissão da tela que salva a URL.
 *  Fica salva no Mongo (não no filesystem do container) — serve via GET /api/uploads/[id],
 *  sem depender de volume Docker persistente configurado certo em produção. */
export const POST = withApiHandler(async (request) => {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new ApiError(422, "Nenhum arquivo enviado");
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new ApiError(422, "Formato não suportado — envie JPG, PNG, WEBP ou GIF");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new ApiError(422, "Arquivo muito grande — o limite é 5MB");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!matchesImageSignature(buffer, file.type)) {
    throw new ApiError(422, "O arquivo não é uma imagem válida desse formato");
  }

  const db = await connectDB();
  const image = { _id: new ObjectId(), contentType: file.type, data: buffer, createdAt: new Date() };
  await collections.uploadedImages(db).insertOne(image);

  return NextResponse.json({ url: `/api/uploads/${image._id.toHexString()}` }, { status: 201 });
});
