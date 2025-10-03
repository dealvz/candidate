"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
        "group inline-flex items-center text-base font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      aria-label={"Next candidate"}
      title={`View ${nextCandidate.name}`}
    >
      <span className="relative inline-block pb-1">
        <span className="relative z-10">Next candidate</span>
      </span>
    </Link>
  );
}
