import { CLUE_MAP } from "./clues";
import type { PlayResult, QuizInput, QuizItem, QuizMode } from "./types";

const MAX_DATA_URL = 700_000; // ~500 KB görsel
const MAX_ITEMS = 128;

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export function cleanImage(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  if (!s) return undefined;
  if (s.startsWith("data:image/")) return s.length <= MAX_DATA_URL ? s : undefined;
  if (/^https:\/\/[^\s"'<>]+$/i.test(s) && s.length < 2000) return s;
  if (/^\/[a-z0-9/_.-]+$/i.test(s)) return s; // public/ altındaki dosyalar
  return undefined;
}

export type ValidationResult = { ok: true; value: QuizInput } | { ok: false; error: string };

export function validateQuiz(raw: unknown): ValidationResult {
  if (!raw || typeof raw !== "object") return { ok: false, error: "Geçersiz istek." };
  const r = raw as Record<string, unknown>;
  const mode = r.mode as QuizMode;
  if (mode !== "eleme" && mode !== "gercek-yz") return { ok: false, error: "Bir mod seç." };

  const title = str(r.title, 80);
  if (title.length < 3) return { ok: false, error: "Başlık en az 3 karakter olmalı." };

  const rawItems = Array.isArray(r.items) ? r.items.slice(0, MAX_ITEMS) : [];
  const seen = new Set<string>();
  const items: QuizItem[] = [];
  for (const [i, x] of rawItems.entries()) {
    if (!x || typeof x !== "object") continue;
    const it = x as Record<string, unknown>;
    let id = str(it.id, 40).replace(/[^a-zA-Z0-9_-]/g, "") || `o${i}`;
    while (seen.has(id)) id = `${id}x`;
    seen.add(id);
    const item: QuizItem = {
      id,
      name: str(it.name, 60),
      image: cleanImage(it.image),
      emoji: str(it.emoji, 8) || undefined,
      credit: str(it.credit, 200) || undefined,
    };
    if (mode === "gercek-yz") {
      if (it.answer !== "gercek" && it.answer !== "yz") {
        return { ok: false, error: `${i + 1}. görsel için "Gerçek" ya da "Yapay zekâ" seç.` };
      }
      if (!item.image) return { ok: false, error: `${i + 1}. öğenin görseli eksik ya da geçersiz.` };
      item.answer = it.answer;
      item.clueTags = Array.isArray(it.clueTags)
        ? it.clueTags.filter((t): t is string => typeof t === "string" && t in CLUE_MAP).slice(0, 8)
        : [];
      item.note = str(it.note, 400) || undefined;
    } else {
      if (!item.name) return { ok: false, error: `${i + 1}. öğenin adı boş.` };
      if (!item.image && !item.emoji) return { ok: false, error: `"${item.name}" için görsel ya da emoji ekle.` };
    }
    items.push(item);
  }

  const min = mode === "eleme" ? 4 : 3;
  if (items.length < min) return { ok: false, error: `Bu mod için en az ${min} öğe gerekli.` };

  return {
    ok: true,
    value: {
      mode,
      title,
      description: str(r.description, 300),
      author: str(r.author, 40) || "Anonim",
      cover: cleanImage(r.cover),
      items,
    },
  };
}

export function validateResult(raw: unknown, itemIds: Set<string>): PlayResult | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.mode === "eleme") {
    if (typeof r.champion !== "string" || !itemIds.has(r.champion) || !Array.isArray(r.matches)) return null;
    const matches = r.matches
      .slice(0, MAX_ITEMS)
      .filter(
        (m): m is { winner: string; loser: string } =>
          !!m && typeof m === "object" && itemIds.has((m as any).winner) && itemIds.has((m as any).loser),
      )
      .map((m) => ({ winner: m.winner, loser: m.loser }));
    return { mode: "eleme", champion: r.champion, matches };
  }
  if (r.mode === "gercek-yz" && Array.isArray(r.answers)) {
    const answers = r.answers
      .slice(0, MAX_ITEMS)
      .filter(
        (a): a is { itemId: string; correct: boolean } =>
          !!a && typeof a === "object" && itemIds.has((a as any).itemId) && typeof (a as any).correct === "boolean",
      )
      .map((a) => ({ itemId: a.itemId, correct: a.correct }));
    return { mode: "gercek-yz", answers };
  }
  return null;
}
