import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { randomBytes } from "node:crypto";

/**
 * Tarayıcıda küçültülmüş görseli (data URL) alır.
 * BLOB_READ_WRITE_TOKEN tanımlıysa Vercel Blob'a yükleyip kalıcı adresini döner,
 * değilse aynı data URL'yi döner (görsel quiz verisinin içinde saklanır).
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { dataUrl?: string } | null;
  const m = body?.dataUrl?.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!m) return NextResponse.json({ error: "Görsel okunamadı." }, { status: 400 });
  const bytes = Buffer.from(m[2], "base64");
  if (bytes.length > 1_500_000) return NextResponse.json({ error: "Görsel çok büyük (en fazla 1,5 MB)." }, { status: 413 });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ url: body!.dataUrl, stored: "inline" });
  }
  const ext = m[1].split("/")[1].replace("jpeg", "jpg");
  const blob = await put(`gorseller/${randomBytes(8).toString("hex")}.${ext}`, bytes, {
    access: "public",
    contentType: m[1],
  });
  return NextResponse.json({ url: blob.url, stored: "blob" });
}
