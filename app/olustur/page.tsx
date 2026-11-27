import type { Metadata } from "next";
import { QuizEditor } from "@/components/QuizEditor";

export const metadata: Metadata = { title: "Quiz oluştur" };

export default async function Olustur({ searchParams }: { searchParams: Promise<{ mod?: string }> }) {
  const { mod } = await searchParams;
  const initial =
    mod === "gercek-yz"
      ? { mode: "gercek-yz" as const, title: "", description: "", author: "", items: [1, 2, 3].map((n) => ({ id: `y${n}`, name: "" })) }
      : undefined;
  return (
    <div className="wrap section">
      <QuizEditor key={mod ?? "eleme"} initial={initial} />
    </div>
  );
}
