import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Bu mu O mu?", template: "%s · Bu mu O mu?" },
  description:
    "Seçenekler ikişer ikişer karşılaşır, her eşleşmede birini seçersin, sonunda tek favori kalır. Kendi 'Bu mu O mu?' quizini oluştur ve paylaş.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,500;0,6..96,600;1,6..96,500;1,6..96,600&family=Figtree:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        <header className="topbar">
          <div className="wrap">
            <Link href="/" className="logo">
              <span className="s">Bu mu</span> <span className="g">o mu?</span>
            </Link>
            <nav className="nav" aria-label="Ana menü">
              <Link href="/kesfet">Keşfet</Link>
              <Link href="/kesfet?mod=gercek-yz" className="hide-sm">
                Gerçek mi, YZ mi?
              </Link>
              <Link href="/olustur" className="btn small">
                Quiz oluştur
              </Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="site">
          <div className="wrap row" style={{ justifyContent: "space-between" }}>
            <span>Bu mu O mu? Quizleri kullanıcılar oluşturur.</span>
            <span>Görsellerin hakları sahiplerine aittir.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
