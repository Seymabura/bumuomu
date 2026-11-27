import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { validateResult } from "@/lib/validate";

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = getStore();
  const quiz = await store.get(slug);
  if (!quiz) return NextResponse.json({ error: "Quiz bulunamadı." }, { status: 404 });
  const result = validateResult(await req.json().catch(() => null), new Set(quiz.items.map((i) => i.id)));
  if (!result || result.mode !== quiz.mode) return NextResponse.json({ error: "Geçersiz sonuç." }, { status: 400 });
  await store.recordPlay(slug, result);
  return NextResponse.json({ ok: true });
}
