import Link from "next/link";
import { QuizGrid } from "@/components/QuizCard";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const store = getStore();
  const [popular, fresh, realAi] = await Promise.all([
    store.list({ sort: "populer", limit: 8 }),
    store.list({ sort: "yeni", limit: 8 }),
    store.list({ sort: "populer", mode: "gercek-yz", limit: 4 }),
  ]);

  return (
    <>
      <section className="wrap hero">
        <div className="stack" style={{ gap: 20 }}>
          <span className="eyebrow">Oluştur · Oynat · Paylaş</span>
          <h1>İkisinden biri gidecek. Sen seç.</h1>
          <p className="muted" style={{ fontSize: "1.1rem", maxWidth: "52ch" }}>
            Kendi eleme turnuvanı birkaç dakikada kur, yayında sohbetle birlikte oyna, şampiyonu topluluk sıralamasıyla
            karşılaştır. Ya da gerçek fotoğrafı yapay zekâ üretiminden ayırabiliyor musun, dene.
          </p>
          <div className="row">
            <Link href="/olustur" className="btn sol">
              Quiz oluştur
            </Link>
            <Link href="/kesfet" className="btn ghost">
              Quizleri keşfet
            </Link>
          </div>
        </div>
        <div className="hero-duel" aria-hidden="true">
          <div className="side l">Bu</div>
          <div className="vs">VS</div>
          <div className="side r">O</div>
        </div>
      </section>

      <section className="wrap section">
        <div className="modes">
          <Link href="/kesfet?mod=eleme" className="mode-card">
            <span className="tag" style={{ background: "var(--sol)" }} />
            <h2>Bu mu O mu? (Eleme)</h2>
            <p className="muted">
              8, 16, 32 ya da daha fazla seçenek ikişer ikişer karşılaşır. Her turda birini seçersin, sona tek şampiyon
              kalır. Yayıncılar için klavye kısayolları ve tam ekran yayıncı modu var.
            </p>
          </Link>
          <Link href="/kesfet?mod=gercek-yz" className="mode-card">
            <span className="tag" style={{ background: "var(--sag)" }} />
            <h2>Gerçek mi, Yapay Zekâ mı?</h2>
            <p className="muted">
              Fotoğrafa bak, tahminini yap. Her turdan sonra onu ele veren ipuçlarını gör: eller, yazılar, gölgeler,
              eriyen arka planlar. Sonunda skorunu paylaş.
            </p>
          </Link>
        </div>
      </section>

      <section className="wrap section">
        <div className="section-head">
          <h2>Popüler</h2>
          <Link href="/kesfet" className="muted">
            Tümünü gör
          </Link>
        </div>
        <QuizGrid list={popular} />
      </section>

      <section className="wrap section">
        <div className="section-head">
          <h2>Gerçek mi, Yapay Zekâ mı?</h2>
          <Link href="/olustur?mod=gercek-yz" className="muted">
            Set oluştur
          </Link>
        </div>
        <QuizGrid
          list={realAi}
          empty={
            <div className="stack" style={{ gap: 10 }}>
              <strong style={{ color: "var(--ink)" }}>Henüz bir set yok.</strong>
              <span>
                Kendi gerçek ve yapay zekâ görsellerinle ilk seti sen oluştur. Her görsel için ipuçlarını işaretle,
                oyuncular tur sonunda neden yanıldıklarını görsün.
              </span>
              <Link href="/olustur?mod=gercek-yz" className="btn sag small" style={{ alignSelf: "flex-start" }}>
                İlk seti oluştur
              </Link>
            </div>
          }
        />
      </section>

      <section className="wrap section">
        <div className="section-head">
          <h2>Yeni eklenenler</h2>
        </div>
        <QuizGrid list={fresh} />
      </section>
    </>
  );
}
