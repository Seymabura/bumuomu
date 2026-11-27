import Link from "next/link";
import { rankItems } from "@/lib/game";
import type { Quiz, QuizItem } from "@/lib/types";

/**
 * Ana sayfadaki 8'lik eşleşme tablosu. Gerçek bir quizin ilk 8 seçeneğini gösterir;
 * her ikilide topluluk sıralamasında önde olan bir sonraki tura geçer.
 */
export function BracketArt({ quiz }: { quiz: Quiz }) {
  const items = quiz.items.slice(0, 8);
  if (items.length < 8) return null;
  const order = new Map(rankItems(items, quiz.stats).map((r, i) => [r.item.id, i]));
  const better = (a: QuizItem, b: QuizItem) => ((order.get(a.id) ?? 0) <= (order.get(b.id) ?? 0) ? a : b);

  const rounds: QuizItem[][] = [items];
  while (rounds[rounds.length - 1].length > 1) {
    const prev = rounds[rounds.length - 1];
    const next: QuizItem[] = [];
    for (let i = 0; i < prev.length; i += 2) next.push(better(prev[i], prev[i + 1]));
    rounds.push(next);
  }
  const champ = rounds[rounds.length - 1][0];
  const hasStats = Object.values(quiz.stats).some((s) => s.seen > 0);

  const Slot = ({ it, out }: { it: QuizItem; out?: boolean }) => (
    <div className={`b-slot${out ? " out" : ""}`} title={it.name}>
      <span className="e" aria-hidden="true">
        {it.emoji ?? "❔"}
      </span>
      <span className="n">{it.name}</span>
    </div>
  );

  return (
    <figure className="bracket-wrap" style={{ margin: 0 }}>
      <div className="bracket" aria-label={`${quiz.title} için örnek eşleşme tablosu, kazanan: ${champ.name}`}>
        {rounds.slice(0, -1).map((round, r) => (
          <div className="b-round" key={r}>
            {Array.from({ length: round.length / 2 }, (_, p) => {
              const a = round[p * 2];
              const b = round[p * 2 + 1];
              const w = rounds[r + 1][p];
              return (
                <div className="b-pair" key={p}>
                  <Slot it={a} out={w.id !== a.id} />
                  <Slot it={b} out={w.id !== b.id} />
                </div>
              );
            })}
          </div>
        ))}
        <div className="b-champ">
          <span className="eyebrow">Şampiyon</span>
          <div className="b-slot">
            <span className="e" aria-hidden="true">
              {champ.emoji ?? "❔"}
            </span>
            <span className="n">{champ.name}</span>
          </div>
        </div>
      </div>
      <figcaption className="b-caption">
        {hasStats ? "Topluluğun seçimlerine göre " : "Örnek tablo: "}
        <Link href={`/q/${quiz.slug}`}>{quiz.title}</Link>
      </figcaption>
    </figure>
  );
}
