import Link from "next/link";
import { BracketArt } from "@/components/BracketArt";
import { QuizGrid } from "@/components/QuizCard";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const store = getStore();
  const [fresh, popular] = await Promise.all([
    store.list({ sort: "yeni", limit: 8 }),
    store.list({ sort: "populer", mode: "eleme", limit: 8 }),
  ]);
  const showcase = popular[0] ? await store.get(popular[0].slug) : null;

  return (
    <>
      <section className="wrap hero">
        <div className="stack" style={{ gap: 28 }}>
          <h1 className="hero-title">
            <span className="bu">Bu mu</span>
            <span className="ya-da">yoksa</span>
            <span className="o">o mu?</span>
          </h1>
          <p className="hero-lede">
            Seçenekler ikişer ikişer karşılaşır. Her eşleşmede birini seçersin, diğeri elenir. Tur tur ilerlersin ve
            sonunda tek bir favori kalır.
          </p>
          <div className="row" style={{ gap: 14 }}>
            <Link href={showcase ? `/q/${showcase.slug}/oyna` : "/kesfet"} className="btn sol">
              Hemen oyna
            </Link>
            <Link href="/olustur" className="btn ghost">
              Kendi quizini oluştur
            </Link>
          </div>
        </div>
        {showcase && <BracketArt quiz={showcase} />}
      </section>

      <section className="wrap section">
        <div className="steps">
          <div className="step">
            <span className="no">1</span>
            <div>
              <h3>Seçeneklerini ekle</h3>
              <p>Bir konu seç, en az dört seçenek ekle. Görsel yükle ya da emoji kullan.</p>
            </div>
          </div>
          <div className="step">
            <span className="no">2</span>
            <div>
              <h3>Eşleşmeleri oyna</h3>
              <p>8, 16 ya da 32 seçenekle başla. Her ikiliden birini seç, finale kadar git.</p>
            </div>
          </div>
          <div className="step">
            <span className="no">3</span>
            <div>
              <h3>Şampiyonunu paylaş</h3>
              <p>Sonucunu arkadaşlarına gönder, herkesin favorisini topluluk sıralamasında gör.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="wrap section" style={{ paddingTop: 48 }}>
        <div className="section-head">
          <h2>Yeni eklenen quizler</h2>
          <Link href="/kesfet?sirala=yeni" className="muted">
            Tümünü gör
          </Link>
        </div>
        <QuizGrid
          list={fresh}
          empty={
            <>
              Henüz quiz yok. <Link href="/olustur">İlkini sen oluştur.</Link>
            </>
          }
        />
      </section>

      <section className="wrap section">
        <div className="section-head">
          <h2>En çok oynananlar</h2>
          <Link href="/kesfet" className="muted">
            Tümünü gör
          </Link>
        </div>
        <QuizGrid list={popular} />
      </section>
    </>
  );
}
