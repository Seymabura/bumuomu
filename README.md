# Bu mu O mu?

Kullanıcıların kendi "Bu mu O mu?" quizlerini oluşturup oynadığı, yayıncılara uygun bir site.
Next.js (App Router) ile yazıldı, Vercel'de çalışacak şekilde hazırlandı.

## Modlar

- **Bu mu O mu? (Eleme):** Seçenekler ikişer ikişer karşılaşır, sona tek şampiyon kalır. 4 ile 128 arası
  turnuva boyutu, klavye kısayolları (`1`/`2` ya da `←`/`→`), yayıncı modu ve topluluk sıralaması
  (şampiyonluk sayısı ve ikili kazanma oranı).
- **Gerçek mi, Yapay Zekâ mı?:** Oyuncu her fotoğraf için tahmin yapar, ardından görseli ele veren ipuçlarını,
  oluşturanın notunu, görselin kaynağını ve diğer oyuncuların yüzde kaçının doğru bildiğini görür.
  Sonunda Wordle tarzı skor kartını paylaşır. İpucu kütüphanesi `lib/clues.ts` içinde.

Quiz oluşturmak için üyelik yok. Oluşturan tarayıcıya bir düzenleme anahtarı kaydedilir, düzenle/sil
düğmeleri yalnızca o tarayıcıda görünür.

## Yerelde çalıştırma

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # oyun mantığı testleri
npm run build
```

`DATABASE_URL` tanımlı değilse site bellek içi depoyla çalışır: örnek quizler görünür, ama sunucu yeniden
başlayınca oluşturulan quizler silinir.

## Vercel'e kurulum

1. Vercel'de **Add New → Project** ile bu repoyu içe aktar. Ayar gerekmez.
2. Projede **Storage → Neon (Postgres)** ekle. `DATABASE_URL` kendiliğinden tanımlanır.
   Tablolar ilk istekte otomatik oluşur, örnek quizler eklenir.
3. (Önerilir) **Storage → Blob** ekle. `BLOB_READ_WRITE_TOKEN` tanımlanınca yüklenen görseller Blob'da tutulur.
   Blob yoksa görseller tarayıcıda küçültülüp veritabanında saklanır; bu küçük sitelerde çalışır ama büyüdükçe
   veritabanını şişirir.
4. Yeniden deploy et.

## Bilinen sınırlar (ilk sürüm)

- Gerçek/YZ modunda cevaplar oyun sayfasıyla birlikte tarayıcıya gönderiliyor. Sayfa kaynağına bakan biri
  cevapları görebilir. Liderlik tablosu eklenecekse cevap kontrolü sunucuya taşınmalı.
- Üyelik, moderasyon ve şikâyet sistemi yok. Herkese açık yayından önce en azından görsel bildirme ve
  yönetici silme eklenmeli.
- Gerçek/YZ için hazır görsel seti yok. Görsellerin kaynağı ve lisansı bilinmeli; setleri site üzerinden
  kendi görsellerinizle oluşturun.
