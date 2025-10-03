import { ImageResponse } from "next/og";
import { getCandidateBySlug } from "@/lib/data";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  style?: "normal" | "italic";
};

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const candidate = await getCandidateBySlug(slug);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  const name = candidate?.name ?? "Candidate";
  const office = candidate?.office ?? "";
  const photoAbs = candidate?.photoUrl
    ? new URL(candidate.photoUrl, baseUrl).toString()
    : new URL("/og-fallback.jpg", baseUrl).toString();

  const [geist, lora] = await Promise.all([
    fetchGoogleFont("Geist", 400),
    fetchGoogleFont("Lora", 700),
  ]);

  const fonts: OgFont[] = [];

  if (geist) {
    fonts.push({ name: "Geist", data: geist, weight: 400, style: "normal" });
  }

  if (lora) {
    fonts.push({ name: "Lora", data: lora, weight: 700, style: "normal" });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: size.width,
          height: size.height,
          position: "relative",
          display: "flex",
          backgroundColor: "#0B0B0C",
          color: "white",
        }}
      >
        {/* Background photo */}
        <img
          src={photoAbs}
          alt={`${name} portrait`}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "grayscale(0.1) brightness(0.8)",
          }}
        />

        {/* Overlays */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.65) 100%)",
          }}
        />

        {/* Text block */}
        <div style={{ position: "absolute", left: 64, right: 64, bottom: 72 }}>
          <div
            style={{
              fontFamily: "Lora, serif",
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            {name}
          </div>
          <div
            style={{
              marginTop: 8,
              fontFamily: "Geist, system-ui, sans-serif",
              fontSize: 36,
              opacity: 0.9,
            }}
          >
            {office}
          </div>
          <div
            style={{
              marginTop: 24,
              height: 4,
              width: 320,
              background: "white",
              opacity: 0.9,
              borderRadius: 2,
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
      fonts,
    }
  );
}

async function fetchGoogleFont(family: string, weight: number): Promise<ArrayBuffer | null> {
  const params = new URLSearchParams({
    family: `${family}:wght@${weight}`,
    display: "swap",
  });

  const cssResponse = await fetch(`https://fonts.googleapis.com/css2?${params.toString()}`, {
    cache: "force-cache",
    headers: {
      // we want the woff2 variant
      "User-Agent": "Mozilla/5.0 (compatible; GitHubCopilot/1.0; +https://github.com/github/copilot)",
    },
  });

  if (!cssResponse.ok) {
    return null;
  }

  const css = await cssResponse.text();
  const match = css.match(/src: url\(([^)]+)\) format\('woff2'\)/);
  const fontUrl = match?.[1];

  if (!fontUrl) {
    return null;
  }

  const fontResponse = await fetch(fontUrl, { cache: "force-cache" });
  if (!fontResponse.ok) {
    return null;
  }

  return fontResponse.arrayBuffer();
}