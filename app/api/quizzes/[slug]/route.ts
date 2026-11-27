import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { validateQuiz } from "@/lib/validate";

type Ctx = { params: Promise<{ slug: string }> };

const token = (req: Request) => req.headers.get("x-edit-token") ?? "";

export async function PUT(req: Request, { params }: Ctx) {
  const { slug } = await params;
  const v = validateQuiz(await req.json().catch(() => null));
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });
  const r = await getStore().update(slug, token(req), v.value);
  if (r === null) return NextResponse.json({ error: "Quiz bulunamadı." }, { status: 404 });
  if (r === "yetkisiz") return NextResponse.json({ error: "Bu quizi düzenleme yetkin yok." }, { status: 403 });
  return NextResponse.json({ slug: r.slug });
}

export async function DELETE(req: Request, { params }: Ctx) {
  const { slug } = await params;
  const r = await getStore().remove(slug, token(req));
  if (r === "yetkisiz") return NextResponse.json({ error: "Bu quizi silme yetkin yok." }, { status: 403 });
  if (!r) return NextResponse.json({ error: "Quiz bulunamadı." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
