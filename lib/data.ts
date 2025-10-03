import type { Candidate } from "@/lib/types";
import allCandidates from "@/lib/candidates.json"; // bundled at build


const candidates = allCandidates as Candidate[];

export async function getAllCandidates(): Promise<Candidate[]> {
  return candidates;
}

export async function getCandidateBySlug(slug: string): Promise<Candidate | null> {
  return candidates.find((c) => c.slug === slug) ?? null;
}

export function getAllCandidateSlugs(): string[] {
  return candidates.map((c) => c.slug);
}