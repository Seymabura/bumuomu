import type { ItemStats, QuizItem } from "./types";

/** Fisher-Yates karıştırma. rand enjekte edilebilir (test için). */
export function shuffle<T>(arr: readonly T[], rand: () => number = Math.random): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Öğe sayısına göre seçilebilecek turnuva boyutları (2'nin kuvvetleri, en az 4). */
export function bracketSizes(itemCount: number): number[] {
  const sizes: number[] = [];
  for (let n = 4; n <= itemCount && n <= 128; n *= 2) sizes.push(n);
  if (sizes.length === 0 && itemCount >= 2) sizes.push(2);
  return sizes;
}

/** "Son 16", "Çeyrek final" gibi tur adı. remaining = turdaki öğe sayısı. */
export function roundName(remaining: number): string {
  if (remaining <= 2) return "Final";
  if (remaining === 4) return "Yarı final";
  if (remaining === 8) return "Çeyrek final";
  return `Son ${remaining}`;
}

export interface BracketState {
  /** Bu turda yarışan öğe kimlikleri, ikişerli eşleşir: [0,1], [2,3]... */
  round: string[];
  /** Bu turda şu ana kadar kazananlar */
  winners: string[];
  /** Mevcut eşleşmenin round içindeki indeksi (0, 2, 4...) */
  index: number;
  matches: { winner: string; loser: string }[];
  champion?: string;
}

export function startBracket(ids: string[], size: number, rand: () => number = Math.random): BracketState {
  const picked = shuffle(ids, rand).slice(0, size);
  return { round: picked, winners: [], index: 0, matches: [] };
}

export function currentPair(s: BracketState): [string, string] | null {
  if (s.champion) return null;
  return [s.round[s.index], s.round[s.index + 1]];
}

/** Seçimi uygular ve yeni durumu döndürür (saf fonksiyon). */
export function pick(s: BracketState, winnerId: string): BracketState {
  const pair = currentPair(s);
  if (!pair || !pair.includes(winnerId)) return s;
  const loser = pair[0] === winnerId ? pair[1] : pair[0];
  const winners = [...s.winners, winnerId];
  const matches = [...s.matches, { winner: winnerId, loser }];
  const nextIndex = s.index + 2;
  if (nextIndex < s.round.length) {
    return { ...s, winners, matches, index: nextIndex };
  }
  if (winners.length === 1) {
    return { round: s.round, winners, index: nextIndex, matches, champion: winnerId };
  }
  return { round: winners, winners: [], index: 0, matches };
}

/** Bir turnuvadaki toplam eşleşme sayısı ve şu anki sıra (ilerleme çubuğu için). */
export function progress(s: BracketState, size: number): { done: number; total: number } {
  return { done: s.matches.length, total: size - 1 };
}

/** Topluluk sıralaması: önce şampiyonluk oranı, sonra ikili kazanma oranı. */
export function rankItems(items: QuizItem[], stats: Record<string, ItemStats>) {
  return items
    .map((it) => {
      const st = stats[it.id] ?? { seen: 0, wins: 0, champs: 0 };
      return {
        item: it,
        champs: st.champs,
        winRate: st.seen ? st.wins / st.seen : 0,
        seen: st.seen,
      };
    })
    .sort((a, b) => b.champs - a.champs || b.winRate - a.winRate || b.seen - a.seen);
}

/** Gerçek/YZ sonucu için paylaşılabilir metin (Wordle tarzı kare dizisi). */
export function shareText(opts: {
  title: string;
  correct: boolean[];
  url: string;
}): string {
  const score = opts.correct.filter(Boolean).length;
  const squares = opts.correct.map((c) => (c ? "🟩" : "🟥")).join("");
  return `${opts.title}\n${score}/${opts.correct.length} doğru ${squares}\nSen kaç yaparsın? ${opts.url}`;
}

/** Skora göre ünvan. */
export function verdict(score: number, total: number): { title: string; line: string } {
  const r = total ? score / total : 0;
  if (r === 1) return { title: "Deepfake avcısı", line: "Hiçbirini kaçırmadın. Seni kandırmak çok zor." };
  if (r >= 0.8) return { title: "Keskin göz", line: "Çoğunu yakaladın. Birkaç tanesi seni kandırdı." };
  if (r >= 0.6) return { title: "Şüpheci", line: "Fena değil, ama yapay zekâ seni birkaç kez atlattı." };
  if (r >= 0.4) return { title: "Yazı tura", line: "Neredeyse şans eseri kadar. İpuçlarına tekrar göz at." };
  return { title: "Kolay lokma", line: "Yapay zekâ bu turu kazandı. İpuçlarını okuyup tekrar dene." };
}

/** Türkçe karakterleri sadeleştirip URL'ye uygun kısa ad üretir. */
export function slugify(title: string): string {
  const map: Record<string, string> = { ç: "c", ğ: "g", ı: "i", İ: "i", ö: "o", ş: "s", ü: "u", â: "a", î: "i", û: "u" };
  return (
    title
      .replace(/[çğıİöşüâîûÇĞÖŞÜÂÎÛ]/g, (ch) => map[ch] ?? map[ch.toLowerCase()] ?? ch)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "quiz"
  );
}
