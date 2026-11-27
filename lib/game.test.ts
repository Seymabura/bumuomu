import { test } from "node:test";
import assert from "node:assert/strict";
import { bracketSizes, currentPair, pick, roundName, shareText, slugify, startBracket, verdict } from "./game.ts";

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
