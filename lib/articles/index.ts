import "server-only";

import { generateObject } from "ai";
import { articleSearchSchema } from "./schema";
import type { ArticleSearchResponse } from "./types";
import { openrouter } from "@/lib/insights/provider";
import { retryWithValidation } from "@/lib/utils";

const MODEL_ID = process.env.OPENROUTER_MODEL ?? "google/gemini-2.5-flash-lite";

const RSS_FEEDS = [
  {
    name: "The New York Times - U.S.",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/US.xml",
  },
  {
    name: "The New York Times - Education",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/Education.xml",
  },
  {
    name: "The New York Times - Politics",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml",
  },
  {
    name: "The New York Times - Economy",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/Economy.xml",
  },
  {
    name: "The New York Times - Energy & Environment",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/EnergyEnvironment.xml",
  },
  {
    name: "The New York Times - Real Estate",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/RealEstate.xml",
  },
  {
    name: "The New York Times - Jobs",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/Jobs.xml",
  },
  {
    name: "Politico",
    url: "https://www.politico.com/rss/politicopicks.xml",
  },
] as const;

type CandidateArticle = {
  id: string;
  title: string;
  link: string;
  summary: string;
  publishedAt: string | null;
  source: string;
  feedUrl: string;
  imageUrl: string | null;
};

type ScoredArticle = CandidateArticle & { score: number };

const systemPrompt = `You are a seasoned political news editor curating coverage for a key issue. Select only from the provided articles, never invent new ones, and return valid JSON that matches the schema exactly.`;

export async function fetchArticlesForIssue(issue: string): Promise<ArticleSearchResponse> {
  const trimmedIssue = issue.trim();

  if (!trimmedIssue) {
    throw new Error("fetchArticlesForIssue requires a non-empty issue string");
  }

  const candidates = await collectCandidateArticles();

  if (!candidates.length) {
    throw new Error("No articles could be retrieved from the configured RSS feeds.");
  }

  const scored = rankArticles(trimmedIssue, candidates);
  const shortlist = scored.slice(0, 18);
  const digest = buildArticlesDigest(shortlist);

  let lastValidationIssue: string | undefined;

  try {
    const result = await retryWithValidation(
      () =>
        generateObject({
          model: openrouter(MODEL_ID),
          schema: articleSearchSchema,
          system: systemPrompt,
          prompt: buildUserPrompt(trimmedIssue, shortlist.length, digest),
        }),
      async (raw) => {
        const validation = articleSearchSchema.safeParse(raw.object);

        if (!validation.success) {
          lastValidationIssue = validation.error.issues
            .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
            .join("; ");

          return false;
        }

        lastValidationIssue = undefined;
        return true;
      },
      {
        onError: async (error, attempt) => {
          lastValidationIssue = undefined;
          console.warn(`[fetchArticlesForIssue] LLM request failed on attempt ${attempt}`, error);
        },
        onValidationFailure: async (_, attempt) => {
          if (lastValidationIssue) {
            console.warn(
              `[fetchArticlesForIssue] Validation failed on attempt ${attempt}: ${lastValidationIssue}`,
            );
          }
        },
      },
    );

    return articleSearchSchema.parse(result.object) as ArticleSearchResponse;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Validation failed") && lastValidationIssue) {
      throw new Error(`Article selection failed schema validation: ${lastValidationIssue}`);
    }

    throw error;
  }
}

async function collectCandidateArticles(): Promise<CandidateArticle[]> {
  const results = await Promise.allSettled(
    RSS_FEEDS.map(async (feed) => {
      try {
        const response = await fetch(feed.url, {
          headers: {
            "User-Agent": "CandidateNewsBot/1.0 (+https://candidate.app)",
            Accept: "application/rss+xml, application/xml;q=0.9, text/xml;q=0.8",
          },
          next: {
            revalidate: 600,
          },
        });

        if (!response.ok) {
          throw new Error(`Feed responded with ${response.status}`);
        }

        const xml = await response.text();
        return parseFeed(feed.url, feed.name, xml);
      } catch (error) {
        console.warn(`[fetchArticlesForIssue] Failed to read feed ${feed.url}`, error);
        return [] as CandidateArticle[];
      }
    }),
  );

  const aggregated: CandidateArticle[] = [];
  const seenLinks = new Set<string>();

  for (const result of results) {
    if (result.status !== "fulfilled") {
      continue;
    }

    for (const article of result.value) {
      if (seenLinks.has(article.id)) {
        continue;
      }

      seenLinks.add(article.id);
      aggregated.push(article);
    }
  }

  return aggregated;
}

function parseFeed(feedUrl: string, source: string, xml: string): CandidateArticle[] {
  const items = xml.match(/<item\b[\s\S]*?<\/item>/gi);

  if (!items) {
    return [];
  }

  const articles: CandidateArticle[] = [];

  for (const rawItem of items) {
    const title = extractTag(rawItem, "title");
    const link = extractTag(rawItem, "link") ?? extractTag(rawItem, "guid");

    if (!title || !link) {
      continue;
    }

    const summary = extractTag(rawItem, "description") ?? extractTag(rawItem, "content:encoded") ?? "";
    const imageUrl = extractImageUrl(rawItem);
    const publishedAt = normalizeDate(
      extractTag(rawItem, "pubDate") ?? extractTag(rawItem, "dc:date") ?? extractTag(rawItem, "updated"),
    );

    const normalizedLink = normalizeLink(link);

    if (!normalizedLink) {
      continue;
    }

    articles.push({
      id: normalizedLink,
      title: cleanText(title),
      link: normalizedLink,
      summary: truncate(cleanText(summary), 420),
      publishedAt,
      source,
      feedUrl,
      imageUrl,
    });
  }

  return articles;
}

