import Link from "next/link";
import { HeroDuel } from "@/components/HeroDuel";
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
        <div className="stack" style={{ gap: 24 }}>
          <h1 className="hero-title">
            Bu mu, <span className="o">o mu?</span>
          </h1>
          <p className="hero-lede">
            İki seçenek karşı karşıya gelir, birini seçersin. Tur tur ilerlersin ve sonunda tek favorin kalır.
          </p>
          <div className="row" style={{ gap: 12, marginTop: 8 }}>
            <Link href="/olustur" className="btn sol">
              Quiz oluştur
            </Link>
            <Link href="/kesfet" className="btn ghost">
              Keşfet
            </Link>
          </div>
        </div>
        {showcase && <HeroDuel items={showcase.items.slice(0, 16)} slug={showcase.slug} title={showcase.title} />}
      </section>

      <section className="wrap section">
        <div className="section-head">
          <h2>Yeni eklenenler</h2>
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

      <section className="wrap section" style={{ paddingBottom: 48 }}>
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
