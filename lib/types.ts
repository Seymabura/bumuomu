export type QuizMode = "eleme" | "gercek-yz";

export const MODE_LABELS: Record<QuizMode, string> = {
  eleme: "Bu mu O mu? (Eleme)",
  "gercek-yz": "Gerçek mi, Yapay Zekâ mı?",
};

export type Answer = "gercek" | "yz";

/** Gerçek/YZ modunda görselin zorluk seviyesi. */
export type Level = "kolay" | "orta" | "zor";

export const LEVEL_LABELS: Record<Level, string> = { kolay: "Kolay", orta: "Orta", zor: "Zor" };

export interface QuizItem {
  id: string;
  /** Görünen ad. Eleme modunda zorunlu, Gerçek/YZ modunda isteğe bağlı başlık. */
  name: string;
  /** Görsel adresi (https://, /yerel veya data:image/...). Boşsa emoji/metin kartı gösterilir. */
  image?: string;
  /** Görsel yoksa kartta büyük gösterilecek emoji. */
  emoji?: string;
  /** Görselin kaynağı ve lisansı. Örn. "Fotoğraf: Ayşe K., CC BY 4.0" ya da "Midjourney v6 ile üretildi". */
  credit?: string;

  // Yalnızca gercek-yz modu
  answer?: Answer;
  /** clues.ts içindeki hazır ipucu kimlikleri */
  clueTags?: string[];
  /** Görsele özel serbest açıklama: "Sol eldeki altıncı parmağa bak" gibi */
  note?: string;
  /**
   * Başlangıç zorluğu. Yeterince oynandıktan sonra gerçek zorluk oyuncuların
   * doğru bilme oranından hesaplanır (bkz. effectiveLevel).
   */
  level?: Level;
}

export interface ItemStats {
  /** Eleme: oynanan ikili sayısı / Gerçek-YZ: cevaplanma sayısı */
  seen: number;
  /** Eleme: kazanılan ikili / Gerçek-YZ: doğru bilinme */
  wins: number;
  /** Eleme: şampiyonluk sayısı */
  champs: number;
}

export interface Quiz {
  id: string;
  slug: string;
  mode: QuizMode;
  title: string;
  description: string;
  author: string;
  cover?: string;
  items: QuizItem[];
  plays: number;
  createdAt: string;
  stats: Record<string, ItemStats>;
}

/** Listeleme için hafif özet (öğe görselleri olmadan). */
export interface QuizSummary {
  id: string;
  slug: string;
  mode: QuizMode;
  title: string;
  description: string;
  author: string;
  cover?: string;
  /** Görselsiz quizlerde kapak yerine gösterilecek ilk birkaç emoji */
  emojis?: string[];
  itemCount: number;
  plays: number;
  createdAt: string;
}

export interface QuizInput {
  mode: QuizMode;
  title: string;
  description: string;
  author: string;
  cover?: string;
  items: QuizItem[];
}

/** Bir oyun bitince sunucuya gönderilen sonuç. */
export type PlayResult =
  | { mode: "eleme"; matches: { winner: string; loser: string }[]; champion: string }
  | { mode: "gercek-yz"; answers: { itemId: string; correct: boolean }[] };
