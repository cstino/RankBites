import type { Metadata } from "next";
import { Suspense, ReactNode } from "react";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import BottomNav from "@/components/public/BottomNav";

export const metadata: Metadata = {
  title: "RankBites - Recensioni Ristoranti",
  description: "Scopri i migliori ristoranti valutati dal nostro team di esperti con voti reali e trasparenti.",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "RankBites - Recensioni Ristoranti",
    description: "Scopri i migliori ristoranti valutati dal nostro team di esperti.",
    type: "website",
  },
  other: {
    "theme-color": "#ffffff",
    "apple-mobile-web-app-status-bar-style": "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="it">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {/* Google Fonts: Zalando Sans Expanded */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Zalando+Sans+Expanded:wght@300;400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">
        <ToastProvider>
          <div className="page-with-bottom-nav">
            {children}
          </div>
          <Suspense fallback={null}>
            <BottomNav />
          </Suspense>
        </ToastProvider>
      </body>
    </html>
  );
}
