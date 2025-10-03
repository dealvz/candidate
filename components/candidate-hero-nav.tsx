"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";

interface CandidateHeroNavProps {
  basePath: string;
  linkClassName: string;
  highlightClassName: string;
}

export function CandidateHeroNav({ basePath, linkClassName, highlightClassName }: CandidateHeroNavProps) {
  const pathname = usePathname();

  const keyIssuesHref = `${basePath}/key-issues`;
  const campaignMetricsHref = `${basePath}/campaign-metrics`;

  const keyIssuesActive = pathname === basePath || pathname?.startsWith(keyIssuesHref) === true;
  const campaignMetricsActive = pathname?.startsWith(campaignMetricsHref) === true;

  return (
    <>
      <Link href={keyIssuesHref} className={linkClassName}>
        <span className="relative inline-block pb-1">
          <span className="relative z-10">Key Issues &amp; Priorities</span>
          {keyIssuesActive && <span aria-hidden="true" className={highlightClassName} />}
        </span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
      <Link href={campaignMetricsHref} className={linkClassName}>
        <span className="relative inline-block pb-1">
          <span className="relative z-10">Campaign Metrics</span>
          {campaignMetricsActive && <span aria-hidden="true" className={highlightClassName} />}
        </span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </>
  );
}
