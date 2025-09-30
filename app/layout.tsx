import type { Metadata } from "next";
import { geist, geistMono, lora } from "./fonts";
import "./globals.css";

const SITE_NAME = "Candidate";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "Explore a candidate’s background, key issues, and campaign metrics at a glance.",
  applicationName: SITE_NAME,
  keywords: [
    "candidate profile",
    "elections",
    "campaign",
    "issues",
    "metrics",
    "bio",
  ],
  // TODO: generate og image
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description:
      "Explore a candidate’s background, key issues, and campaign metrics at a glance.",
    url: "/",
    images: [
      { url: "/og-default.png", width: 1200, height: 630, alt: `${SITE_NAME} – default` },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description:
      "Explore a candidate’s background, key issues, and campaign metrics at a glance.",
    images: ["/og-default.png"],
  },
  // TODO: generate an icon
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
  alternates: { canonical: "/" },
  category: "Politics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} ${lora.variable}`}
    >
      <body className="bg-background font-sans antialiased text-foreground">
        <div className="flex min-h-dvh flex-col">
          <header className="px-6 py-4">
            <span className="text-3xl font-semibold font-serif tracking-tight">Candidate</span>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
