import { notFound } from "next/navigation";
import { KeyIssues } from "@/components/key-issues";
import { getAllCandidates, getCandidateBySlug } from "@/lib/data";

export const revalidate = 86_400;
export const dynamicParams = false;

export async function generateStaticParams() {
  const candidates = await getAllCandidates();
  return candidates.map(({ slug }) => ({ slug }));
}

export default async function CandidateKeyIssuesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const candidate = await getCandidateBySlug(slug);
  if (!candidate) notFound();

  return (
    <div id="key-issues">
      <KeyIssues candidateSlug={slug} issues={candidate.issues} />
    </div>
  );
}
