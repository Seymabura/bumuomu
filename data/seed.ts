import type { Quiz, QuizItem } from "@/lib/types";
import { YZ_SEVIYE_ITEMS } from "./seed-yz-seviyeler";

/**
 * Sitede hazır gelen örnek quizler.
 * Eleme quizlerinin fotoğrafları Unsplash'ten (Unsplash Lisansı: ücretsiz kullanım, atıf önerilir).
 * "Gerçek mi, Yapay Zekâ mı?" setinde gerçek kareler Unsplash'ten, YZ kareleri ChatGPT ile
 * bu site için üretildi ve /public/yz altında duruyor.
 */
const u = (id: string) => `https://images.unsplash.com/${id}?w=900&q=80&auto=format&fit=crop`;

type Row = [name: string, photo: string, author: string];
const photos = (list: Row[]): QuizItem[] =>
  list.map(([name, photo, author], i) => ({
    id: `s${i + 1}`,
    name,
    image: u(photo),
    credit: `Fotoğraf: ${author} / Unsplash`,
  }));

const base = { author: "Bu mu O mu?", plays: 0, stats: {} } as const;

/** Eski (emoji) örneklerin kimlikleri: veritabanından kaldırılır. */
export const RETIRED_SEED_IDS = ["seed-sokak", "seed-guc", "seed-kahvalti"];

