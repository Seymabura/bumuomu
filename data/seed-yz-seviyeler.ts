import type { Level, QuizItem } from "@/lib/types";
import { OPENFAKE_IMG } from "./openfake-img";

/**
 * "Gerçek mi, yapay zekâ mı?" seviyeli büyük set.
 *
 * Yapay zekâ görselleri: OpenFake veri seti (ComplexDataLab, CC BY-NC 4.0),
 *   https://huggingface.co/datasets/ComplexDataLab/OpenFake , makale: arXiv:2509.09495.
 *   Lisans ticari olmayan kullanıma izin verir ve atıf ister.
 * Gerçek fotoğrafların bir kısmı: Google DOCCI veri seti (CC BY 4.0), OpenFake'in gerçek bölümü üzerinden.
 * Diğer gerçek fotoğraflar: Unsplash (Unsplash Lisansı), fotoğrafçı adıyla.
 *
 * OpenFake görselleri sitenin veritabanında tutulur (OPENFAKE_IMG: veri setindeki satır numarası -> adres).
 * Seviyeler başlangıç tahminidir; oyuncular oynadıkça effectiveLevel ile kendini ayarlar.
 */

const MODEL: Record<string, string> = {
  mj7: "Midjourney v7",
  gi15: "GPT Image 1.5",
  gi2: "GPT Image 2",
  flux: "FLUX.2 [klein] 9B",
  sd5: "Seedream 5.0",
  zit: "Z-Image Turbo",
};

type AiRow = [row: number, model: keyof typeof MODEL, level: Level, name: string, tags: string[], note: string];
type DocciRow = [row: number, level: Level, name: string, tags: string[], note: string];
type UnsplashRow = [photo: string, author: string, level: Level, name: string, tags: string[], note: string];

