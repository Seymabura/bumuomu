import { loadImage } from "@/lib/images";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const img = await loadImage(id.replace(/\.[a-z]+$/, ""));
  if (!img) return new Response("Görsel bulunamadı", { status: 404 });
  return new Response(new Uint8Array(img.bytes), {
    headers: {
      "content-type": img.type,
      // İçerikten türetilen kimlik değişmez, bu yüzden görsel sonsuza kadar önbellekte kalabilir.
      "cache-control": "public, max-age=31536000, s-maxage=31536000, immutable",
    },
  });
}
