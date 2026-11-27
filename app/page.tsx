import Link from "next/link";
import { HeroDuel } from "@/components/HeroDuel";
import { QuizGrid } from "@/components/QuizCard";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const store = getStore();
  const [fresh, popular, aiSets] = await Promise.all([
    store.list({ sort: "yeni", limit: 12 }),
    store.list({ sort: "populer", mode: "eleme", limit: 8 }),
    store.list({ sort: "populer", mode: "gercek-yz", limit: 4 }),
  ]);
  const top = popular.slice(0, 4);
  const newer = fresh.filter((q) => !top.some((t) => t.id === q.id) && q.mode === "eleme").slice(0, 8);
  const showcase = popular.find((q) => q.cover?.startsWith("http")) ?? popular[0];
  const show = showcase ? await store.get(showcase.slug) : null;
  const ai = aiSets[0] ? await store.get(aiSets[0].slug) : null;
  const aiPair = ai
    ? [ai.items.find((i) => i.answer === "gercek"), ai.items.find((i) => i.answer === "yz")].filter(Boolean)
    : [];

  const copy = (
    <>
      <h1 className="hero-title">
        Bu mu,
        <br />
        <span className="o">o mu?</span>
      </h1>
      <p className="hero-lede">
        İki seçenek karşı karşıya gelir, birini seçersin. Tur tur ilerlersin, sonunda tek favorin kalır.
      </p>
      <div className="row" style={{ gap: 12 }}>
        <Link href="/kesfet" className="btn sol">
          Hemen oyna
        </Link>
        <Link href="/olustur" className="btn ghost">
          Kendi quizini oluştur
        </Link>
      </div>
    </>
  );

  return (
    <>
      {show ? (
        <HeroDuel items={show.items.slice(0, 16)} slug={show.slug} title={show.title}>
          {copy}
        </HeroDuel>
      ) : (
        <section className="wrap hero stack">{copy}</section>
      )}

      <section className="wrap steps" aria-label="Nasıl oynanır">
        <div>
          <span className="step-n">01</span>
          <h3>Bir quiz seç</h3>
          <p className="muted">Şehirler, yemekler, hayvanlar ya da kullanıcıların açtığı her konu.</p>
        </div>
        <div>
          <span className="step-n">02</span>
          <h3>İkiden birini seç</h3>
          <p className="muted">Her eşleşmede biri kalır, biri gider. Tıkla ya da klavyeyle seç.</p>
        </div>
        <div>
          <span className="step-n">03</span>
          <h3>Favorini paylaş</h3>
          <p className="muted">Sonunda tek favori kalır. Topluluğun seçimiyle karşılaştır.</p>
        </div>
      </section>

      <section className="wrap section">
        <div className="section-head">
          <h2>En çok oynananlar</h2>
          <Link href="/kesfet" className="link-arrow">
            Tümünü gör
          </Link>
        </div>
        <QuizGrid list={top} />
      </section>

      {ai && aiPair.length === 2 && (
        <section className="wrap section">
          <Link href={`/q/${ai.slug}/oyna`} className="ai-feature">
            <div className="ai-photos" aria-hidden="true">
              {aiPair.map((it, i) => (
                <div key={it!.id} className="ai-photo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it!.image} alt="" loading="lazy" />
                  <span className="ai-q">{i === 0 ? "A" : "B"}</span>
                </div>
              ))}
            </div>
            <div className="ai-copy">
              <span className="eyebrow ai-eyebrow">Yeni mod</span>
              <h2 className="ai-title">Gerçek mi, yapay zekâ mı?</h2>
              <p className="muted">
                Bu iki kareden biri fotoğraf, biri yapay zekâ. Hangisi? Her turdan sonra görseli ele veren ipuçlarını
                öğren, gözünü eğit.
              </p>
              <span className="btn yz">Teste başla</span>
            </div>
          </Link>
        </section>
      )}

      {newer.length > 0 && (
        <section className="wrap section" style={{ paddingBottom: 48 }}>
          <div className="section-head">
            <h2>Yeni eklenenler</h2>
            <Link href="/kesfet?sirala=yeni" className="link-arrow">
              Tümünü gör
            </Link>
          </div>
          <QuizGrid list={newer} />
        </section>
      )}

      <section className="wrap section create-cta">
        <h2>Kendi quizini oluştur</h2>
        <p className="muted">Fotoğrafları yükle, başlığı yaz, linki paylaş. Üyelik yok.</p>
        <Link href="/olustur" className="btn sol">
          Quiz oluştur
        </Link>
      </section>
    </>
  );
}