const AI: AiRow[] = [
  // Kolay: klasik ipuçları hâlâ görünür
  [198, "mj7", "kolay", "Mutfakta rock selamı", ["eller", "stok-poz", "yazi"], "El hareketi poz için kurulmuş, parmak eklemlerine ve tırnaklara yakından bak. Arkadaki şişe ve kavanozların etiketleri okunur bir yazıya dönüşmüyor."],
  [4660, "mj7", "kolay", "Turuncu elbiseli kadın", ["fazla-kusursuz", "cilt"], "Dergi kapağı gibi: gözeneksiz cilt, tam doğru yöne savrulan elbise, kartpostal arka plan. Bu kadar kusursuzluk gerçek bir çekimde nadiren tek karede yakalanır."],
  [212, "mj7", "kolay", "Papağanlı kadın", ["fazla-kusursuz", "sac-kenar"], "Papağanın tüyleri ile kadının saçı aynı renk paletinde, bütün kare tek bir renk filtresinden çıkmış gibi. Tüylerin saça değdiği kenarlar yumuşakça birbirine karışıyor."],
  [519, "mj7", "kolay", "Makyaj fırçası", ["cilt", "eller", "stok-poz"], "Cilt porselen gibi, tek bir gözenek yok. Fırçayı tutan parmaklar ve fırçanın kılları da bir kozmetik reklamından bile temiz."],
  [2119, "mj7", "kolay", "Sarışın kadın", ["cilt", "sac-kenar", "dis-goz"], "Saç ve cilt fazla parlak ve kusursuz, tipik bir Midjourney portresi. Göz bebeklerindeki ışık yansımalarını karşılaştır, saç tellerinin arka plana nasıl eridiğine bak."],
  [2236, "mj7", "kolay", "Koyu saçlı kadın", ["cilt", "dis-goz"], "Yakın çekim olmasına rağmen ciltte doku yok, kirpikler tek tek çizilmiş gibi düzenli."],
  [2461, "mj7", "kolay", "Kızıl saçlı kadın", ["cilt", "doku-tekrar", "fazla-kusursuz"], "Çiller fazla estetik dağılmış, neredeyse bir desen gibi tekrar ediyor. Işık bir film sahnesi kadar düzenli."],
  [3734, "mj7", "kolay", "Sarı fonda kedi", ["sac-kenar", "fazla-kusursuz"], "Kedi ve fon aynı ton ailesinde, stüdyo gibi kurgulanmış. Bıyıklar ve tüy uçları arka plana yumuşak bir hale ile eriyor."],
  [4814, "mj7", "kolay", "Gün batımında sahil", ["fazla-kusursuz", "doku-tekrar"], "Kartpostal renkleri: gökyüzü, deniz ve kum aynı sıcak tonda. Dalga köpükleri tekrar eden bir desene benziyor."],
  [617, "mj7", "kolay", "Hemşire", ["stok-poz", "cilt", "yazi"], "Stok fotoğraf pozu, ütülü üniforma, kusursuz gülümseme. Üniformadaki yaka kartı ya da yazı gibi küçük ayrıntılar varsa önce onlara bak."],
  [5324, "mj7", "kolay", "Kollarını kavuşturmuş aşçı", ["stok-poz", "fazla-kusursuz", "cilt"], "Beyaz fon, kavuşturulmuş kollar, tek kırışığı olmayan aşçı bonesi: stok fotoğrafın yapay zekâ versiyonu."],
  [6207, "mj7", "kolay", "Şaşkın adam", ["stok-poz", "eller"], "Beyaz fonda abartılı şaşkınlık, tipik bir stok poz. Açılmış ellerin parmaklarını tek tek say ve eklemlere bak."],
  [6306, "mj7", "kolay", "Tabletli kadın", ["cilt", "fazla-kusursuz"], "Neredeyse tam simetrik yüz, gözeneksiz cilt, kusursuz stüdyo ışığı. Yüz fazla 'ortalama güzel'."],
  [633, "gi15", "kolay", "Zirvede yürüyüşçü", ["stok-poz", "fazla-kusursuz"], "Kollar havada, bulutlar tam yerinde, renkler doygun: bir reklam afişi. Önden arkaya her şey aynı netlikte."],
  [2997, "gi15", "kolay", "Buğday tarlasında çiftçi", ["fazla-kusursuz", "eller", "doku-tekrar"], "Fotoğraftan çok resme benziyor: başaklar boyanmış gibi tekrar ediyor, ışık her yerde aynı. Tırpanın sapı ile ellerin birleştiği yere bak."],
  [3025, "gi15", "kolay", "Terli adam", ["cilt", "fazla-kusursuz"], "Ter damlaları ve kaslar fazla dramatik, cilt yağlı boya gibi parlıyor."],
  [44, "flux", "kolay", "Bisiklette aile", ["geometri", "arka-plan"], "Tek bisiklette beş kişi dengede duruyor; bisikletin yapısı bu kadar insanı taşıyamaz. Kimin hangi parçaya oturduğunu takip etmeye çalış."],
  [1166, "sd5", "kolay", "Neon tabelalı barda kadın", ["stok-poz", "fazla-kusursuz"], "Neon 'BAR' tabelası, abartılı platform ayakkabılar, kusursuz poz. Sahne bir moda çekimi için bile fazla kurgulu."],
  [3862, "sd5", "kolay", "Mavi göz", ["fazla-kusursuz", "dis-goz"], "İris deseni neredeyse kusursuz simetrik, renk fazla doygun. Gerçek makro göz fotoğraflarında düzensiz lifler, lekeler ve kılcal damarlar görünür."],
  [3927, "sd5", "kolay", "Bar taburesinde kadın", ["stok-poz", "yazi"], "Katalog pozu, kusursuz bacaklar ve ayakkabılar. Arkadaki şişelerin etiketlerine bak."],
  [4926, "sd5", "kolay", "Kayalıkta uzanan kadın", ["stok-poz", "eller", "fazla-kusursuz"], "Uçurum kenarında abiye ile uzanmak: kurgunun kendisi şüpheli. Elbisenin kayayla birleştiği yere ve çeneyi tutan parmaklara bak."],
  [6196, "sd5", "kolay", "Taş bankta kadın", ["stok-poz", "cilt"], "Taş bankta abiye ile uzanmış, çenesini ellerine dayamış klasik bir poz. Cilt ve kumaş kusursuz."],
  [243, "zit", "kolay", "Kıyafet bağışı", ["stok-poz", "fazla-kusursuz"], "Kutudaki yazı bile kusursuz, sahne bir yardım kampanyası afişi gibi kurulmuş. Torun ve büyükanne aynı yumuşak stüdyo ışığında."],
  [338, "zit", "kolay", "Fısıldaşan iş insanları", ["stok-poz", "eller", "cilt"], "Beyaz fonda üç kişi: tipik stok fotoğraf. Elin kulağa değdiği yerlere ve yüzlerin pürüzsüz cildine bak."],

  // Orta: ilk bakışta inandırıcı
  [69, "mj7", "orta", "Yakın portre", ["cilt", "sac-kenar", "fazla-kusursuz"], "Cilt her yerde aynı yumuşaklıkta, saç telleri tek tek değil fırça darbesi gibi akıyor. Renkler film efektiyle tek bir tonda toplanmış."],
  [396, "mj7", "orta", "Sokakta genç kız", ["arka-plan", "fazla-kusursuz"], "Kız kadrajın tam ortasında ve keskin, arkadaki kalabalık ise yüzü seçilmeyen lekelere dönüşüyor."],
  [799, "mj7", "orta", "Sunucu odasında adam", ["fazla-kusursuz", "doku-tekrar"], "Sahne bir film afişi gibi ışıklandırılmış. Kabinler ve kablolar gerçek bir veri merkezine göre fazla düzenli ve birbirinin kopyası."],
  [1958, "mj7", "orta", "Düğün çifti", ["fazla-kusursuz", "eller", "cilt"], "Kusursuz ışık, kusursuz poz, gelinlikte tek kırışık yok. Ellerin ve yüzlerin birbirine değdiği yerlere bak."],
  [2099, "mj7", "orta", "Yeşil kapı", ["doku-tekrar", "fazla-kusursuz"], "Duvar ve kapı eskitilmiş ama yıpranma her yerde aynı yoğunlukta, bir desen gibi. Gerçek bir duvarda aşınma bir yerde yoğunlaşır, bir yerde hiç olmaz."],
  [3309, "mj7", "orta", "Bira", ["fazla-kusursuz", "yansima"], "Köpük ve buğu reklam fotoğrafı kadar kusursuz. Bardaktaki yansımaların çevredeki ortamla uyuşup uyuşmadığına bak."],
  [3478, "mj7", "orta", "Taş kule", ["doku-tekrar", "fazla-kusursuz"], "Taşlar dengede ama neredeyse hepsi aynı yuvarlaklıkta ve aynı dokuda. Arkadaki manzara da fazla yumuşak."],
  [4658, "mj7", "orta", "Siyah beyaz atlılar", ["geometri", "arka-plan"], "Siyah beyaz ve grenli efekt hataları gizlemek için iyi bir kılıf. Atların bacaklarına ve dizginlere bak: kalabalık sahnelerde yapay zekâ hangi bacağın hangi ata ait olduğunu sık sık karıştırır."],
  [4671, "mj7", "orta", "Mavi beyaz kafe", ["doku-tekrar", "geometri", "yazi"], "Masalar, sandalyeler ve saksılar birbirinin kopyası gibi dizilmiş. Sandalye bacaklarına ve arka plandaki yazılara bak."],
  [610, "mj7", "orta", "Yaşlı kadın", ["cilt", "doku-tekrar"], "Kırışıklıklar var ama hepsi aynı derinlikte ve düzenli. Gerçek yaşlı ciltte lekeler, kılcal damarlar ve düzensizlik olur."],
  [3061, "gi2", "orta", "Pencere önünde kırmızı elbise", ["yansima", "arka-plan"], "GPT Image 2 ışığı ve kumaşı çok iyi kuruyor. Pencereden görünen binalarla camdaki yansımanın birbirini tutup tutmadığına bak."],
  [3597, "gi2", "orta", "Saat ve şarap", ["yazi", "yansima", "fazla-kusursuz"], "Bir natürmort gibi kurulmuş. Saatin rakamlarına ve kadrandaki yazılara, şarabın yüzeyindeki yansımaya bak."],
  [5910, "mj7", "orta", "Güller arasında kız", ["fazla-kusursuz", "sac-kenar"], "Üniforma, güller ve yüz aynı yumuşak ışıkta. Öndeki bulanık güllerle keskin yüz arasındaki geçiş fazla düzgün."],
  [6019, "mj7", "orta", "Dövmeli adam", ["doku-tekrar", "cilt"], "Karanlık fonda dramatik ışık. Dövmeye yakından bak: yapay zekâ dövmeleri çoğu zaman anlamlı bir motif yerine birbirine karışan çizgiler olarak üretir."],
  [6031, "mj7", "orta", "Fenerli sokak", ["isik-golge", "yazi", "fazla-kusursuz"], "Sokağın ucundan vuran güneş, kırmızı fenerler, klasik araba: bir sinema karesi. Yerdeki gölgelerin yönünü ve tabelaları kontrol et."],
  [6142, "mj7", "orta", "Aynadaki adam", ["yansima", "eller"], "Aynalar yapay zekâ için zordur. Yansımadaki el, duruş ve yüz gerçeğiyle birebir uyuşuyor mu?"],
  [6172, "mj7", "orta", "Çiçek aranjmanı", ["doku-tekrar", "fazla-kusursuz"], "Şakayık ve güller kusursuz, ama yaprakların dizilişi bir desen gibi tekrar ediyor."],
  [6252, "mj7", "orta", "Festivalde kadın", ["arka-plan", "fazla-kusursuz"], "Arkadaki ışıklar ve kalabalık kusursuz bir bokeh'e dönmüş, kimsenin yüzü seçilmiyor."],
  [6299, "mj7", "orta", "Gece sahil restoranı", ["fazla-kusursuz", "doku-tekrar", "isik-golge"], "Ay fazla büyük ve parlak, sahne bir tatil afişi gibi kurgulanmış. Masalar ve fenerler birbirinin kopyası gibi tekrar ediyor."],
  [3482, "gi15", "orta", "Kamyonette uyuyan kadın", ["eller", "fazla-kusursuz"], "Sıcak bir renk filtresiyle bir film karesi gibi. Kulaklık kablosunun nereye gittiğine ve ellerin duruşuna bak."],
  [169, "flux", "orta", "Tren penceresi", ["isik-golge", "geometri"], "Pencereden görünen buzul ve dağlar kartpostal gibi, içerideki yolcu ise başka bir ışıkta. Pencere çerçevesi ve koltukların geometrisine bak."],
  [350, "flux", "orta", "Kitaplı öğrenci", ["yazi", "arka-plan"], "Kitap kapaklarındaki yazılara yakından bak. Arkadaki insanlar da şekilsiz bulanık lekelere dönüşüyor."],
  [453, "flux", "orta", "Arabada iki adam", ["geometri", "eller"], "Araç içine bak: direksiyon, emniyet kemerleri ve koltuklar mantıklı bir yerleşimde mi? Yapay zekâ araç içlerinde sık hata yapar."],
  [546, "flux", "orta", "Sırt sırta iki genç", ["eller", "doku-tekrar", "yazi"], "Kitapların sayfalarına ve ellerin kitabı tutuşuna bak. Taş duvar fazla düzenli tekrar ediyor."],
  [70, "zit", "orta", "Karda yürüyüşçü", ["isik-golge", "fazla-kusursuz"], "Batonların kara değdiği yerlere ve ayak izlerine bak. Arkadaki dağlar fazla keskin ve düzgün."],
  [91, "zit", "orta", "Gümüş süper otomobil", ["yazi", "geometri"], "Arabalar yapay zekânın iyi yaptığı konulardan. Plakalara, arkadaki arabaların logolarına ve jantlara bak."],
  [111, "zit", "orta", "Gitar çalan adam", ["eller", "geometri"], "Gitar yapay zekâ için zordur: tellerin sayısına, perdelerin aralığına ve parmakların telleri nasıl bastığına bak."],
  [215, "zit", "orta", "Sahilde şimşek", ["isik-golge", "fazla-kusursuz"], "Şimşek dalları fazla dekoratif, kumsal ve gökyüzü fazla dengeli aydınlanmış. Gerçek şimşek kareleri uzun pozlamayla çekilir ve genelde gürültülüdür."],
  [310, "zit", "orta", "Patlayan yanardağ", ["fazla-kusursuz", "isik-golge"], "Lav ve kıvılcımlar kusursuz simetrik bir koni oluşturuyor, duman ve ışık bir film afişi gibi."],

  // Zor: en iyi kareler
  [124, "zit", "zor", "Pencere kenarında genç kadın", ["arka-plan"], "Doğal ışık, sıradan bir oda, dağınık saç: çok inandırıcı. Arkadaki ranza ve masadaki eşyalar yakından bakınca anlamlı nesnelere dönüşmüyor."],
  [583, "mj7", "zor", "Kol saati", ["yazi", "geometri", "fazla-kusursuz"], "Bir ürün fotoğrafı kadar temiz, bu yüzden çok zor. Ele verebilecek tek yer küçük ayrıntılar: kadrandaki minik yazılar ve kordon baklaları. Yapay zekâ bunları çoğu zaman bulanıklaştırır ya da birbirine kaynatır."],
  [810, "mj7", "zor", "Kahve satıcısı", ["arka-plan", "eller"], "Belgesel fotoğrafı gibi ve çok inandırıcı. Tezgâhtaki nesnelerin kenarlarına ve arka planda yarım kalan şekillere bak."],
  [828, "mj7", "zor", "Kafede iki adam", ["eller", "yazi", "arka-plan"], "Doğal ışık, sıradan bir masa: yeni modellerin en iyi yaptığı türden kare. Ellerin bardaklarla temas ettiği yerlere ve arkadaki yazılara bak."],
  [1746, "mj7", "zor", "Kaniş", ["sac-kenar", "fazla-kusursuz"], "Tüyler son derece ayrıntılı. Tek ipucu tüylerin arka planla birleştiği kenarlarda: tek tek kıl yerine yumuşak bir hale var."],
  [1808, "mj7", "zor", "Sera", ["geometri", "doku-tekrar"], "Seradaki iki adam ve fasulye sırıkları çok inandırıcı. Çatıdaki direklerin ve tellerin çizgilerini takip et, arkadaki üçüncü kişiye bak: uzaktaki ayrıntılar netleşmiyor, yapraklar da birbirinin kopyası gibi."],
  [2444, "mj7", "zor", "And dağlarında vadi", ["arka-plan", "geometri"], "Manzaralar yapay zekânın en güçlü olduğu alan. Tek ipucu uzaktaki küçük ayrıntılar: evler, yollar ve teraslar yaklaşınca anlamlı şekillere dönüşmüyor."],
  [4802, "mj7", "zor", "Kanyon", ["fazla-kusursuz"], "Kayalar, ışık ve derinlik çok inandırıcı. Tek ipucu her katmandaki fazla pürüzsüz renk geçişleri. Bunu bilmek gerçekten zor."],
  [4957, "mj7", "zor", "El sıkışma", ["eller", "arka-plan"], "Klasik stok konu ve eller beklenenden iyi. Parmakların kavuştuğu yere ve gömlek manşetlerine yakından bak, arka plan da fazla bulanık."],
  [5618, "mj7", "zor", "Bahçe kapısı", ["isik-golge"], "Güneş, asılı çamaşırlar, kurulmuş masa: çok doğal bir kompozisyon. Işığın düştüğü yerlerle gölgelerin yönünü karşılaştır."],
  [5647, "mj7", "zor", "Sisli kıyı", ["doku-tekrar", "arka-plan"], "Sis ayrıntıları sakladığı için en zor türden kare. Kayaların dokusu birbirine çok benziyor, uzaktaki kıyı çizgisi fazla yumuşak."],
  [6147, "mj7", "zor", "Orman deresi", ["doku-tekrar"], "Yosunlu taşlar ve akan su çok gerçekçi. Tek ipucu taşların neredeyse hepsinin aynı yuvarlaklıkta olması."],
  [2854, "gi15", "zor", "Terk edilmiş bina", ["geometri", "doku-tekrar"], "Dron fotoğrafı gibi ve çok inandırıcı. Pencereleri takip et: aynı kattaki pencerelerin boyutu ve aralığı değişiyor mu?"],
  [451, "flux", "zor", "Beyzbol vuruşu", ["arka-plan", "yazi"], "Spor fotoğrafı gibi, hareket anı doğru. Tribündeki seyircilere ve forma yazılarına yakından bak."],
  [515, "flux", "zor", "Toplantı", ["yazi", "arka-plan"], "Sıradan bir yerel meclis fotoğrafı gibi, köşede tarih damgası bile var. Masadaki isim kartlarına ve arkadakilerin yüzlerine bak."],
  [568, "flux", "zor", "Eski siyah beyaz çift", ["geometri", "arka-plan"], "Eski bir aile fotoğrafı gibi, beyaz kenarlığı bile var. Arkadaki ev ve çit çizgilerine bak; eski fotoğraf efekti ayrıntıları gizliyor."],
  [595, "flux", "zor", "Atletizm yarışı", ["yazi", "arka-plan"], "Bir yarıştan alınmış gibi. Göğüs numaralarına ve forma yazılarına, arkadaki seyircilere ve panolara yakından bak."],
  [329, "zit", "zor", "Çamur koşusu", ["yazi"], "İki koşucunun göğüs numarası aynı: 004780. Gerçek bir yarışta her koşucunun numarası farklıdır."],
  [380, "zit", "zor", "Futbol maçı", ["yazi", "arka-plan"], "Gerçek bir maç fotoğrafı gibi. Formalardaki sponsor yazılarına ve tribündeki seyircilere bak."],
];

