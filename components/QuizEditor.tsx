"use client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { CLUES } from "@/lib/clues";
import { getEditToken, saveEditToken, uploadImage } from "@/lib/client";
import { LEVEL_LABELS, type Answer, type Level, type QuizInput, type QuizItem, type QuizMode } from "@/lib/types";

let counter = 0;
const newId = () => `o${Date.now().toString(36)}${(counter++).toString(36)}`;
const blankItem = (): QuizItem => ({ id: newId(), name: "" });
const fileTitle = (f: File) => f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").slice(0, 60);

export function QuizEditor({ initial, slug }: { initial?: QuizInput; slug?: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<QuizMode>(initial?.mode ?? "eleme");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [author, setAuthor] = useState(initial?.author ?? "");
  const [cover, setCover] = useState(initial?.cover ?? "");
  const [items, setItems] = useState<QuizItem[]>(initial?.items ?? [blankItem(), blankItem(), blankItem(), blankItem()]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const bulkRef = useRef<HTMLInputElement>(null);

  const patch = (id: string, p: Partial<QuizItem>) =>
    setItems((list) => list.map((it) => (it.id === id ? { ...it, ...p } : it)));

  async function onUpload(id: string, file?: File) {
    if (!file) return;
    setBusy(id);
    setError("");
    try {
      const url = await uploadImage(file);
      setItems((list) =>
        list.map((it) => (it.id === id ? { ...it, image: url, name: it.name || (mode === "eleme" ? fileTitle(file) : "") } : it)),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function onBulk(files: FileList | null) {
    if (!files?.length) return;
    setBusy("toplu");
    setError("");
    const added: QuizItem[] = [];
    try {
      for (const f of Array.from(files).slice(0, 64)) {
        const url = await uploadImage(f);
        added.push({ id: newId(), name: mode === "eleme" ? fileTitle(f) : "", image: url });
      }
    } catch (e) {
      setError((e as Error).message);
    }
    // Boş satırları at, yenileri ekle
    setItems((list) => [...list.filter((it) => it.name || it.image || it.emoji), ...added]);
    setBusy(null);
    if (bulkRef.current) bulkRef.current.value = "";
  }

  async function save() {
    setError("");
    const body: QuizInput = {
      mode,
      title,
      description,
      author,
      cover: cover || undefined,
      // Tamamen boş satırları gönderme
      items: items.filter((it) => it.name || it.image || it.emoji),
    };
    setBusy("kaydet");
    try {
      const token = slug ? getEditToken(slug) : null;
      const res = await fetch(slug ? `/api/quizzes/${slug}` : "/api/quizzes", {
        method: slug ? "PUT" : "POST",
        headers: { "content-type": "application/json", ...(token ? { "x-edit-token": token } : {}) },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Kaydedilemedi.");
      if (json.editToken) saveEditToken(json.slug, json.editToken);
      router.push(`/q/${json.slug}`);
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
      setBusy(null);
    }
  }

  const filled = items.filter((it) => it.name || it.image || it.emoji).length;

  return (
    <div className="stack" style={{ gap: 28, maxWidth: 820, margin: "0 auto" }}>
      <h1>{slug ? "Quizi düzenle" : "Quiz oluştur"}</h1>

      <section className="stack">
        <span className="eyebrow">Mod</span>
        <div className="mode-pick">
          <button type="button" aria-pressed={mode === "eleme"} onClick={() => setMode("eleme")}>
            <strong style={{ color: "var(--sol)" }}>Bu mu O mu? (Eleme)</strong>
            <span className="muted" style={{ fontSize: "0.9rem" }}>
              Seçenekler ikişer ikişer karşılaşır, sona bir şampiyon kalır. En az 4, ideali 16 ya da 32 öğe.
            </span>
          </button>
          <button type="button" aria-pressed={mode === "gercek-yz"} onClick={() => setMode("gercek-yz")}>
            <strong style={{ color: "var(--sag)" }}>Gerçek mi, Yapay Zekâ mı?</strong>
            <span className="muted" style={{ fontSize: "0.9rem" }}>
              Her görsel için doğru cevabı ve ele veren ipuçlarını işaretle. Oyuncu tur sonunda açıklamayı görür.
            </span>
          </button>
        </div>
      </section>

      <section className="panel stack">
        <label className="field">
          Başlık
          <input
            id="baslik"
            type="text"
            value={title}
            maxLength={80}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={mode === "eleme" ? "Örn. En iyi Türk dizisi hangisi?" : "Örn. Bu yüzler gerçek mi?"}
          />
        </label>
        <label className="field">
          Açıklama
          <textarea
            id="aciklama"
            value={description}
            maxLength={300}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Oyunculara kısaca ne beklediklerini anlat."
          />
        </label>
        <div className="row" style={{ alignItems: "flex-start" }}>
          <label className="field" style={{ flex: "1 1 200px" }}>
            Oluşturan (görünecek ad)
            <input id="yazar" type="text" value={author} maxLength={40} onChange={(e) => setAuthor(e.target.value)} placeholder="Anonim" />
          </label>
          <label className="field" style={{ flex: "2 1 280px" }}>
            Kapak görseli adresi (isteğe bağlı)
            <input id="kapak" type="url" value={cover} onChange={(e) => setCover(e.target.value)} placeholder="Boşsa ilk öğenin görseli kullanılır" />
          </label>
        </div>
      </section>

      <section className="stack">
        <div className="section-head" style={{ marginBottom: 0 }}>
          <h2>
            {mode === "eleme" ? "Seçenekler" : "Görseller"} <span className="muted num">({filled})</span>
          </h2>
          <div className="row">
            <input
              ref={bulkRef}
              id="toplu"
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => onBulk(e.target.files)}
            />
            <button className="btn ghost small" type="button" onClick={() => bulkRef.current?.click()} disabled={!!busy}>
              {busy === "toplu" ? "Yükleniyor…" : "Toplu görsel yükle"}
            </button>
            <button className="btn ghost small" type="button" onClick={() => setItems((l) => [...l, blankItem()])}>
              Öğe ekle
            </button>
          </div>
        </div>
        <p className="muted" style={{ fontSize: "0.85rem" }}>
          Yalnızca kullanma hakkın olan görselleri yükle ve kaynağını yaz.
          {mode === "gercek-yz" &&
            " Gerçek fotoğraflar için fotoğrafçıyı ve lisansı, yapay zekâ görselleri için kullanılan modeli belirt."}
          {mode === "eleme" && " Görselin yoksa bir emoji de yeterli."}
        </p>

        {items.map((it, i) => (
          <div className="item-editor" key={it.id}>
            <label className="preview" title="Görsel seç" style={{ cursor: "pointer" }}>
              {busy === it.id ? (
                <span style={{ fontSize: "0.8rem" }}>Yükleniyor…</span>
              ) : it.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.image} alt="" />
              ) : (
                <span>{it.emoji || "+"}</span>
              )}
              <input type="file" accept="image/*" hidden onChange={(e) => onUpload(it.id, e.target.files?.[0])} />
            </label>

            <div className="stack" style={{ gap: 10, minWidth: 0 }}>
              <div className="row">
                <input
                  type="text"
                  aria-label={`${i + 1}. öğe adı`}
                  value={it.name}
                  maxLength={60}
                  onChange={(e) => patch(it.id, { name: e.target.value })}
                  placeholder={mode === "eleme" ? `${i + 1}. seçenek adı` : "Başlık (isteğe bağlı, cevaptan sonra görünür)"}
                  style={{ flex: "3 1 200px" }}
                />
                {mode === "eleme" && (
                  <input
                    type="text"
                    aria-label={`${i + 1}. öğe emojisi`}
                    value={it.emoji ?? ""}
                    maxLength={8}
                    onChange={(e) => patch(it.id, { emoji: e.target.value })}
                    placeholder="Emoji"
                    style={{ flex: "0 1 90px" }}
                  />
                )}
              </div>
              <input
                type="url"
                aria-label={`${i + 1}. öğe görsel adresi`}
                value={it.image?.startsWith("data:") ? "" : it.image ?? ""}
                onChange={(e) => patch(it.id, { image: e.target.value })}
                placeholder={it.image?.startsWith("data:") ? "Yüklenen görsel kullanılıyor" : "Görsel adresi (https://…) ya da soldan yükle"}
              />
              <input
                type="text"
                aria-label={`${i + 1}. öğe kaynak`}
                value={it.credit ?? ""}
                maxLength={200}
                onChange={(e) => patch(it.id, { credit: e.target.value })}
                placeholder={
                  mode === "gercek-yz"
                    ? "Kaynak: Fotoğrafçı, lisans ya da üreten model (örn. Midjourney v7)"
                    : "Kaynak / lisans (isteğe bağlı)"
                }
              />

              {mode === "gercek-yz" && (
                <>
                  <div className="row">
                    <span className="eyebrow">Doğru cevap</span>
                    <div className="seg" role="group" aria-label="Doğru cevap">
                      {(["gercek", "yz"] as Answer[]).map((a) => (
                        <button
                          key={a}
                          type="button"
                          className={a}
                          aria-pressed={it.answer === a}
                          onClick={() => patch(it.id, { answer: a, clueTags: [] })}
                        >
                          {a === "gercek" ? "Gerçek" : "Yapay zekâ"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="row">
                    <span className="eyebrow">Zorluk</span>
                    <div className="seg" role="group" aria-label="Zorluk">
                      {(["kolay", "orta", "zor"] as Level[]).map((l) => (
                        <button
                          key={l}
                          type="button"
                          aria-pressed={it.level === l}
                          onClick={() => patch(it.id, { level: it.level === l ? undefined : l })}
                        >
                          {LEVEL_LABELS[l]}
                        </button>
                      ))}
                    </div>
                  </div>
                  {it.answer && (
                    <div className="stack" style={{ gap: 6 }}>
                      <span className="eyebrow">
                        {it.answer === "yz" ? "Ele veren ipuçları" : "Gerçek olduğunu gösteren işaretler"}
                      </span>
                      <div className="chips">
                        {CLUES.filter((c) => c.points === it.answer).map((c) => {
                          const on = it.clueTags?.includes(c.id) ?? false;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              className={`chip ${c.points}`}
                              aria-pressed={on}
                              title={c.explain}
                              onClick={() =>
                                patch(it.id, {
                                  clueTags: on
                                    ? (it.clueTags ?? []).filter((t) => t !== c.id)
                                    : [...(it.clueTags ?? []), c.id],
                                })
                              }
                            >
                              {c.label}
                            </button>
                          );
                        })}
                      </div>
                      <textarea
                        aria-label={`${i + 1}. görsel için açıklama`}
                        value={it.note ?? ""}
                        maxLength={400}
                        onChange={(e) => patch(it.id, { note: e.target.value })}
                        placeholder="Bu görsele özel not: örn. 'Sağ eldeki parmaklar birbirine kaynamış, arkadaki tabelada yazı okunmuyor.'"
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            <button
              type="button"
              className="btn ghost small remove"
              onClick={() => setItems((l) => l.filter((x) => x.id !== it.id))}
              aria-label={`${i + 1}. öğeyi kaldır`}
            >
              Kaldır
            </button>
          </div>
        ))}
        <button className="btn ghost" type="button" onClick={() => setItems((l) => [...l, blankItem()])}>
          + Öğe ekle
        </button>
      </section>

      <div className="row" style={{ justifyContent: "flex-end" }}>
        {error && <span className="error" role="alert">{error}</span>}
        <button className={`btn ${mode === "eleme" ? "sol" : "sag"}`} onClick={save} disabled={!!busy}>
          {busy === "kaydet" ? "Kaydediliyor…" : slug ? "Değişiklikleri kaydet" : "Yayınla"}
        </button>
      </div>
    </div>
  );
}
