import { IssueCard } from "@/components/issue-card";

interface Issue {
  slug: string;
  title: string;
  summary: string;
  imageUrl?: string;
}

export function KeyIssues({ issues, candidateSlug }: { issues: Issue[]; candidateSlug: string }) {
  return (
    <section className="flex flex-col gap-6">
      <div className="space-y-1 text-center">
        <h2 className="text-3xl font-serif font-bold tracking-tight sm:text-4xl">Key Priorities</h2>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground text-pretty">
          The issues that matter most to our communities and the policies we&apos;ll fight for
        </p>
      </div>

      <div className="key-issues-grid grid gap-6 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
        {issues.slice(0, 4).map((issue) => {
          const img = `/issues/issue-${issue.slug}-min.png`;
          return (
            <IssueCard
              key={issue.slug}
              title={issue.title}
              description={issue.summary}
              imageSrc={img}
              href={`/candidate/${candidateSlug}/key-issues/${issue.slug}/articles`}
            />
          );
        })}
      </div>
    </section>
  );
}