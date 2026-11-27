import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { RealAiPlayer } from "@/components/RealAiPlayer";
import { TournamentPlayer } from "@/components/TournamentPlayer";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";
type P = { params: Promise<{ slug: string }>; searchParams: Promise<{ yayin?: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const quiz = await getStore().get((await params).slug);
  return { title: quiz ? `${quiz.title} oyna` : "Quiz bulunamadı" };
}

export default async function PlayPage({ params, searchParams }: P) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const quiz = await getStore().get(slug);
  if (!quiz) notFound();
  const streamer = sp.yayin === "1";
  return (
    <div className="wrap play-shell section">
      {quiz.mode === "eleme" ? (
        <TournamentPlayer quiz={quiz} streamer={streamer} />
      ) : (
        <RealAiPlayer quiz={quiz} streamer={streamer} />
      )}
    </div>
  );
}
