/**
 * This was created this way to display an example of using SSG/ISR to fetch and cache data
 * from a long running request so our users don't feel the impact of slow loading times.
 */

export const revalidate = 86_400; // 24h ISR for this page path - don't spend all my money!
export const dynamicParams = false; // only generate pages for known candidates/categories -> SSG

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import EChart from "@/components/echart";
import { getAllCandidates, getCandidateBySlug } from "@/lib/data";
import { buildOptionFromSpec } from "@/lib/chart-options";
import { generateDeepDiveLLM } from "@/lib/insights";
import type { DeepDiveCategory } from "@/lib/insights/types";

const UI_CATEGORIES: DeepDiveCategory[] = [
  "fundsRaised",
  "donors",
  "volunteers",
  "events",
];

export async function generateStaticParams() {
  const candidates = await getAllCandidates();
  return candidates.flatMap((c) =>
    UI_CATEGORIES.map((category) => ({ slug: c.slug, category }))
  );
}

export default async function DeepDivePage({
  params,
}: {
  params: Promise<{ slug: string; category: DeepDiveCategory }>;
}) {
  const { slug, category } = await params;
  const candidate = await getCandidateBySlug(slug);
  if (!candidate) notFound();

  const deepDiveCategory = category;
  if (!deepDiveCategory) notFound();

  const deepDive = await generateDeepDiveLLM(candidate.metrics, deepDiveCategory);

  const insight = deepDive.insights[deepDiveCategory];

  const option = buildOptionFromSpec(deepDive.chart);

  return (
    <section className="container mx-auto max-w-5xl px-6 py-12 space-y-10">
      <Link
        href={`/candidate/${slug}/campaign-metrics`}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Campaign Metrics
      </Link>

      <div className="space-y-6">
        <h2 className="font-serif text-3xl font-bold tracking-tight text-pretty">
          {insight.headline}
        </h2>

        <EChart option={option} height={400} />

        {deepDive.chart.narrative ? (
          <p className="text-base text-muted-foreground leading-relaxed">
            {deepDive.chart.narrative}
          </p>
        ) : null}
      </div>

      <div className="space-y-4">
        <p className="text-base text-muted-foreground leading-relaxed">{insight.summary}</p>
        <ul className="list-disc pl-6 space-y-2 text-base text-foreground">
          {insight.bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
        {insight.caveats?.length ? (
          <p className="text-sm text-muted-foreground">
            <strong className="font-semibold">Caveats:</strong> {insight.caveats?.join(" · ")}
          </p>
        ) : null}
      </div>
    </section>
  );
}