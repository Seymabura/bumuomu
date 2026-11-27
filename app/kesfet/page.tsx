import Link from "next/link";
import { QuizGrid } from "@/components/QuizCard";
import { getStore } from "@/lib/store";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Keşfet" };

type SP = Promise<{ mod?: string; sirala?: string; q?: string }>;

export default async function Kesfet({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const mode = sp.mod === "eleme" || sp.mod === "gercek-yz" ? sp.mod : undefined;
  const sort = sp.sirala === "yeni" ? "yeni" : "populer";
  const q = sp.q?.slice(0, 60) || undefined;
  const list = await getStore().list({ sort, mode, q });

  const href = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const next = { mod: mode, sirala: sort === "yeni" ? "yeni" : undefined, q, ...patch };
    for (const [k, v] of Object.entries(next)) if (v) p.set(k, v);
    const s = p.toString();
    return s ? `/kesfet?${s}` : "/kesfet";
  };

  return (
    <div className="wrap section stack" style={{ gap: 24 }}>
      <h1>Keşfet</h1>
      <form className="row" action="/kesfet">
        {mode && <input type="hidden" name="mod" value={mode} />}
        <input type="search" id="ara" name="q" defaultValue={q} placeholder="Quiz ara" style={{ flex: "1 1 240px" }} />
        <button className="btn">Ara</button>
      </form>
      <div className="row">
        <div className="seg" role="group" aria-label="Mod">
          <Link href={href({ mod: undefined })} aria-current={(!mode) ? "true" : undefined}>Tümü</Link>
          <Link href={href({ mod: "eleme" })} aria-current={(mode === "eleme") ? "true" : undefined}>Eleme</Link>
          <Link href={href({ mod: "gercek-yz" })} aria-current={(mode === "gercek-yz") ? "true" : undefined}>Gerçek mi YZ mi</Link>
        </div>
        <div className="seg" role="group" aria-label="Sıralama">
          <Link href={href({ sirala: undefined })} aria-current={(sort === "populer") ? "true" : undefined}>Popüler</Link>
          <Link href={href({ sirala: "yeni" })} aria-current={(sort === "yeni") ? "true" : undefined}>Yeni</Link>
        </div>
      </div>
      <QuizGrid
        list={list}
        empty={
          <>
            Aramana uygun quiz bulunamadı. <Link href="/olustur">Yeni bir tane oluştur.</Link>
          </>
        }
      />
    </div>
  );
}
