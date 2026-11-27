import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ItemVisual } from "@/components/ItemVisual";
import { OwnerTools } from "@/components/OwnerTools";
import { rankItems } from "@/lib/game";
import { getStore } from "@/lib/store";
import { MODE_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";
type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const quiz = await getStore().get((await params).slug);
  if (!quiz) return { title: "Quiz bulunamadı" };
  return {
    title: quiz.title,
    description: quiz.description || MODE_LABELS[quiz.mode],
    openGraph: { title: quiz.title, description: quiz.description || MODE_LABELS[quiz.mode] },
  };
}

export default async function QuizPage({ params }: P) {
  const quiz = await getStore().get((await params).slug);
  if (!quiz) notFound();
  const isElim = quiz.mode === "eleme";
  const ranking = isElim ? rankItems(quiz.items, quiz.stats).slice(0, 10) : [];
  const anyStats = ranking.some((r) => r.seen > 0);

  return (
    <div className="wrap section stack" style={{ gap: 28 }}>
      <div className="stack" style={{ gap: 14 }}>
        <span className={`pill mode-${quiz.mode}`} style={{ alignSelf: "flex-start" }}>
          {MODE_LABELS[quiz.mode]}
        </span>
        <h1>{quiz.title}</h1>
        {quiz.description && (
          <p className="muted" style={{ fontSize: "1.1rem", maxWidth: "65ch" }}>
            {quiz.description}
          </p>
        )}
        <div className="row muted num" style={{ fontSize: "0.9rem" }}>
          <span>{quiz.items.length} öğe</span>
          <span>·</span>
          <span>{quiz.plays.toLocaleString("tr-TR")} kez oynandı</span>
          <span>·</span>
          <span>Oluşturan: {quiz.author}</span>
        </div>
        <div className="row" style={{ marginTop: 6 }}>
          <Link href={`/q/${quiz.slug}/oyna`} className={`btn ${isElim ? "sol" : "sag"}`}>
            Oyna
          </Link>
          <Link href={`/q/${quiz.slug}/oyna?yayin=1`} className="btn ghost">
            Yayıncı modunda oyna
          </Link>
        </div>
        <OwnerTools slug={quiz.slug} />
      </div>

      {isElim && (
        <section className="panel stack">
          <div className="section-head" style={{ marginBottom: 0 }}>
            <h2>Topluluk sıralaması</h2>
            <span className="muted" style={{ fontSize: "0.85rem" }}>
              Şampiyonluk sayısına, sonra ikili kazanma oranına göre
            </span>
          </div>
          {anyStats ? (
            <div className="rank">
              {ranking.map((r, i) => (
                <div className="rank-row" key={r.item.id}>
                  <strong className="num" style={{ fontSize: "1.1rem" }}>
                    {i + 1}
                  </strong>
                  <div className="thumb">
                    <ItemVisual item={r.item} emojiClass="" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700 }}>{r.item.name}</div>
                    <div className="bar">
                      <div style={{ width: `${Math.round(r.winRate * 100)}%` }} />
                    </div>
                  </div>
                  <div className="num muted" style={{ textAlign: "right", fontSize: "0.85rem" }}>
                    <div>
                      <strong style={{ color: "var(--ink)" }}>{r.champs}</strong> şampiyonluk
                    </div>
                    <div>%{Math.round(r.winRate * 100)} kazanma</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">Henüz kimse oynamadı. İlk şampiyonu sen belirle.</p>
          )}
        </section>
      )}

      {!isElim && (
        <section className="panel stack" style={{ gap: 10 }}>
          <h2>Nasıl oynanır?</h2>
          <p className="muted" style={{ maxWidth: "65ch" }}>
            Her turda bir fotoğraf göreceksin. Gerçek bir fotoğraf mı, yoksa yapay zekâ ile mi üretilmiş, tahmin et.
            Cevabından sonra o görseli ele veren ipuçlarını ve kaynağını göreceksin. Sonunda skorunu paylaşabilirsin.
          </p>
          <p className="muted" style={{ fontSize: "0.85rem" }}>
            Kısayollar: <span className="key">G</span> gerçek, <span className="key">Y</span> yapay zekâ,{" "}
            <span className="key">Enter</span> sonraki.
          </p>
        </section>
      )}
    </div>
  );
}
