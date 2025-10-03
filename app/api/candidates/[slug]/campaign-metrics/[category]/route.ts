/**
 * Just in case we have other parts of the application that need to access this data
 */
export const revalidate = 86_400; // cache this for 24h

import { NextResponse } from "next/server";
import { getCandidateBySlug } from "@/lib/data";
import { generateDeepDiveLLM } from "@/lib/insights";
import type { DeepDiveCategory } from "@/lib/insights/types";

const VALID_CATEGORIES: DeepDiveCategory[] = ["fundsRaised", "donors", "volunteers", "events"];

function isDeepDiveCategory(value: string): value is DeepDiveCategory {
  return VALID_CATEGORIES.includes(value as DeepDiveCategory);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string; category: string }> },
) {
  const { slug, category } = await params;

  if (!isDeepDiveCategory(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const categoryKey = category as DeepDiveCategory;

  const candidate = await getCandidateBySlug(slug);
  if (!candidate) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
  const deepDive = await generateDeepDiveLLM(candidate.metrics, categoryKey);
    return NextResponse.json(deepDive);
  } catch (error) {
    console.error("[campaign-metrics api]", error);
    return NextResponse.json({ error: "Failed to generate deep dive" }, { status: 502 });
  }
}
