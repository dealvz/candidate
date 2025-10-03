import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ShareMenu from "./share-menu";
import { CandidateHeroNav } from "./candidate-hero-nav";

interface CandidateHeroProps {
  candidate: {
    slug: string;
    name: string;
    party?: string;
    office?: string;
    slogan?: string;
    photoUrl?: string;
  };
  share: {
    url: string;
    title: string;
    hashtags?: string[];
  };
  avgDonationUSD: number;
}

export function CandidateHero({ candidate, share, avgDonationUSD }: CandidateHeroProps) {
  const { slug, name, party, office, slogan, photoUrl } = candidate;
  const basePath = `/candidate/${slug}`;

  const linkBaseClass =
    "group inline-flex items-center gap-2 text-base font-medium transition-colors hover:text-primary";
  const highlightClass = "absolute left-0 bottom-1 -z-10 h-2 w-full bg-link/50";
  const averageDonationDisplay =
    avgDonationUSD > 0
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(avgDonationUSD)
      : null;

  const partyClassName = (() => {
    if (!party) return undefined;
    switch (party.toLowerCase()) {
      case "democrat":
        return "bg-[var(--party-democrat)] text-[var(--party-democrat-foreground)] border-transparent";
      case "republican":
        return "bg-[var(--party-republican)] text-[var(--party-republican-foreground)] border-transparent";
      case "independent":
        return "bg-[var(--party-independent)] text-[var(--party-independent-foreground)] border-transparent";
      case "nonpartisan":
        return "bg-[var(--party-nonpartisan)] text-[var(--party-nonpartisan-foreground)] border-transparent";
      default:
        return "bg-secondary text-secondary-foreground border-transparent";
    }
  })();

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-end gap-4 sm:gap-6">
        {photoUrl && (
          <div className="relative h-56 w-36 shrink-0 overflow-hidden rounded-[36px] border border-border bg-card sm:h-72 sm:w-48">
            <Image
              src={photoUrl}
              alt={`Portrait of ${name}`}
              fill
              sizes="(min-width: 640px) 192px, 144px"
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="space-y-4 self-end">
          <div className="flex flex-wrap gap-2.5">
            {party && (
              <Badge variant="secondary" className={cn("text-sm px-4 py-1.5", partyClassName)}>
                {party}
              </Badge>
            )}
            <ShareMenu url={share.url} title={share.title} hashtags={share.hashtags} />
          </div>

          <h1 className="text-5xl font-serif font-bold tracking-tight text-balance sm:text-6xl">
            {name}
          </h1>

          {office && (
            <p className="text-lg text-muted-foreground font-medium text-pretty">
              Running for {office}
            </p>
          )}
        </div>
      </div>

      <div className="h-px bg-border max-w-sm" />

      <div className="space-y-3">
        <h2 className="text-2xl font-serif font-semibold text-balance">
          {slogan ?? "A campaign focused on the issues that matter."}
        </h2>
        <p className="text-base text-muted-foreground leading-relaxed text-pretty">
          Learn about priorities, track grassroots momentum, and explore campaign activity across the district.
        </p>
      </div>

      {averageDonationDisplay && (
        <div className="space-y-2 pt-1">
          <p className="text-sm leading-relaxed text-muted-foreground">
            <span className="font-semibold text-primary">Neighbors are pitching in about {averageDonationDisplay}</span>
            {" "}
            each — add your voice with a donation that keeps this campaign powered by community support.
          </p>
          <Button asChild size="sm" className="w-fit">
            <Link href={`${basePath}/campaign-metrics/fundsRaised`}>Chip in together</Link>
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-3 pt-2">
        <CandidateHeroNav
          basePath={basePath}
          linkClassName={linkBaseClass}
          highlightClassName={highlightClass}
        />
      </div>
    </div>
  );
}
