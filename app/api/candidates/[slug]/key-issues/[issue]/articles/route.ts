/**
 * Just in case we have other parts of the application that need to access this data
 */
export const revalidate = 3_600; // cache this for 1h - news moves fast!

import { NextResponse } from "next/server";
import { getCandidateBySlug } from "@/lib/data";
import { fetchArticlesForIssue } from "@/lib/articles";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string; issue: string }> },
) {
  const { slug, issue } = await params;
  const candidate = await getCandidateBySlug(slug);

  if (!candidate) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const currentIssue = candidate.issues.find((entry) => entry.slug === issue);

  if (!currentIssue) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const articleDigest = await fetchArticlesForIssue(currentIssue.title);
    return NextResponse.json(articleDigest);
  } catch (error) {
    console.error("[issue-articles api]", error);
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 502 });
  }
}
