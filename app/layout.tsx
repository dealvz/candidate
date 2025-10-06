import type React from "react"
import type { Metadata } from "next"
import { Toaster } from "@/components/ui/sonner"
import { geist, geistMono, lora } from "./fonts"
import "./globals.css"

const SITE_NAME = "Candidate"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: "Explore a candidate’s background, key issues, and campaign metrics at a glance.",
  applicationName: SITE_NAME,
  keywords: ["candidate profile", "elections", "campaign", "issues", "metrics", "bio"],
  // TODO: generate og image
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: "Explore a candidate’s background, key issues, and campaign metrics at a glance.",
    url: "/",
    images: [{ url: "/og-default.png", width: 1200, height: 630, alt: `${SITE_NAME} – default` }],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: "Explore a candidate’s background, key issues, and campaign metrics at a glance.",
    images: ["/og-default.png"],
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
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${lora.variable}`}>
      <body className="bg-background font-sans antialiased text-foreground">
        <div className="flex min-h-dvh flex-col">
          <main className="flex-1">{children}</main>
          <Toaster />
        </div>
      </body>
    </html>
  )
}
