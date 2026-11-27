import Link from "next/link";
import { MODE_LABELS, type QuizSummary } from "@/lib/types";

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
      </div>
      <div className="body">
        <span className={`pill mode-${q.mode}`} style={{ alignSelf: "flex-start" }}>
          {MODE_LABELS[q.mode]}
        </span>
        <h3>{q.title}</h3>
        <div className="meta num">
          <span>{q.itemCount} öğe</span>
          <span>·</span>
          <span>{q.plays.toLocaleString("tr-TR")} oynanma</span>
          <span>·</span>
          <span>{q.author}</span>
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
