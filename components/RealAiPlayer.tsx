"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "./Toast";
import { CLUE_MAP } from "@/lib/clues";
import { shareText, shuffle, verdict } from "@/lib/game";
import { setStreamerMode, shareOrCopy } from "@/lib/client";
import type { Answer, Quiz, QuizItem } from "@/lib/types";

const LABEL: Record<Answer, string> = { gercek: "Gerçek", yz: "Yapay zekâ" };

export function RealAiPlayer({ quiz, streamer: initialStreamer }: { quiz: Quiz; streamer: boolean }) {
  const [order, setOrder] = useState<QuizItem[]>(() => quiz.items);
  const [idx, setIdx] = useState(0);
  const [guess, setGuess] = useState<Answer | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const [done, setDone] = useState(false);
  const [streamer, setStreamer] = useState(initialStreamer);
  const [toast, showToast] = useToast();
  const answers = useRef<{ itemId: string; correct: boolean }[]>([]);

  // Sıra yalnızca tarayıcıda karıştırılır (sunucu ile uyumsuzluk olmasın diye)
  useEffect(() => setOrder(shuffle(quiz.items)), [quiz.items]);
  useEffect(() => {
    setStreamerMode(streamer);
    return () => setStreamerMode(false);
  }, [streamer]);

  const item = order[idx];
  const total = order.length;
  const score = results.filter(Boolean).length;

  const answer = useCallback(
    (g: Answer) => {
      if (guess || done) return;
      const correct = g === item.answer;
      setGuess(g);
      setResults((r) => [...r, correct]);
      answers.current.push({ itemId: item.id, correct });
    },
    [guess, done, item],
  );

  const next = useCallback(() => {
    if (!guess) return;
    if (idx + 1 >= total) {
      setDone(true);
      fetch(`/api/quizzes/${quiz.slug}/play`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode: "gercek-yz", answers: answers.current }),
      }).catch(() => {});
    } else {
      setIdx((i) => i + 1);
      setGuess(null);
    }
  }, [guess, idx, total, quiz.slug]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const k = e.key.toLocaleLowerCase("tr");
      if (!guess && (k === "g" || e.key === "ArrowLeft")) answer("gercek");
      else if (!guess && (k === "y" || e.key === "ArrowRight")) answer("yz");
      else if (guess && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [guess, answer, next]);

  const restart = () => {
    setOrder(shuffle(quiz.items));
    setIdx(0);
    setGuess(null);
    setResults([]);
    setDone(false);
    answers.current = [];
  };

  const streamerToggle = (
    <button className="btn ghost small" onClick={() => setStreamer((v) => !v)}>
      {streamer ? "Yayıncı modundan çık" : "Yayıncı modu"}
    </button>
  );

  if (done) {
    const v = verdict(score, total);
    const url = typeof window !== "undefined" ? `${location.origin}/q/${quiz.slug}` : "";
    const text = shareText({ title: quiz.title, correct: results, url });
    const missed = order.filter((_, i) => !results[i]);
    return (
      <div className="stack" style={{ gap: 24, maxWidth: 620, margin: "0 auto", textAlign: "center" }}>
        <span className="eyebrow">Sonuç</span>
        <h1 className="num" style={{ fontFamily: "var(--font-body)", fontWeight: 600 }}>
          {score}/{total}
        </h1>
        <div className="stack" style={{ gap: 6 }}>
          <h2>{v.title}</h2>
          <p className="muted">{v.line}</p>
        </div>
        <div className="squares" aria-label={`${score} doğru, ${total - score} yanlış`}>
          {results.map((c) => (c ? "🟩" : "🟥")).join("")}
        </div>
        <div className="row" style={{ justifyContent: "center" }}>
          <button className="btn sag" onClick={async () => showToast(await shareOrCopy(text, url))}>
            Skorunu paylaş
          </button>
          <a
            className="btn ghost"
            href={`https://x.com/intent/post?text=${encodeURIComponent(text)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            X'te paylaş
          </a>
          <a
            className="btn ghost"
            href={`https://wa.me/?text=${encodeURIComponent(text)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
          <button className="btn ghost" onClick={restart}>
            Tekrar oyna
          </button>
        </div>
        {missed.length > 0 && (
          <div className="panel stack" style={{ textAlign: "left" }}>
            <h3>Seni kandıranlar</h3>
            {missed.map((m) => (
              <div key={m.id} className="row" style={{ alignItems: "flex-start", flexWrap: "nowrap" }}>
                <div className="thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.image} alt="" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <strong>{LABEL[m.answer!]}</strong>
                  {m.name && <span className="muted"> · {m.name}</span>}
                  <div className="muted" style={{ fontSize: "0.85rem" }}>
                    {(m.clueTags ?? []).map((t) => CLUE_MAP[t]?.label).filter(Boolean).join(", ") || m.note}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <Link href="/kesfet?mod=gercek-yz" className="muted">
          Başka setler
        </Link>
        {toast}
      </div>
    );
  }

  if (!item) return null;
  const correct = guess ? guess === item.answer : null;
  const st = quiz.stats[item.id];
  const crowd = st && st.seen >= 5 ? Math.round((st.wins / st.seen) * 100) : null;
  const clues = (item.clueTags ?? []).map((t) => CLUE_MAP[t]).filter(Boolean);

  return (
    <div className="stack" style={{ gap: 18, maxWidth: streamer ? 1200 : 860, margin: "0 auto" }}>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div className="stack" style={{ gap: 2 }}>
          <span className="eyebrow">{quiz.title}</span>
          <h2 className="num">
            {idx + 1}. görsel <span className="count">{total} görselden, {score} doğru</span>
          </h2>
        </div>
        {streamerToggle}
      </div>
      <div className="progress">
        <div style={{ width: `${((idx + (guess ? 1 : 0)) / total) * 100}%` }} />
      </div>

      <div className="photo-frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.image} alt="Gerçek mi yapay zekâ mı tahmin edilecek görsel" draggable={false} />
        {guess && <div className={`stamp ${item.answer}`}>{LABEL[item.answer!]}</div>}
      </div>

      {!guess ? (
        <div className="answer-buttons">
          <button className="btn" style={{ background: "var(--ok)", color: "var(--on-accent)" }} onClick={() => answer("gercek")}>
            📷 Gerçek <span className="key" style={{ color: "var(--on-accent)", borderColor: "currentColor" }}>G</span>
          </button>
          <button className="btn sag" onClick={() => answer("yz")}>
            🤖 Yapay zekâ <span className="key" style={{ color: "var(--on-accent)", borderColor: "currentColor" }}>Y</span>
          </button>
        </div>
      ) : (
        <div className="panel stack" aria-live="polite">
          <div className={`verdict-banner ${correct ? "ok" : "bad"}`}>
            {correct ? "Doğru bildin!" : "Kandırıldın!"}
            <span className="muted" style={{ fontSize: "1rem", fontWeight: 600, fontFamily: "var(--font-body)" }}>
              Bu görsel {item.answer === "yz" ? "yapay zekâ üretimi" : "gerçek bir fotoğraf"}.
            </span>
          </div>
          {crowd !== null && (
            <p className="muted num" style={{ fontSize: "0.9rem" }}>
              Oyuncuların %{crowd}'i bunu doğru bildi.
            </p>
          )}
          {(clues.length > 0 || item.note) && (
            <>
              <h3>{item.answer === "yz" ? "Onu ele veren ipuçları" : "Gerçek olduğunu gösteren işaretler"}</h3>
              <ul className="clue-list">
                {item.note && (
                  <li>
                    <span className={`clue-icon ${item.answer}`}>!</span>
                    <div>
                      <strong>Bu görselde</strong>
                      <div className="muted">{item.note}</div>
                    </div>
                  </li>
                )}
                {clues.map((c) => (
                  <li key={c.id}>
                    <span className={`clue-icon ${c.points}`}>{c.points === "yz" ? "YZ" : "✓"}</span>
                    <div>
                      <strong>{c.label}</strong>
                      <div className="muted">{c.explain}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
          {item.credit && (
            <p className="muted" style={{ fontSize: "0.8rem" }}>
              Kaynak: {item.credit}
            </p>
          )}
          <button className="btn" onClick={next} autoFocus style={{ alignSelf: "flex-end" }}>
            {idx + 1 >= total ? "Sonucu gör" : "Sonraki"} <span className="key">Enter</span>
          </button>
        </div>
      )}
    </div>
  );
}
