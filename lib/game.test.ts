import { test } from "node:test";
import assert from "node:assert/strict";
import { effectiveLevel, pickRound, bracketSizes, currentPair, pick, roundName, shareText, slugify, startBracket, verdict } from "./game.ts";

const seq = () => {
  let x = 0.123;
  return () => (x = (x * 9301 + 0.49297) % 1);
};

test("bracketSizes", () => {
  assert.deepEqual(bracketSizes(3), [2]);
  assert.deepEqual(bracketSizes(4), [4]);
  assert.deepEqual(bracketSizes(20), [4, 8, 16]);
  assert.deepEqual(bracketSizes(64), [4, 8, 16, 32, 64]);
});

test("16'lık turnuva 15 eşleşmede tek şampiyonla biter", () => {
  const ids = Array.from({ length: 20 }, (_, i) => `i${i}`);
  let s = startBracket(ids, 16, seq());
  assert.equal(s.round.length, 16);
  assert.equal(new Set(s.round).size, 16);
  let n = 0;
  while (!s.champion) {
    const p = currentPair(s)!;
    s = pick(s, p[0]);
    n++;
    assert.ok(n <= 15);
  }
  assert.equal(n, 15);
  assert.equal(s.matches.length, 15);
  assert.equal(currentPair(s), null);
  // Şampiyon kaybetmemiş olmalı, diğer 15 öğe tam bir kez kaybetmiş olmalı
  const losers = s.matches.map((m) => m.loser);
  assert.equal(new Set(losers).size, 15);
  assert.ok(!losers.includes(s.champion));
});

test("geçersiz seçim durumu değiştirmez", () => {
  const s = startBracket(["a", "b", "c", "d"], 4, seq());
  assert.equal(pick(s, "yok"), s);
});

test("tur adları", () => {
  assert.equal(roundName(2), "Final");
  assert.equal(roundName(4), "Yarı final");
  assert.equal(roundName(8), "Çeyrek final");
  assert.equal(roundName(32), "Son 32");
});

test("slugify Türkçe karakterleri sadeleştirir", () => {
  assert.equal(slugify("Gerçek mi, Yapay Zekâ mı?"), "gercek-mi-yapay-zeka-mi");
  assert.equal(slugify("İstanbul'un EN İYİ Şarkısı"), "istanbul-un-en-iyi-sarkisi");
  assert.equal(slugify("???"), "quiz");
});

test("paylaşım metni ve ünvan", () => {
  const t = shareText({ title: "Test", correct: [true, false, true], url: "https://x.y/q/t" });
  assert.match(t, /2\/3 doğru 🟩🟥🟩/);
  assert.equal(verdict(10, 10).title, "Deepfake avcısı");
  assert.equal(verdict(0, 10).title, "Kolay lokma");
});

test("effectiveLevel oyuncu oranına göre ayarlanır", () => {
  const it = { id: "a", name: "", answer: "yz" as const, level: "zor" as const };
  assert.equal(effectiveLevel(it), "zor");
  assert.equal(effectiveLevel(it, { seen: 10, wins: 10, champs: 0 }), "zor");
  assert.equal(effectiveLevel(it, { seen: 20, wins: 18, champs: 0 }), "kolay");
  assert.equal(effectiveLevel(it, { seen: 20, wins: 12, champs: 0 }), "orta");
  assert.equal(effectiveLevel(it, { seen: 20, wins: 5, champs: 0 }), "zor");
});

test("pickRound seviyeye göre dengeli tur kurar", () => {
  const items = Array.from({ length: 40 }, (_, i) => ({
    id: `i${i}`,
    name: "",
    answer: (i % 2 ? "yz" : "gercek") as "yz" | "gercek",
    level: (["kolay", "orta", "zor"] as const)[i % 3],
  }));
  const r = pickRound(items, {}, "orta", 10, seq());
  assert.equal(r.length, 10);
  assert.ok(r.every((x) => x.level === "orta"));
  assert.equal(new Set(r.map((x) => x.id)).size, 10);
  const g = r.filter((x) => x.answer === "gercek").length;
  assert.ok(g >= 3 && g <= 7);
  assert.equal(pickRound(items, {}, null, 50, seq()).length, 40);
});
