"use client";

const key = (slug: string) => `bumuomu:duzenle:${slug}`;

export function saveEditToken(slug: string, token: string) {
  try {
    localStorage.setItem(key(slug), token);
  } catch {}
}
export function getEditToken(slug: string): string | null {
  try {
    return localStorage.getItem(key(slug));
  } catch {
    return null;
  }
}
export function dropEditToken(slug: string) {
  try {
    localStorage.removeItem(key(slug));
  } catch {}
}

/** Paylaşım: önce sistem paylaşım menüsü, olmazsa panoya kopyala. Sonucu kısa bir metinle döner. */
export async function shareOrCopy(text: string, url: string): Promise<string> {
  const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
  if (nav.share && /Mobi|Android|iPhone/i.test(navigator.userAgent)) {
    try {
      await nav.share({ text, url });
      return "Paylaşıldı";
    } catch {
      // kullanıcı vazgeçti ya da desteklenmiyor, kopyalamaya düş
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return "Panoya kopyalandı";
  } catch {
    return "Kopyalanamadı, metni elle seç";
  }
}

/** Görseli tarayıcıda küçültüp JPEG data URL'ye çevirir. */
export function resizeImage(file: File, max = 1000, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      c.getContext("2d")!.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Görsel açılamadı"));
    };
    img.src = url;
  });
}

/** Küçültülmüş görseli sunucuya yükler; Blob varsa kalıcı adres, yoksa data URL döner. */
export async function uploadImage(file: File): Promise<string> {
  const dataUrl = await resizeImage(file);
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ dataUrl }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Yükleme başarısız");
  return json.url as string;
}

/** Yayıncı modu: üst barı ve alt bilgiyi gizler. */
export function setStreamerMode(on: boolean) {
  document.body.classList.toggle("yayin", on);
}