const DOCCI: DocciRow[] = [
  [49, "kolay", "Hayvan ağılı", ["amator-kare", "dogal-kusur"], "Sıradan bir telefon karesi: dağınık zemin, rastgele yerleşmiş hayvanlar, özel bir kompozisyon yok."],
  [100, "kolay", "Fıskiyeli meydan", ["dogal-kusur", "tutarli-isik"], "Cephelerdeki süslemeler ve tabelalar birbirinden farklı, fıskiyenin suyu hareketten hafif bulanık."],
  [107, "kolay", "Yasak tabelası", ["okunur-yazi", "dogal-kusur"], "Tabeladaki yazı ve simge kusursuz okunuyor, boyası ise düzensiz yıpranmış."],
  [151, "kolay", "Tabeladaki karga", ["okunur-yazi", "amator-kare"], "Rastgele bir an: tabelaya konmuş bir karga, gökyüzünü kesen kablolar. Kablolar düz, tabela okunuyor."],
  [157, "kolay", "Kalpli duvar resmi", ["dogal-kusur", "tutarli-isik"], "Kalplerin her biri farklı elle çizilmiş, hiçbiri birbirinin kopyası değil."],
  [2430, "kolay", "Sahilde fok", ["amator-kare", "dogal-kusur"], "Fok uzakta ve küçük, kadraj sıradan. Yapay zekâ böyle 'önemsiz' bir kadrajı nadiren üretir."],
  [2449, "kolay", "Kıvırcık köpek", ["sensor-gurultu", "amator-kare"], "Telefonun portre modu ve gürültülü tüyler. Tüy uçlarında yapay zekâdaki yumuşak hale yerine düzensiz, tek tek kıllar var."],
  [2505, "kolay", "Yatakta kedi", ["dogal-kusur", "amator-kare"], "Buruşuk çarşaf, sıradan oda ışığı, kedinin tuhaf oturuşu. Dağınıklık kendi içinde tutarlı."],
  [2521, "kolay", "Kırmızı kamyonet", ["dogal-kusur", "tutarli-isik"], "Gerçek bir aracın yıpranmış boyası, jantlar ve kapı çizgileri tutarlı, çakılların her biri farklı."],
  [4886, "kolay", "Ağaç dibinde yavru köpek", ["tutarli-isik", "dogal-kusur"], "Tasma, ağaç kabuğu ve toprak gelişigüzel. Işık tek yönden geliyor, gölgeler buna uyuyor."],
  [4888, "kolay", "Sandalye dibinde kuş", ["amator-kare", "dogal-kusur"], "Kimsenin özellikle kurmayacağı sıradan bir an: bir sandalye ayağının yanında yürüyen kuş."],
  [4897, "kolay", "Desenli lavabo", ["dogal-kusur", "tutarli-isik"], "Seramikteki el boyası desenler birbirinden hafifçe farklı, fayans derzleri düz ve tutarlı."],
  [4923, "kolay", "Tavus kuşu", ["dogal-kusur", "amator-kare"], "Kuyruk yere sürünüyor, arkadaki çit ve saman balyaları sıradan. Tüy desenleri kopyala yapıştır değil."],
  [4979, "kolay", "Çöp kamyonu", ["dogal-kusur", "tutarli-isik"], "Kamyonun kasası, tekerlekleri ve arkadaki depo tutarlı; tamamen sıradan bir sokak karesi."],
  [4917, "kolay", "Rafın altında kedi", ["amator-kare", "sensor-gurultu"], "Garip bir açı, kedi kadrajın kenarında. Gerçek fotoğraflar çoğu zaman böyle kusurlu kadrajlarla çekilir."],
  [21, "orta", "Neon CAFE tabelası", ["okunur-yazi", "tutarli-isik"], "Neon harfler doğru yazılmış, camdaki yansımalar ve arkadaki ağaçlar sahneyle tutarlı."],
  [161, "orta", "Şehir meydanı", ["tutarli-isik", "dogal-kusur"], "Binaların pencereleri düz sıralanıyor, perspektif çizgileri tutarlı biçimde aynı noktaya gidiyor."],
  [2463, "orta", "Baraj gölü ve kanyon", ["dogrulanabilir", "tutarli-isik"], "Kayalardaki açık renkli şerit her yerde aynı yükseklikte: gerçek bir baraj gölünde düşen su seviyesinin bıraktığı iz."],
  [2485, "orta", "Gökdelen", ["tutarli-isik", "amator-kare"], "Aşağıdan, eğik çekilmiş bir kare. Pencere sıraları uçtan uca düz ve tutarlı."],
  [4944, "orta", "Uçaktan gün batımı", ["sensor-gurultu", "tutarli-isik"], "Kanadın kenarı, aşağıdaki şehir ve gökyüzünün renkleri tutarlı. Parlak gökyüzü ile karanlık zemin arasındaki dar ton aralığı bir telefon sensörünün işareti."],
  [5001, "orta", "Vitray pencere", ["dogal-kusur", "tutarli-isik"], "Taş oymalar iki yanda simetrik ama birebir aynı değil; her biri elle işlenmiş farklılıkta."],
  [5005, "orta", "Kıyıdan şehir", ["tutarli-isik", "dogal-kusur"], "Teknedeki ayrıntılar, binaların pencereleri ve sudaki dalgalar tutarlı, sıradan bir gün ışığında."],
  [5006, "orta", "Eyerli beyaz at", ["anatomi", "dogal-kusur"], "Eyerin kayışları ve tokaları mantıklı biçimde bağlanmış, atın tüyü yer yer kirli ve düzensiz."],
];

