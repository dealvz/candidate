/**
 * This was created this way to display an example of using ISR without SSG to fetch and cache data
 * at request time and revalidate time.
 */

export const revalidate = 3_200; // 1h ISR for this page path

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCandidateBySlug } from "@/lib/data";
import type { ArticleSearchResponse } from "@/lib/articles/types";

export default async function CandidateIssueArticlesPage({
  params,
}: {
  params: Promise<{ slug: string; issue: string }>;
}) {
  const { slug, issue } = await params;
  const candidate = await getCandidateBySlug(slug);
  if (!candidate) notFound();

  const currentIssue = candidate.issues.find((i) => i.slug === issue);
  if (!currentIssue) notFound();

  let articleDigest: ArticleSearchResponse | null = null;
  try {
    articleDigest = await fetchIssueArticles(slug, issue);
  } catch (error) {
    console.error("[CandidateIssueArticlesPage]", error);
    articleDigest = null;
  }

  const articles = articleDigest?.articles ?? [];

  const formatPublishedDate = (value: string | null) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(parsed);
  };

  return (
    <section className="container mx-auto max-w-4xl px-6 py-12 space-y-10">
      <Link
        href={`/candidate/${slug}/key-issues`}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Key Issue
      </Link>

      <div className="space-y-5">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-pretty">
          The Latest Coverage on {currentIssue.title}
        </h1>
        {articleDigest?.summary ? (
          <p className="text-base leading-relaxed text-foreground/90">
            {articleDigest.summary}
          </p>
        ) : currentIssue.summary ? (
          <p className="text-base leading-relaxed text-muted-foreground">
            {currentIssue.summary}
          </p>
        ) : null}
        <p className="text-sm font-semibold text-foreground">
          Showing {articles.length} {articles.length === 1 ? "article" : "articles"}
        </p>
      </div>

      <div className="space-y-6">
        {articles.length ? (
          <ul className="divide-y divide-border">
            {articles.map((article) => {
              const publishedDate = formatPublishedDate(article.publishedAt);
              return (
                <li key={article.link} className="py-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                    {article.imageUrl ? (
                      <div className="relative hidden h-24 w-24 shrink-0 overflow-hidden rounded-3xl bg-muted sm:block">
                        <Image
                          src={article.imageUrl}
                          alt={article.title}
                          fill
                          className="object-cover"
                          sizes="96px"
                          unoptimized
                        />
                      </div>
                    ) : null}

                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <span>{article.source}</span>
                        {publishedDate ? <span className="text-muted-foreground/80">{publishedDate}</span> : null}
                      </div>

                      <h3 className="font-serif text-2xl font-semibold tracking-tight text-pretty">
                        <a
                          href={article.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-foreground transition-colors hover:text-primary"
                        >
                          {article.title}
                        </a>
                      </h3>
                    </div>
                  </div>

                  {article.description ? (
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      {article.description}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t find recent coverage for this issue yet. Check back soon.
          </p>
        )}
      </div>
    </section>
  );
}

async function fetchIssueArticles(slug: string, issue: string): Promise<ArticleSearchResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const response = await fetch(
    `${baseUrl}/api/candidates/${encodeURIComponent(slug)}/key-issues/${encodeURIComponent(issue)}/articles`,
    { next: { revalidate: 3_600 } },
  );

  if (response.status === 404) {
    throw new Error("Issue not found for candidate");
  }

  if (!response.ok) {
    throw new Error(`Failed to load issue articles: ${response.statusText}`);
  }

  return (await response.json()) as ArticleSearchResponse;
}
