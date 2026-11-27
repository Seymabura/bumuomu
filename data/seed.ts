import type { Quiz, QuizItem } from "@/lib/types";

/**
 * İlk açılışta veritabanına eklenen örnek quizler.
 * Lisans derdi olmasın diye görsel yerine emoji kullanıyorlar.
 * "Gerçek mi, Yapay Zekâ mı?" için örnek yok: bu modda görsellerin kaynağı ve lisansı
 * bilinmeli, o yüzden setleri site üzerinden "Quiz oluştur" ile kendi görsellerinizle ekleyin.
 */
const items = (list: [string, string][]): QuizItem[] =>
  list.map(([emoji, name], i) => ({ id: `s${i + 1}`, name, emoji }));

const base = { author: "Bu mu O mu?", plays: 0, stats: {} } as const;

export const SEED_QUIZZES: Quiz[] = [
  {
    ...base,
    id: "seed-sokak",
    slug: "en-iyi-sokak-lezzeti",
    mode: "eleme",
    title: "En iyi sokak lezzeti hangisi?",
    description: "16 sokak lezzeti, tek şampiyon. Her ikiliden birini seç, sonuna kadar gör.",
    createdAt: "2026-11-27T10:00:00.000Z",
    items: items([
      ["🥯", "Simit"],
      ["🦪", "Midye dolma"],
      ["🌯", "Dürüm"],
      ["🥙", "Kokoreç"],
      ["🌽", "Közde mısır"],
      ["🌰", "Kestane kebap"],
      ["🐟", "Balık ekmek"],
      ["🥔", "Kumpir"],
      ["🍔", "Islak hamburger"],
      ["🥟", "Çiğ börek"],
      ["🍩", "Lokma"],
      ["🥐", "Poğaça"],
      ["🍗", "Tavuk pilav"],
      ["🫓", "Gözleme"],
      ["🍋", "Kokulu limonata"],
      ["🍨", "Maraş dondurması"],
    ]),
  },
  {
    ...base,
    id: "seed-guc",
    slug: "hangi-super-gucu-secerdin",
    mode: "eleme",
    title: "Hangi süper gücü seçerdin?",
    description: "Sadece birini alabilirsin. Yayında sohbete sor, oylamayla ilerle.",
    createdAt: "2026-11-27T09:00:00.000Z",
    items: items([
      ["🕊️", "Uçmak"],
      ["👻", "Görünmezlik"],
      ["⏳", "Zamanı durdurmak"],
      ["🧠", "Akıl okumak"],
      ["🌀", "Işınlanma"],
      ["🗣️", "Bütün dilleri konuşmak"],
      ["💪", "Süper güç"],
      ["🔮", "Geleceği görmek"],
    ]),
  },
  {
    ...base,
    id: "seed-kahvalti",
    slug: "kahvaltinin-yildizi",
    mode: "eleme",
    title: "Kahvaltının yıldızı",
    description: "Serpme kahvaltıda tek bir şey kalacak olsa hangisi olurdu?",
    createdAt: "2026-11-27T08:00:00.000Z",
    items: items([
      ["🍳", "Menemen"],
      ["🧀", "Beyaz peynir"],
      ["🫒", "Zeytin"],
      ["🍯", "Bal kaymak"],
      ["🍅", "Domates salatalık"],
      ["🥚", "Haşlanmış yumurta"],
      ["🥖", "Taze ekmek"],
      ["🌭", "Sucuklu yumurta"],
    ]),
  },
];
