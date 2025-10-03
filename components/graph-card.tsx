import type { ReactNode } from "react";
import Link from "next/link";
import { Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GraphCardProps {
  title: string;
  description?: string;
  chart?: ReactNode;
  /** Desired height for the chart area */
  chartHeight?: number | string;
  /** Big number shown beside the title (e.g., “$1.2M”) */
  statPrimary?: ReactNode;
  /** Optional sub-stat under the big number */
  statSecondary?: ReactNode;
  /** Optional destination for the expand affordance */
  expandHref?: string;
  /** Accessible label for the expand affordance */
  expandLabel?: string;
  className?: string;
}

export function GraphCard({
  title,
  description,
  chart,
  chartHeight = 240,
  statPrimary,
  statSecondary,
  expandHref,
  expandLabel,
  className,
}: GraphCardProps) {
  const resolvedChartHeight =
    typeof chartHeight === "number" ? `${chartHeight}px` : chartHeight;

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-[36px] bg-card p-3 shadow-lg ring-1 ring-black/5 transition-transform duration-300 hover:-translate-y-1 dark:ring-white/10 animate-in fade-in slide-in-from-bottom-4 animation-duration-500",
        className
      )}
    >
      {expandHref ? (
        <div className="flex justify-end absolute top-3 right-3 z-10">
          <Link
            href={expandHref}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/60 text-muted-foreground transition hover:border-border hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label={expandLabel ?? `Expand ${title}`}
          >
            <Maximize2 className="h-4 w-4" />
          </Link>
        </div>
      ) : null}
      <div className="flex h-full flex-col overflow-hidden rounded-[30px] bg-background">
        <div
          className="h-full w-full overflow-hidden rounded-3xl bg-card/70 p-4"
          style={{ height: resolvedChartHeight }}
        >
          <div className="h-full w-full">
            {chart ?? <GraphCardPlaceholder />}
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col rounded-b-[30px] bg-card/80 px-6 backdrop-blur-sm dark:bg-background/80">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="truncate text-xl font-semibold tracking-tight">{title}</h3>
              {description ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </div>

            {(statPrimary || statSecondary) && (
              <div className="shrink-0 text-right">
                {statPrimary && (
                  <div className="text-xl font-mono font-bold tracking-tight">{statPrimary}</div>
                )}
                {statSecondary && (
                  <div className="text-xs text-muted-foreground">{statSecondary}</div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </article>
  );
}

function GraphCardPlaceholder() {
  const bars = [40, 65, 85, 55, 95, 70];
  return (
    <div className="flex h-full w-full items-end gap-2">
      {bars.map((height, index) => (
        <div key={`${height}-${index}`} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-full w-full items-end">
            <span
              className="w-full rounded-full bg-primary/70 transition-all duration-300 group-hover:bg-primary"
              style={{ height: `${height}%` }}
              aria-hidden="true"
            />
          </div>
        </div>
      ))}
    </div>
  );
}