import Link from "next/link";
import type { QuizSummary } from "@/lib/types";

export function QuizCard({ q }: { q: QuizSummary }) {
  return (
    <Link href={`/q/${q.slug}`} className="qcard">
      <div className="cover">
        {q.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={q.cover} alt="" loading="lazy" />
        ) : (
          <div className="emoji-cover" aria-hidden="true">
            {(q.emojis ?? []).slice(0, 4).map((e, i) => (
              <span key={i}>{e}</span>
            ))}
          </div>
        )}
        <span className={`pill mode-${q.mode} mode-tag`}>{q.mode === "gercek-yz" ? "Gerçek mi, YZ mi?" : "Bu mu O mu?"}</span>
        <div className="body">
          <h3>{q.title}</h3>
          <span className="meta num">
            {q.itemCount} {q.mode === "gercek-yz" ? "görsel" : "seçenek"} ·{" "}
            {q.plays ? `${q.plays.toLocaleString("tr-TR")} kez oynandı` : "yeni"}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function QuizGrid({ list, empty }: { list: QuizSummary[]; empty?: React.ReactNode }) {
  if (list.length === 0) return <div className="panel muted">{empty ?? "Henüz quiz yok."}</div>;
  return (
    <div className="grid">
      {list.map((q) => (
        <QuizCard key={q.id} q={q} />
      ))}
    </div>
  );
}
