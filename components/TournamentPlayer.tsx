"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ItemVisual } from "./ItemVisual";
import { useToast } from "./Toast";
import { bracketSizes, currentPair, pick, progress, roundName, startBracket, type BracketState } from "@/lib/game";
import { setStreamerMode, shareOrCopy } from "@/lib/client";
import type { Quiz } from "@/lib/types";

export function TournamentPlayer({ quiz, streamer: initialStreamer }: { quiz: Quiz; streamer: boolean }) {
  const sizes = useMemo(() => bracketSizes(quiz.items.length), [quiz.items.length]);
  const byId = useMemo(() => new Map(quiz.items.map((i) => [i.id, i])), [quiz.items]);
  const [size, setSize] = useState(sizes.includes(16) ? 16 : sizes[sizes.length - 1]);
  const [state, setState] = useState<BracketState | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [streamer, setStreamer] = useState(initialStreamer);
  const [toast, showToast] = useToast();
  const sent = useRef(false);

  useEffect(() => {
    setStreamerMode(streamer);
    return () => setStreamerMode(false);
  }, [streamer]);

  const pair = state ? currentPair(state) : null;

  const choose = useCallback(
    (id: string) => {
      if (!state || flash) return;
      setFlash(id);
      setTimeout(() => {
        setState((s) => (s ? pick(s, id) : s));
        setFlash(null);
      }, 280);
    },
    [state, flash],
  );

  // Klavye: 1 / ← sol, 2 / → sağ
  useEffect(() => {
    if (!pair) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "1" || e.key === "ArrowLeft") choose(pair[0]);
      if (e.key === "2" || e.key === "ArrowRight") choose(pair[1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pair, choose]);

  // Şampiyon belli olunca sonucu bir kez kaydet
  useEffect(() => {
    if (!state?.champion || sent.current) return;
    sent.current = true;
    fetch(`/api/quizzes/${quiz.slug}/play`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mode: "eleme", champion: state.champion, matches: state.matches }),
    }).catch(() => {});
  }, [state, quiz.slug]);

  const start = () => {
    sent.current = false;
    setState(startBracket(quiz.items.map((i) => i.id), size));
  };

  const streamerToggle = (
    <button className="btn ghost small" onClick={() => setStreamer((v) => !v)}>
      {streamer ? "Yayıncı modundan çık" : "Yayıncı modu"}
    </button>
  );

  // Kurulum ekranı
  if (!state) {
    return (
      <div className="stack" style={{ gap: 24, maxWidth: 680, margin: "0 auto" }}>
        <span className="pill mode-eleme" style={{ alignSelf: "flex-start" }}>
          Bu mu O mu? (Eleme)
        </span>
        <h1>{quiz.title}</h1>
        <div className="panel stack">
          <h3>Kaç seçenekle oynansın?</h3>
          <div className="seg" role="group" aria-label="Turnuva boyutu">
            {sizes.map((n) => (
              <button key={n} aria-pressed={n === size} onClick={() => setSize(n)}>
                {n}
              </button>
            ))}
          </div>
          <p className="muted" style={{ fontSize: "0.9rem" }}>
            {quiz.items.length} öğe arasından rastgele {size} tanesi seçilir, {size - 1} eşleşme oynanır.
          </p>
          <p className="muted" style={{ fontSize: "0.9rem" }}>
            Kısayollar: <span className="key">1</span> ya da <span className="key">←</span> sol,{" "}
            <span className="key">2</span> ya da <span className="key">→</span> sağ.
          </p>
        </div>
        <div className="row">
          <button className="btn sol" onClick={start}>
            Başla
          </button>
          {streamerToggle}
        </div>
      </div>
    );
  }

  // Şampiyon ekranı
  if (state.champion) {
    const champ = byId.get(state.champion)!;
    const path = state.matches.filter((m) => m.winner === champ.id).map((m) => byId.get(m.loser)!);
    const url = typeof window !== "undefined" ? `${location.origin}/q/${quiz.slug}` : "";
    const text = `"${quiz.title}" turnuvasında benim şampiyonum: ${champ.name} 🏆\nSeninki hangisi? ${url}`;
    return (
      <div className="stack" style={{ gap: 24, maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
        <span className="eyebrow">Şampiyon</span>
        <div className="choice picked" style={{ cursor: "default", borderColor: "var(--gold)" }}>
          <div className="visual">
            <ItemVisual item={champ} />
          </div>
          <div className="name">🏆 {champ.name}</div>
        </div>
        {champ.credit && (
          <p className="muted" style={{ fontSize: "0.8rem" }}>
            {champ.credit}
          </p>
        )}
        {path.length > 0 && (
          <p className="muted">
            Yolda elediği: {path.map((p) => p.name).join(", ")}
          </p>
        )}
        <div className="row" style={{ justifyContent: "center" }}>
          <button className="btn sol" onClick={async () => showToast(await shareOrCopy(text, url))}>
            Sonucu paylaş
          </button>
          <button className="btn ghost" onClick={start}>
            Tekrar oyna
          </button>
          <Link href={`/q/${quiz.slug}`} className="btn ghost">
            Topluluk sıralaması
          </Link>
        </div>
        {toast}
      </div>
    );
  }

  // Düello
  const [a, b] = pair!.map((id) => byId.get(id)!);
  const { done, total } = progress(state, size);
  const inRound = state.round.length;
  const matchNo = state.index / 2 + 1;

  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div className="stack" style={{ gap: 2 }}>
          <span className="eyebrow">{quiz.title}</span>
          <h2 className="num">
            {roundName(inRound)}{" "}
            <span className="muted" style={{ fontWeight: 600 }}>
              {matchNo}/{inRound / 2}
            </span>
          </h2>
        </div>
        {streamerToggle}
      </div>
      <div className="progress" aria-label={`${done}/${total} eşleşme`}>
        <div style={{ width: `${(done / total) * 100}%` }} />
      </div>
      <div className="duel">
        {[a, b].map((it, i) => (
          <button
            key={`${state.index}-${it.id}`}
            className={`choice ${i === 0 ? "left" : "right"} ${flash === it.id ? "picked" : flash ? "dropped" : ""}`}
            onClick={() => choose(it.id)}
            aria-label={`${it.name} seç`}
            style={{ order: i === 0 ? 0 : 2 }}
          >
            <div className="visual">
              <ItemVisual item={it} />
            </div>
            <div className="name">
              <span className="key">{i + 1}</span>
              {it.name}
            </div>
          </button>
        ))}
        <div className="vs" style={{ order: 1 }}>
          VS
        </div>
      </div>
      {(a.credit || b.credit) && (
        <p className="muted" style={{ fontSize: "0.75rem", textAlign: "center" }}>
          {[a.credit, b.credit].filter(Boolean).join(" · ")}
        </p>
      )}
    </div>
  );
}
