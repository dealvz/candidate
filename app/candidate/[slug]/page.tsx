import { redirect } from "next/navigation";

export const revalidate = 60;

/**
 * For this MVP we will simply re route to display the key issues of a candidate
 */
export default async function CandidateIndexPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  redirect(`/candidate/${slug}/key-issues`);
}
