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
    <html lang="tr" data-theme="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&display=swap"
        />
      </head>
      <body>
        <header className="topbar">
          <div className="wrap">
            <Link href="/" className="logo">
              <span className="s">Bu mu,</span> <span className="g">o mu?</span>
            </Link>
            <nav className="nav" aria-label="Ana menü">
              <Link href="/kesfet">Keşfet</Link>
              <Link href="/kesfet?mod=gercek-yz" className="nav-yz">
                <span className="dot" aria-hidden="true" />
                <span className="hide-sm">Gerçek mi,&nbsp;</span>YZ mi?
              </Link>
              <Link href="/olustur" className="btn small">
                <span className="hide-sm">Quiz&nbsp;</span>oluştur
              </Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="site">
          <div className="wrap row" style={{ justifyContent: "space-between" }}>
            <span>Bu mu O mu? Quizleri kullanıcılar oluşturur.</span>
            <span>Örnek fotoğraflar Unsplash'ten, haklar sahiplerine aittir.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
