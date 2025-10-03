const SKELETON_BG = "bg-[color:color-mix(in_oklab,var(--muted),black_5%)]";

export default function CandidateIssueArticlesLoading() {
  return (
    <section className="container mx-auto max-w-5xl px-0 lg:pt-12 pb-12 space-y-10 sm:px-6">
      <div className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <div className={`h-4 w-4 rounded-full ${SKELETON_BG}`} />
        <div className={`h-4 w-32 rounded-full ${SKELETON_BG}`} />
      </div>

      <div className="space-y-5 animate-pulse">
        <div className={`h-8 w-80 rounded-full ${SKELETON_BG}`} />
        <div className={`h-4 w-full max-w-2xl rounded-full ${SKELETON_BG}`} />
        <div className={`h-4 w-full max-w-xl rounded-full ${SKELETON_BG}`} />
        <div className={`h-4 w-44 rounded-full ${SKELETON_BG}`} />
      </div>

      <ul className="divide-y divide-border">
        {Array.from({ length: 4 }).map((_, index) => (
          <li key={index} className="py-6 animate-pulse">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
              <div className={`relative hidden h-24 w-24 shrink-0 overflow-hidden rounded-3xl ${SKELETON_BG} sm:block`} />
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <div className={`h-3 w-16 rounded-full ${SKELETON_BG}`} />
                  <div className={`h-3 w-24 rounded-full ${SKELETON_BG}`} />
                </div>
                <div className={`h-6 w-full max-w-lg rounded-full ${SKELETON_BG}`} />
                <div className={`h-6 w-full max-w-md rounded-full ${SKELETON_BG}`} />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className={`h-3 w-full rounded-full ${SKELETON_BG}`} />
              <div className={`h-3 w-full max-w-2xl rounded-full ${SKELETON_BG}`} />
              <div className={`h-3 w-3/4 rounded-full ${SKELETON_BG}`} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
