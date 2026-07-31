import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

import { connectDB } from "@/server/db/client";
import { collections } from "@/server/db/collections";
import { withApiHandler } from "@/server/http/with-api-handler";

export const dynamic = "force-dynamic";

/** Serve a imagem direto do Mongo — rota pública (sem auth) porque essas imagens aparecem
 *  no site público (logo, banner, capa de curso, foto de unidade). Cache longo e imutável:
 *  cada upload novo gera um id novo, então o conteúdo de um id nunca muda. */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  let objectId: ObjectId;
  try {
    objectId = ObjectId.createFromHexString(params.id);
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const db = await connectDB();
  const image = await collections.uploadedImages(db).findOne({ _id: objectId });
  if (!image) return new NextResponse(null, { status: 404 });

  return new NextResponse(new Uint8Array(image.data), {
    headers: {
      "Content-Type": image.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

export const DELETE = withApiHandler<{ params: { id: string } }>(async (request, { params }) => {
  const db = await connectDB();
  await collections.uploadedImages(db).deleteOne({ _id: ObjectId.createFromHexString(params.id) });
  return NextResponse.json({ ok: true });
});
