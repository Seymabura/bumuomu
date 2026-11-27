import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { validateQuiz } from "@/lib/validate";

export async function GET(req: Request) {
  const u = new URL(req.url);
  const sort = u.searchParams.get("sirala") === "yeni" ? "yeni" : "populer";
  const mode = u.searchParams.get("mod") ?? undefined;
  const q = u.searchParams.get("q")?.slice(0, 60) ?? undefined;
  const list = await getStore().list({ sort, mode, q });
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const v = validateQuiz(body);
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });
  const { quiz, editToken } = await getStore().create(v.value);
  return NextResponse.json({ slug: quiz.slug, editToken }, { status: 201 });
}
