"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { dropEditToken, getEditToken } from "@/lib/client";

/** Quizi oluşturan tarayıcıda düzenle/sil düğmelerini gösterir. */
export function OwnerTools({ slug }: { slug: string }) {
  const [token, setToken] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  useEffect(() => setToken(getEditToken(slug)), [slug]);
  if (!token) return null;

  async function remove() {
    const res = await fetch(`/api/quizzes/${slug}`, { method: "DELETE", headers: { "x-edit-token": token! } });
    if (res.ok) {
      dropEditToken(slug);
      router.push("/kesfet");
      router.refresh();
    } else {
      setError((await res.json()).error ?? "Silinemedi.");
    }
  }

  return (
    <div className="row">
      <Link href={`/q/${slug}/duzenle`} className="btn ghost small">
        Düzenle
      </Link>
      {confirming ? (
        <>
          <span className="muted">Silinsin mi? Geri alınamaz.</span>
          <button className="btn danger small" onClick={remove}>
            Evet, sil
          </button>
          <button className="btn ghost small" onClick={() => setConfirming(false)}>
            Vazgeç
          </button>
        </>
      ) : (
        <button className="btn danger small" onClick={() => setConfirming(true)}>
          Sil
        </button>
      )}
      {error && <span className="error">{error}</span>}
    </div>
  );
}
