import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { QuizEditor } from "@/components/QuizEditor";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Quizi düzenle" };

export default async function Duzenle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const quiz = await getStore().get(slug);
  if (!quiz) notFound();
  const { mode, title, description, author, cover, items } = quiz;
  return (
    <div className="wrap section">
      <QuizEditor slug={slug} initial={{ mode, title, description, author, cover, items }} />
    </div>
  );
}
