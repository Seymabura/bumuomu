"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { QuizItem } from "@/lib/types";

/**
 * Ana sayfanın tam genişlik sahnesi: bir quizin fotoğrafları ikişer ikişer
 * yan yana belirir, biri "seçilir", diğeri söner, sonra sıradaki ikiliye geçilir.
 */
export function HeroDuel({
  items,
  slug,
  title,
  children,
}: {
  items: QuizItem[];
  slug: string;
  title: string;
  children: React.ReactNode;
}) {
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
      phase === "bekle" ? 2600 : 1500,
    );
    return () => clearTimeout(t);
  }, [phase, reduced, pairs]);

  if (pairs < 1) return null;
  const a = items[pair * 2];
  const b = items[pair * 2 + 1];
  const winner = pair % 3 === 1 ? b.id : a.id;

  const side = (it: QuizItem, cls: string) => (
    <div
      key={`${pair}-${it.id}`}
      className={`stage-side ${cls}${phase === "sec" ? (it.id === winner ? " win" : " lose") : ""}`}
      aria-hidden="true"
    >
      {it.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={it.image} alt="" />
      )}
      <span className="stage-name">{it.name}</span>
    </div>
  );

  return (
    <section className="stage">
      <Link href={`/q/${slug}/oyna`} className="stage-photos" aria-label={`${title} quizini oyna`} tabIndex={-1}>
        {side(a, "l")}
        {side(b, "r")}
        <span className="vs stage-vs" aria-hidden="true">
          VS
        </span>
      </Link>
      <div className="stage-copy wrap">{children}</div>
      <p className="stage-caption wrap">
        Şu an oynanıyor: <Link href={`/q/${slug}`}>{title}</Link>
      </p>
    </section>
  );
}