export const SEED_QUIZZES: Quiz[] = [
  {
    ...base,
    id: "seed-yz-seviye",
    slug: "gercek-mi-yapay-zeka-mi-seviyeler",
    mode: "gercek-yz",
    title: "Gerçek mi, yapay zekâ mı? Kolay, orta, zor",
    description:
      "Midjourney v7, GPT Image, FLUX.2, Seedream ve daha fazlası. Yüzü aşkın görsel, üç seviye. Her turdan sonra görseli ele veren ipuçlarını öğren.",
    createdAt: "2026-11-27T13:00:00.000Z",
    cover: YZ_SEVIYE_ITEMS.find((i) => i.id === "y5618")?.image,
    items: YZ_SEVIYE_ITEMS,
  },
  {
    ...base,
    id: "seed-yz-1",
    slug: "gercek-mi-yapay-zeka-mi-istanbul",
    mode: "gercek-yz",
    title: "Gerçek mi, yapay zekâ mı? İlk set",
    description:
      "İstanbul sokakları, Mardin balkonları, sofralar. Karelerin yarısı fotoğraf, yarısı yapay zekâ. Her turdan sonra ele veren ipuçlarını gör.",
    createdAt: "2026-11-27T12:00:00.000Z",
    items: [
      {
        id: "y1",
        name: "Simitçi",
        image: "/yz/simitci.jpg",
        credit: "ChatGPT ile üretildi (bu site için)",
        answer: "yz",
        clueTags: ["doku-tekrar", "fazla-kusursuz", "isik-golge"],
        note: "Tabelalar düzgün okunuyor, yani yazıya bakmak artık yetmiyor. Simitler aynı boy, aynı renk, aynı susamla dizilmiş; gerçek bir tezgâhta hepsi biraz farklı olur. Kule ve sokak da fazla temiz, her yüzey aynı sıcak ışıkta.",
      },
      {
        id: "g1",
        name: "Çay molası",
        image: u("photo-1554932058-3ca67ddb5084"),
        credit: "Fotoğraf: Muath Alsaeed / Unsplash",
        answer: "gercek",
        clueTags: ["anatomi", "dogal-kusur"],
        note: "El, saat kayışı ve bardağın yansıması tutarlı. Arkada uçan martı hareketten hafif bulanık; gerçek bir enstantane böyle olur.",
      },
      {
        id: "y2",
        name: "Mardin'de çay",
        image: "/yz/mardin-cay.jpg",
        credit: "ChatGPT ile üretildi (bu site için)",
        answer: "yz",
        clueTags: ["isik-golge", "doku-tekrar", "fazla-kusursuz"],
        note: "Eller şaşırtıcı derecede iyi; yeni modellerde eller tek başına ipucu değil. Asıl ipucu ışık: güneş sağda ufka inmiş ama kameraya bakan bütün cepheler eşit altın ışıkta. Arkadaki evler de birbirini tekrarlayan bloklar gibi.",
      },
      {
        id: "g2",
        name: "Mardin",
        image: u("photo-1710835644522-0e3eed28a65f"),
        credit: "Fotoğraf: Erdi İrbit / Unsplash",
        answer: "gercek",
        clueTags: ["tutarli-isik", "dogrulanabilir"],
        note: "Renkler filtreyle canlandırılmış ama bu onu yapay yapmaz. Basamakların her biri farklı aşınmış, gölgeler hep aynı yönde.",
      },
      {
        id: "y3",
        name: "Balat kedisi",
        image: "/yz/balat-kedi.jpg",
        credit: "ChatGPT ile üretildi (bu site için)",
        answer: "yz",
        clueTags: ["fazla-kusursuz", "arka-plan", "sac-kenar"],
        note: "Her şey fazla yerli yerinde: renkler doygun, cepheler tertemiz, ne kablo karmaşası ne tabela ne çöp var. Pencereler birbirinin kopyası, kedinin tüyleri taşa değdiği yerde yumuşakça kaynaşıyor.",
      },
      {
        id: "g3",
        name: "Taş duvardaki kedi",
        image: u("photo-1726507576625-d17aefed7a1f"),
        credit: "Fotoğraf: Kilic-Emre Akdag / Unsplash",
        answer: "gercek",
        clueTags: ["dogal-kusur", "dogrulanabilir"],
        note: "Taşlardaki aşınma ve lekeler düzensiz, kapının çevresindeki iki renkli taş işçiliği gerçek bir cami girişiyle eşleşiyor.",
      },
      {
        id: "y4",
        name: "Köy kahvaltısı",
        image: "/yz/kahvalti.jpg",
        credit: "ChatGPT ile üretildi (bu site için)",
        answer: "yz",
        clueTags: ["geometri", "fazla-kusursuz", "isik-golge"],
        note: "Kavanozdaki \"Dağ Balı\" yazısı bile doğru. Ele veren şey ölçek ve düzen: simitler tabaklara göre devasa, hiçbir tabağa dokunulmamış, tek kırıntı yok, her şey aynı sıcak ışıkla parlıyor.",
      },
      {
        id: "y5",
        name: "Kadıköy'de çay",
        image: "/yz/kadikoy-portre.jpg",
        credit: "ChatGPT ile üretildi (bu site için)",
        answer: "yz",
        clueTags: ["isik-golge", "sac-kenar", "arka-plan"],
        note: "Güneş arkada batıyor ama yüz önden yumuşak ve eşit aydınlanıyor. Uçuşan saç telleri gökyüzüne karışıyor. Vapurun direği arkadaki caminin minareleriyle birleşmiş gibi, vapurda okunur bir isim de yok.",
      },
      {
        id: "g4",
        name: "Serpme kahvaltı",
        image: u("photo-1580069491658-8220b0e8722d"),
        credit: "Fotoğraf: Aram Sabah / Unsplash",
        answer: "gercek",
        clueTags: ["dogal-kusur", "tutarli-isik"],
        note: "Tavadaki sucuklu yumurta, ekmek sepeti ve bardakların yerleşimi gelişigüzel. Işık tek yönden geliyor, gölgeler buna uyuyor.",
      },
      {
        id: "g5",
        name: "Kapalıçarşı",
        image: u("photo-1629212191994-76eccd4aeb17"),
        credit: "Fotoğraf: Linus Mimietz / Unsplash",
        answer: "gercek",
        clueTags: ["dogrulanabilir", "dogal-kusur"],
        note: "Kubbedeki süslemeler Kapalıçarşı'yla birebir eşleşiyor. Asılı kumaşların hiçbiri birbirini tekrar etmiyor.",
      },
      {
        id: "g6",
        name: "Kapadokya",
        image: u("photo-1695415683093-ae5f213ea898"),
        credit: "Fotoğraf: Musa Ortaç / Unsplash",
        answer: "gercek",
        clueTags: ["tutarli-isik", "dogrulanabilir"],
        note: "Balonların boyutu uzaklaştıkça doğru oranda küçülüyor ve vadi gerçek Göreme manzarasıyla eşleşiyor.",
      },
    ],
  },
  {
    ...base,
    id: "seed-turkiye",
    slug: "turkiyenin-en-guzel-yeri",
    mode: "eleme",
    title: "Türkiye'nin en güzel yeri",
    description: "Sekiz şehir, sekiz manzara. Her ikiliden birini seç, sonunda tek bir yer kalsın.",
    createdAt: "2026-11-27T11:00:00.000Z",
    items: photos([
      ["İstanbul", "photo-1564407727371-3eece6c58961", "Meriç Dağlı"],
      ["Kapadokya", "photo-1614942575918-2e10ec1c365f", "Mehmet Subaşı"],
      ["Antalya", "photo-1585338475469-b02ff0ec409c", "Gülin Esen"],
      ["Mardin", "photo-1697697258613-9831ae7176aa", "İsra Nilgün Özkan"],
      ["İzmir", "photo-1640379975786-a187bfcfa010", "Kadir Şahin"],
      ["Uzungöl", "photo-1690912887220-817575eccc4b", "Turhan Can Kargin"],
      ["Bodrum", "photo-1663921501740-e81a4bcdba40", "Encal Media"],
      ["Ankara", "photo-1711859736356-aaf2138f8edd", "Bedir Zana Demir"],
    ]),
  },
  {
    ...base,
    id: "seed-mutfak",
    slug: "turk-mutfaginin-yildizi",
    mode: "eleme",
    title: "Türk mutfağının yıldızı",
    description: "Tatlıdan kebaba, kahvaltıdan çaya. Sence sofranın kralı hangisi?",
    createdAt: "2026-11-27T10:00:00.000Z",
    items: photos([
      ["Baklava", "photo-1676014959543-81df1079b423", "Encal Media"],
      ["Döner", "photo-1699728088614-7d1d4277414b", "Yoad Shejtman"],
      ["Simit", "photo-1734434287177-10d91c0f2171", "Esra Afşar"],
      ["Türk kahvesi", "photo-1658416439082-02fdbf7fb61c", "Abdullah Al Mallah"],
      ["Serpme kahvaltı", "photo-1647772809798-f34d785c981c", "Lala Azizli"],
      ["Demli çay", "photo-1715017245420-9638115138a4", "Zeki Okur"],
      ["Şiş kebap", "photo-1555939594-58d7cb561ad1", "Victoria Shes"],
      ["Fıstıklı sarma", "photo-1778448192444-8f54695e8b9d", "Shoeib Abolhassani"],
    ]),
  },
  {
    ...base,
    id: "seed-hayvan",
    slug: "en-sevimli-hayvan",
    mode: "eleme",
    title: "En sevimli hayvan hangisi?",
    description: "Kedi mi köpek mi kavgası burada bitiyor. Ya da tilki hepsini geçiyor.",
    createdAt: "2026-11-27T09:00:00.000Z",
    items: photos([
      ["Kedi", "photo-1573865526739-10659fec78a5", "Amber Kipp"],
      ["Köpek", "photo-1552053831-71594a27632d", "Richard Brutyo"],
      ["Tavşan", "photo-1585110396000-c9ffd4e4b308", "Satyabratasm"],
      ["Papağan", "photo-1552728089-57bdde30beb3", "Zdeněk Macháček"],
      ["Hamster", "photo-1725522908781-3738eb43e031", "Juliya Sidorova"],
      ["Kaplumbağa", "photo-1591025207163-942350e47db2", "David Courbit"],
      ["At", "photo-1598974357801-cbca100e65d3", "Pieter van Noorden"],
      ["Tilki", "photo-1557008075-7f2c5efa4cfd", "Alexander Andrews"],
    ]),
  },
  {
    ...base,
    id: "seed-tatil",
    slug: "hayalindeki-tatil",
    mode: "eleme",
    title: "Hayalindeki tatil",
    description: "Kumsal mı, kar mı, çöl mü? Bir hafta izin var, nereye gidiyorsun?",
    createdAt: "2026-11-27T08:00:00.000Z",
    items: photos([
      ["Tropik kumsal", "photo-1586500036706-41963de24d8b", "Moosa Haleem"],
      ["Alp köyü", "photo-1517079810336-d39e72287591", "Christian Regg"],
      ["Karlı kulübe", "photo-1510798831971-661eb04b3739", "Ian Keefe"],
      ["Çölde deve turu", "photo-1634470943099-29cf2b9d7ca1", "Ivan Liu Hu"],
      ["New York", "photo-1500916434205-0c77489c6cf7", "Robert Bye"],
      ["Yağmur ormanı", "photo-1556648011-e01aca870a81", "Boudhayan Bardhan"],
      ["Kuzey ışıkları", "photo-1593378026483-2a1fd46a35bd", "Johny Goerend"],
      ["Maldivler", "photo-1578922746465-3a80a228f223", "Ahmed Yaaniu"],
    ]),
  },
];
