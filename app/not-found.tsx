import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap section stack" style={{ gap: 16, alignItems: "flex-start" }}>
      <h1>Bu sayfa elendi.</h1>
      <p className="muted">Aradığın quiz silinmiş ya da adres yanlış olabilir.</p>
      <Link href="/kesfet" className="btn">
        Quizleri keşfet
      </Link>
    </div>
  );
}