function extractTag(xml: string, tag: string): string | null {
  const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/:/g, "\\:");
  const regex = new RegExp(`<${escapedTag}[^>]*>([\\s\\S]*?)<\/${escapedTag}>`, "i");
  const match = regex.exec(xml);
  return match ? match[1] ?? null : null;
}

function extractImageUrl(xml: string): string | null {
  const mediaContentMatch = xml.match(/<media:content[^>]*url="([^"]+)"[^>]*>/i);
  if (mediaContentMatch?.[1]) {
    const normalized = normalizeAssetLink(mediaContentMatch[1]);
    if (normalized) return normalized;
  }

  const mediaThumbnailMatch = xml.match(/<media:thumbnail[^>]*url="([^"]+)"[^>]*>/i);
  if (mediaThumbnailMatch?.[1]) {
    const normalized = normalizeAssetLink(mediaThumbnailMatch[1]);
    if (normalized) return normalized;
  }

  const enclosureMatch = xml.match(/<enclosure[^>]*url="([^"]+)"[^>]*>/i);
  if (enclosureMatch?.[1]) {
    const normalized = normalizeAssetLink(enclosureMatch[1]);
    if (normalized) return normalized;
  }

  return null;
}

function normalizeAssetLink(link: string): string | null {
  const cleaned = link.replace(/&amp;/gi, "&").trim();
  try {
    const url = new URL(cleaned);
    if (!url.protocol.startsWith("http")) {
      return null;
    }

    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

function cleanText(value: string): string {
  if (!value) {
    return "";
  }

  let output = value.trim();
  output = output.replace(/^<!\[CDATA\[/i, "").replace(/\]\]>$/i, "");
  output = output.replace(/<[^>]+>/g, " ");
  output = output.replace(/&amp;/gi, "&");
  output = output.replace(/&lt;/gi, "<");
  output = output.replace(/&gt;/gi, ">");
  output = output.replace(/&quot;/gi, '"');
  output = output.replace(/&#39;/gi, "'");
  output = output.replace(/&apos;/gi, "'");
  return output.replace(/\s+/g, " ").trim();
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3)}...`;
}

function normalizeLink(link: string): string | null {
  try {
    const url = new URL(link.trim());
    if (!url.protocol.startsWith("http")) {
      return null;
    }

    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

function normalizeDate(raw: string | null): string | null {
  if (!raw) {
    return null;
  }

  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function rankArticles(issue: string, articles: CandidateArticle[]): ScoredArticle[] {
  const keywords = issue
    .toLowerCase()
    .split(/[\s,/]+/)
    .map((word) => word.trim())
    .filter(Boolean);

  return articles
    .map((article) => {
      const text = `${article.title} ${article.summary}`.toLowerCase();
      let score = 0;

      for (const keyword of keywords) {
        if (!keyword) continue;
        if (article.title.toLowerCase().includes(keyword)) {
          score += 5;
        }
        if (text.includes(keyword)) {
          score += 2;
        }
      }

      if (!score) {
        score = 0.5;
      }

      if (article.publishedAt) {
        const ageMs = Date.now() - Date.parse(article.publishedAt);
        const ageDays = Math.max(0, ageMs / (1000 * 60 * 60 * 24));
        score += Math.max(0, 6 - ageDays) * 0.3;
      }

      return { ...article, score };
    })
    .sort((a, b) => b.score - a.score);
}

function buildArticlesDigest(articles: ScoredArticle[]): string {
  return articles
    .map((article, index) => {
      const lines = [
        `Article ${index + 1}: ${article.title}`,
        `Source: ${article.source}`,
        article.publishedAt ? `Published: ${article.publishedAt}` : "Published: unknown",
        `Link: ${article.link}`,
        article.imageUrl ? `ImageUrl: ${article.imageUrl}` : null,
        `Summary: ${article.summary}`,
        `Score: ${article.score.toFixed(2)}`,
      ];

      return lines.filter(Boolean).join("\n");
    })
    .join("\n\n");
}

function buildUserPrompt(issue: string, candidateCount: number, digest: string): string {
  return [
    `Key issue: ${issue}`,
  `You will receive ${candidateCount} candidate articles pulled from major RSS feeds. Choose up to 10 that are most relevant to the key issue, prioritizing fresh coverage (ideally from the past 30 days).`,
    "Always return the most relevant options even if perfect matches are unavailable.",
     "Return JSON with the structure {\"issue\": string, \"summary\": string, \"articles\": Article[]}.",
     "Each article must include the fields \"title\", \"link\", \"source\", \"description\", \"publishedAt\", and \"imageUrl\". Use null for description, publishedAt, or imageUrl when the information is unavailable.",
  "Write the summary field as two or three sentences that synthesize the overall coverage trends.",
  "Use ISO 8601 format for publishedAt when a date is provided; otherwise return null.",
    "Derive each article description from the provided summary text without adding new facts.",
    "Candidate articles:",
    digest,
  ].join("\n\n");
}
