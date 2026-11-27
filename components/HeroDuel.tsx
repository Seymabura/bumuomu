"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { QuizItem } from "@/lib/types";

/**
 * Ana sayfadaki canlı örnek: bir quizin seçenekleri ikişer ikişer belirir,
 * biri "seçilir", sonra sıradaki ikiliye geçilir. Tıklayınca quiz açılır.
 */
export function HeroDuel({ items, slug, title }: { items: QuizItem[]; slug: string; title: string }) {
  const pairs = Math.floor(items.length / 2);
  const [pair, setPair] = useState(0);
  const [phase, setPhase] = useState<"bekle" | "sec">("bekle");
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reduced || pairs < 2) return;
    const t = setTimeout(
      () => {
        if (phase === "bekle") setPhase("sec");
        else {
          setPhase("bekle");
          setPair((p) => (p + 1) % pairs);
        }
      },
      phase === "bekle" ? 1800 : 1300,
    );
    return () => clearTimeout(t);
  }, [phase, reduced, pairs]);

  if (pairs < 1) return null;
  const a = items[pair * 2];
  const b = items[pair * 2 + 1];
  // Sırayla bazen sol, bazen sağ kazansın
  const winner = pair % 3 === 1 ? b.id : a.id;

  const card = (it: QuizItem) => (
    <div
      className={`hd-card${phase === "sec" ? (it.id === winner ? " win" : " lose") : ""}`}
      key={`${pair}-${it.id}`}
    >
      <div className="art" aria-hidden="true">
        {it.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={it.image} alt="" />
        ) : (
          it.emoji ?? "❔"
        )}
      </div>
      <div className="label">
        <span>{it.name}</span>
        <span className="tick" aria-hidden="true">
          ✓
        </span>
      </div>
    </div>
  );

  return (
    <figure style={{ margin: 0, minWidth: 0 }}>
      <Link href={`/q/${slug}/oyna`} className={`hd${phase === "bekle" && !reduced ? " swap" : ""}`} aria-label={`${title} quizini oyna`}>
        {card(a)}
        <span className="vs" aria-hidden="true">
          VS
        </span>
        {card(b)}
      </Link>
      <figcaption className="hd-caption">
        Örnek eşleşme: <Link href={`/q/${slug}`}>{title}</Link>
      </figcaption>
    </figure>
  );
}