const UNSPLASH: UnsplashRow[] = [
  ["photo-1506794778202-cad84cf45f1d", "Albert Dera", "orta", "Sakallı adam", ["anatomi", "dogal-kusur"], "Sakal ve saç telleri düzensiz, ciltte gözenek ve küçük lekeler var. Rötuşlu bir portre ama doku silinmemiş."],
  ["photo-1663429122432-c2769373768f", "Benjamin Brunner", "orta", "Gözlüklü yaşlı kadın", ["anatomi", "tutarli-isik"], "Gözlüğün yüze oturuşu ve camdaki yansıma tutarlı, kırışıklıklar düzensiz ve her biri farklı derinlikte."],
  ["photo-1512485800893-b08ec1ea59b1", "Petr Sevcovic", "orta", "Tabak tutan aşçı", ["anatomi", "dogal-kusur"], "Önlük kırışık, tabaktaki yemek gelişigüzel, arkadaki mutfak dağınık. Ellerin tabağı kavrayışı doğal."],
  ["photo-1610194435904-cdd826cc99b8", "Lory", "orta", "Ağaçlar arasında dere", ["dogal-kusur", "tutarli-isik"], "Farklı kalınlıkta gövdeler, düzensiz kıyı, yer yer devrilmiş dallar. Doğa kendi dağınıklığıyla tutarlı."],
  ["photo-1429552077091-836152271555", "Brandon Morgan", "orta", "Mavi gecede şimşek", ["sensor-gurultu", "tutarli-isik"], "Uzun pozlamayla çekilmiş; şimşeğin ışığı bulutları içeriden aydınlatıyor, dallanma düzensiz ve ince."],
  ["photo-1613403961424-2fb92cd8ee5a", "Clay Banks", "orta", "Birahanede gülümseyen kadın", ["anatomi", "dogal-kusur"], "Gülümserken gözlerin kenarı kırışıyor, saç telleri bereden düzensiz çıkıyor. Bardaklardaki yansımalar ortamla uyumlu."],
  ["photo-1565076633790-b0deb5d527c7", "Zachary Kyra-Derksen", "orta", "Karda yürüyüşçü", ["dogal-kusur", "tutarli-isik"], "Kardaki izler düzensiz, kayalar ve kar örtüsü her yerde farklı. Gölgeler tek bir ışık kaynağına uyuyor."],
  ["photo-1543326727-cf6c39e8f84c", "Jeffrey F Lin", "orta", "Topa giden iki futbolcu", ["anatomi", "tutarli-isik"], "Bacakların ve topun hareketi mantıklı, iki oyuncunun gölgesi aynı yöne düşüyor."],
  ["photo-1552674605-db6ffd4facb5", "Fitsum Admasu", "orta", "Güneşe koşanlar", ["tutarli-isik", "sensor-gurultu"], "Ters ışıkta siluetler: gölgeler ve parlama aynı güneşten geliyor, kenarlarda doğal lens parlaması var."],
  ["photo-1534528741775-53994a69daeb", "Aiony Haust", "zor", "Mor ışıkta portre", ["anatomi", "sensor-gurultu"], "Sade fon, renkli ışık, kusursuz yüz: yapay zekâ portresine çok benziyor ama gerçek. Ciltte ince doku, saç çizgisinde tek tek teller ve iki göz arasında doğal bir asimetri var."],
  ["photo-1544005313-94ddf0286df2", "Štefan Štefančík", "zor", "Çizgili gömlekli kadın", ["anatomi", "dogal-kusur"], "Gülümseme, dişler ve göz kenarlarındaki kırışıklar birbirine uyuyor. Gömleğin çizgileri kumaşın kıvrımlarını doğru takip ediyor."],
  ["photo-1529626455594-4ff0802cfb7e", "Ayo Ogunseinde", "zor", "Duvara yaslanan kadın", ["anatomi", "dogal-kusur"], "Stüdyo kalitesinde bir moda portresi. Rötuş var ama saç diplerinde ve ciltte gerçek doku duruyor, kulak ve saç geçişleri net."],
  ["photo-1725412626445-881f798d0b30", "Leslie Cross", "zor", "Sisli kayalık kıyı", ["dogal-kusur", "tutarli-isik"], "Sisli manzaralar yapay zekâyla kolayca karışır. Burada kayaların her biri farklı biçimde ve renkte, ağaç siluetleri düzensiz."],
  ["photo-1516572882656-dc5249697fc2", "Jachan DeVol", "zor", "Orman nehri", ["dogal-kusur", "tutarli-isik"], "Taşlar, yosunlar ve su akışı düzensiz; aynı desen hiçbir yerde tekrar etmiyor."],
  ["photo-1583459094467-e0db130c0dea", "Michelle McEwen", "zor", "Gece şimşekleri", ["sensor-gurultu", "dogal-kusur"], "Tek karede birden fazla şimşek: uzun pozlamada birkaç çakma üst üste birikir. Karanlık bölgelerde sensör gürültüsü var."],
  ["photo-1619266465172-02a857c3556d", "Tetiana GRY", "zor", "Fagradalsfjall lavları", ["dogrulanabilir", "dogal-kusur"], "İzlanda'daki Fagradalsfjall yanardağının lav akıntısı. Yeri ve dönemi doğrulanabilir bir patlama."],
  ["photo-1628632577468-645afac21c82", "Toby Elliott", "zor", "Duman püsküren yanardağ", ["tutarli-isik", "dogal-kusur"], "Duman bulutu düzensiz katmanlarla yükseliyor, lavın ışığı dumanın alt kısmını aydınlatıyor. Işık kaynağı ile aydınlanan yüzeyler birbirini tutuyor."],
  ["photo-1617339860632-f53c5b5dce4d", "Colin Lloyd", "zor", "Turuncu iris", ["anatomi", "dogal-kusur"], "Renkleri inanılmaz ama gerçek bir makro çekim. İriste düzensiz lifler ve lekeler var, iki yanı simetrik değil."],
  ["photo-1530707114297-4af4b3cafe16", "Arteum.ro", "zor", "Yeşil göz", ["anatomi", "sensor-gurultu"], "Göz kapağındaki ince kırışıklar, kirpik diplerindeki düzensizlik ve göz pınarının nemli dokusu gerçek bir makro çekimin işaretleri."],
  ["photo-1612322079729-4d8e331c2189", "Dennis Eusebio", "zor", "Kapıları açık süper otomobil", ["tutarli-isik", "okunur-yazi"], "Reklam fotoğrafı gibi temiz ama gerçek. Kapı menteşeleri, jantlar ve frenler mekanik olarak mantıklı; boya üzerindeki yansıma çevreyle uyumlu."],
  ["photo-1536594527669-2f555de54e95", "42 North", "zor", "Gitar çalan eller", ["anatomi", "dogal-kusur"], "Teller ve perdeler doğru sayıda ve aralıkta, parmaklar telleri gerçekten basıyor. Gitar gövdesinde küçük çizikler var."],
  ["photo-1676468785588-1925f8186407", "Gabriel Rodrigues", "zor", "Stüdyoda gitarist", ["tutarli-isik", "anatomi"], "Sade bir stüdyo, yapay zekânın sevdiği türden. Ama gitar sehpası, kablolar ve sandalye mekanik olarak mantıklı, gölgeler tek kaynaktan."],
  ["photo-1591604466107-ec97de577aff", "Eugenia Pan'kiv", "zor", "Gelin ve damat", ["anatomi", "dogal-kusur"], "Düğün fotoğrafı yapay zekâya çok benzer. Burada buket, gelinliğin kıvrımları ve takımın kırışıkları düzensiz ve tutarlı."],
  ["photo-1589100534833-475e31a17b4e", "Hugo Kruip", "zor", "Renkli buket", ["dogal-kusur", "tutarli-isik"], "Her çiçek farklı açıda ve olgunlukta, bazı yapraklar hafif solmuş. Yapay zekâ buketleri çoğu zaman fazla taze ve düzenli olur."],
  ["photo-1533616688419-b7a585564566", "Christie Kim", "zor", "Beyaz masada çiçekler", ["tutarli-isik", "dogal-kusur"], "Sade fon ve minimalist kompozisyon, yapay zekâ gibi görünüyor. Vazodaki suyun kırılması ve saplar fizik kurallarına uyuyor."],
  ["photo-1626248801379-51a0748a5f96", "Janosch Jost", "zor", "Topa koşan futbolcular", ["okunur-yazi", "anatomi"], "Forma numaraları ve yazılar okunuyor, bacak ve kol hareketleri koşu anına uygun."],
  ["photo-1673361043184-4f60ebeb43f5", "João Pedro Schmitz", "zor", "Ormandaki harabe bina", ["dogal-kusur", "tutarli-isik"], "Terk edilmiş bina yapay zekâ setindeki kareye çok benziyor. Burada pencerelerin hepsi aynı aralıkta ve aynı boyutta, yıpranma ise düzensiz."],
  ["photo-1590501855582-05066afefeb8", "Roman", "zor", "Yukarıdan eski sera", ["dogal-kusur", "tutarli-isik"], "Dron karesi: çatının kırık camları rastgele, etraftaki çalılar düzensiz. Gölgeler tek yönde."],
];

