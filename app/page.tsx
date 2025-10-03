import { redirect, notFound } from "next/navigation";
import { getAllCandidates } from "@/lib/data";

export default async function RootRedirect() {
  // let's just add a redirect so we don't have to build the list of candidates right now
  const allCandidates = await getAllCandidates();
  const firstSlug = allCandidates[0]?.slug;
  if (firstSlug) {
    redirect(`/candidate/${firstSlug}`);
  }
  notFound();
}