"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface NextCandidateLinkProps {
  currentSlug: string;
  nextCandidate: {
    slug: string;
    name: string;
  };
  className?: string;
}

export function NextCandidateLink({ currentSlug, nextCandidate, className }: NextCandidateLinkProps) {
  const pathname = usePathname();
  const normalize = (value: string | null) => (value ? value.replace(/\/+$/, "") : "");
  const normalizedPath = normalize(pathname);
  const campaignMetricsPath = `/candidate/${currentSlug}/campaign-metrics`;
  const stayOnCampaignMetrics = normalizedPath === campaignMetricsPath;
  const href = stayOnCampaignMetrics
    ? `/candidate/${nextCandidate.slug}/campaign-metrics`
    : `/candidate/${nextCandidate.slug}`;

  return (
    <Link
      href={href}
      className={cn(
        "absolute bottom-8 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition hover:bg-primary hover:text-primary-foreground",
        className,
      )}
      aria-label={`Next candidate: ${nextCandidate.name}`}
      title={`View ${nextCandidate.name}`}
    >
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}
