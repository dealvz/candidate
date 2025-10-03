import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { CandidateHero } from "@/components/candidate-hero";
import { NextCandidateLink } from "@/components/next-candidate-link";
import { getAllCandidates, getCandidateBySlug } from "@/lib/data";
import { buildMetricSummary } from "@/lib/metrics";

interface CandidateLayoutProps {
  children: ReactNode;
  params: Promise<{
    slug: string;
  }>;
}

export const revalidate = 60;

export default async function CandidateLayout({ children, params }: CandidateLayoutProps) {
  const { slug } = await params;
  const candidate = await getCandidateBySlug(slug);
  if (!candidate) notFound();

  const metricSummary = buildMetricSummary(candidate.metrics);

  const candidates = await getAllCandidates();
  const currentIndex = candidates.findIndex((c) => c.slug === slug);
  const nextCandidate = candidates[(currentIndex + 1) % candidates.length];

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const canonicalUrl = new URL(`/candidate/${candidate.slug}`, baseUrl).toString();
  const shareTitle = candidate.office ? `${candidate.name} for ${candidate.office}` : candidate.name;
  const shareHashtags = candidate.party
    ? [candidate.party.replace(/[^a-z0-9]+/gi, "").toLowerCase()]
    : ["candidate"];

  return (
    <section className="relative bg-muted/30 animate-in fade-in animation-duration-400">
      <div className="grid min-h-screen lg:h-screen lg:grid-cols-2">
        <div className="relative z-10 flex items-center px-6 py-16 lg:sticky lg:top-0 lg:h-screen lg:px-12 lg:py-24 animate-in fade-in slide-in-from-left-4 animation-duration-500">
          <CandidateHero
            candidate={{
              slug,
              name: candidate.name,
              party: candidate.party,
              office: candidate.office,
              slogan: candidate.slogan,
              photoUrl: candidate.photoUrl,
            }}
            share={{
              url: canonicalUrl,
              title: shareTitle,
              hashtags: shareHashtags,
            }}
            avgDonationUSD={metricSummary.avgDonationUSD}
          />

          {nextCandidate && (
            <NextCandidateLink
              currentSlug={slug}
              nextCandidate={{ slug: nextCandidate.slug, name: nextCandidate.name }}
            />
          )}
        </div>

        <div className="relative bg-background lg:h-screen lg:overflow-y-auto">
          <div className="flex min-h-full flex-col bg-muted/30 px-6 pt-4 pb-12 md:pt-6 md:pb-14">
            <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col animate-in fade-in slide-in-from-bottom-2 animation-duration-400">
              {children}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
