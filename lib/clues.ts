/**
 * Hazır ipucu kütüphanesi. Quiz oluşturan kişi her görsel için ilgili ipuçlarını işaretler,
 * oyuncu tur sonunda bu açıklamaları görür. Metinler eğitici olsun diye kısa ve somut tutuldu.
 *
 * Önemli: Bu ipuçları kesin kanıt değildir. Yeni modeller birçok klasik hatayı artık yapmıyor,
 * gerçek fotoğraflarda da benzer kusurlar (bulanıklık, sıkıştırma, rötuş) olabiliyor.
 */
export interface Clue {
  id: string;
  label: string;
  explain: string;
  /** Bu ipucu hangi cevabı destekler */
  points: "yz" | "gercek";
}

export const CLUES: Clue[] = [
  // Yapay zekâ işaretleri
  {
    id: "eller",
    label: "Eller ve parmaklar",
    explain:
      "Fazla ya da eksik parmak, birbirine kaynamış parmaklar, garip açıyla bükülmüş eklemler. Yeni modeller daha iyi, ama nesne tutan ellerde hâlâ sık görülür.",
    points: "yz",
  },
  {
    id: "yazi",
    label: "Anlamsız yazılar",
    explain:
      "Tabela, etiket, tişört ya da kitap üstündeki yazılar harfe benzeyen ama okunamayan şekillerden oluşuyor ya da kelime ortasında bozuluyor.",
    points: "yz",
  },
  {
    id: "isik-golge",
    label: "Işık ve gölge tutarsızlığı",
    explain:
      "Gölgeler farklı yönlere düşüyor, ışık kaynağıyla uyuşmuyor ya da bir nesnenin hiç gölgesi yok. Gerçek sahnede tüm gölgeler aynı ışık düzenine uyar.",
    points: "yz",
  },
  {
    id: "arka-plan",
    label: "Eriyen arka plan",
    explain:
      "Arka plandaki insanlar, binalar ya da nesneler mantıksız biçimde birbirine karışıyor, yarım kalıyor veya şekilsiz lekelere dönüşüyor.",
    points: "yz",
  },
  {
    id: "cilt",
    label: "Plastik gibi pürüzsüz cilt",
    explain:
      "Gözenek, ince tüy ve doğal kusurlar yok; cilt mum ya da porselen gibi parlıyor. Not: Ağır rötuşlu gerçek fotoğraflarda da görülebilir.",
    points: "yz",
  },
  {
    id: "takilar",
    label: "Asimetrik takılar ve aksesuarlar",
    explain:
      "Küpelerin iki tarafı farklı, gözlük sapı yüze karışıyor, kolye zinciri bir yerde kopup başka yerde devam ediyor.",
    points: "yz",
  },
  {
    id: "sac-kenar",
    label: "Saç ve kenar geçişleri",
    explain:
      "Saç telleri arka plana ya da kıyafete eriyor, kenarlarda boyalı gibi yumuşak bir hale var.",
    points: "yz",
  },
  {
    id: "geometri",
    label: "Bozuk geometri ve perspektif",
    explain:
      "Düz olması gereken çizgiler (pencere, fayans, korkuluk) eğriliyor, nesnelerin boyutu mesafeyle orantılı değil, mimari mantık dışı.",
    points: "yz",
  },
  {
    id: "yansima",
    label: "Hatalı yansıma",
    explain:
      "Ayna, cam ya da su yüzeyindeki yansıma sahneyle eşleşmiyor ya da gözbebeklerindeki ışık yansımaları iki gözde farklı.",
    points: "yz",
  },
  {
    id: "fazla-kusursuz",
    label: "Fazla kusursuz kompozisyon",
    explain:
      "Her şey aşırı temiz, simetrik ve sinematik; renkler doygun, dağınıklık yok. Tek başına kanıt değil ama diğer ipuçlarıyla birlikte güçlü bir işaret.",
    points: "yz",
  },
  {
    id: "stok-poz",
    label: "Katalog gibi kurgulanmış poz",
    explain:
      "Kusursuz gülümseme, abartılı jest, sade fon, her şey bir reklam için dizilmiş gibi. Modeller milyonlarca stok fotoğraftan öğrendiği için bu pozları çok sever.",
    points: "yz",
  },
  {
    id: "doku-tekrar",
    label: "Tekrarlanan dokular",
    explain:
      "Çim, kalabalık, tuğla ya da yapraklar aynı desenle tekrar ediyor; yakından bakınca kopyala-yapıştır izlenimi veriyor.",
    points: "yz",
  },
  {
    id: "dis-goz",
    label: "Dişler ve gözler",
    explain:
      "Diş sayısı ya da şekli tuhaf, tek sıra beyaz şerit gibi; gözbebekleri yuvarlak değil ya da iki göz farklı yöne bakıyor.",
    points: "yz",
  },

  // Gerçek fotoğraf işaretleri
  {
    id: "okunur-yazi",
    label: "Okunabilir, tutarlı yazılar",
    explain:
      "Tabela ve etiketlerdeki metinler doğru yazılmış ve anlamlı. Modeller bunu giderek daha iyi yapsa da arka plandaki küçük yazılar hâlâ zorlayıcı.",
    points: "gercek",
  },
  {
    id: "dogal-kusur",
    label: "Doğal kusurlar ve dağınıklık",
    explain:
      "Toz, leke, buruşuk kumaş, rastgele yerleşmiş nesneler. Gerçek dünya dağınıktır ve bu dağınıklık kendi içinde tutarlıdır.",
    points: "gercek",
  },
  {
    id: "tutarli-isik",
    label: "Tutarlı ışık ve gölgeler",
    explain:
      "Tüm gölgeler aynı ışık kaynağına göre düşüyor, yansımalar sahneyle uyumlu.",
    points: "gercek",
  },
  {
    id: "sensor-gurultu",
    label: "Kamera gürültüsü ve lens izleri",
    explain:
      "Karanlık bölgelerde doğal sensör gürültüsü, kenarlarda hafif kararma (vinyet), renk saçılması ya da hareket bulanıklığı gibi gerçek kamera izleri var.",
    points: "gercek",
  },
  {
    id: "anatomi",
    label: "Doğru anatomi",
    explain:
      "Eller, dişler, kulaklar ve takılar ayrıntıda bile mantıklı; iki taraf arasında beklenen simetri ve beklenen asimetri var.",
    points: "gercek",
  },
  {
    id: "amator-kare",
    label: "Sıradan, kusurlu kadraj",
    explain:
      "Eğik çekilmiş, konusu kenara kaymış, önemsiz bir an. İnsanlar telefonla böyle kareler çeker; yapay zekâ ise istendiği için hep 'güzel' bir kompozisyon kurar.",
    points: "gercek",
  },
  {
    id: "dogrulanabilir",
    label: "Doğrulanabilir kaynak",
    explain:
      "Fotoğrafın çekildiği yer, tarih ve fotoğrafçı biliniyor; tersine görsel aramada daha eski kopyaları ve aynı anın başka açıları bulunuyor.",
    points: "gercek",
  },
];

export const CLUE_MAP: Record<string, Clue> = Object.fromEntries(CLUES.map((c) => [c.id, c]));
