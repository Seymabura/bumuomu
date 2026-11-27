import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Bu mu O mu?", template: "%s · Bu mu O mu?" },
  description:
    "Kendi 'Bu mu O mu?' eleme turnuvanı oluştur, yayında oynat. Gerçek mi, Yapay Zekâ mı? modunda deepfake avcılığını dene.",
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
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Manrope:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        <header className="topbar">
          <div className="wrap">
            <Link href="/" className="logo">
              <span className="s">Bu mu</span> <span className="g">O mu?</span>
            </Link>
            <nav className="nav" aria-label="Ana menü">
              <Link href="/kesfet">Keşfet</Link>
              <Link href="/kesfet?mod=gercek-yz" className="hide-sm">
                Gerçek mi YZ mi
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
            <span>Bu mu O mu? · Quizleri kullanıcılar oluşturur.</span>
            <span>Görsellerin hakları sahiplerine aittir.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