const u = (id: string) => `https://images.unsplash.com/${id}?w=1200&q=80&auto=format&fit=crop`;
const OPENFAKE = "OpenFake veri seti (CC BY-NC 4.0)";

export const YZ_SEVIYE_ITEMS: QuizItem[] = [
  ...AI.filter(([row]) => OPENFAKE_IMG[row]).map(([row, m, level, name, clueTags, note]) => ({
    id: `y${row}`,
    name,
    image: OPENFAKE_IMG[row],
    credit: `${MODEL[m]} ile üretildi · ${OPENFAKE}`,
    answer: "yz" as const,
    level,
    clueTags,
    note,
  })),
  ...DOCCI.filter(([row]) => OPENFAKE_IMG[row]).map(([row, level, name, clueTags, note]) => ({
    id: `d${row}`,
    name,
    image: OPENFAKE_IMG[row],
    credit: `Google DOCCI veri seti (CC BY 4.0), ${OPENFAKE} üzerinden`,
    answer: "gercek" as const,
    level,
    clueTags,
    note,
  })),
  ...UNSPLASH.map(([photo, author, level, name, clueTags, note]) => ({
    id: `u${photo.slice(6, 19)}`,
    name,
    image: u(photo),
    credit: `Fotoğraf: ${author} / Unsplash`,
    answer: "gercek" as const,
    level,
    clueTags,
    note,
  })),
];
