import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface IssueCardProps {
  title: string;
  description?: string;
  imageSrc: string;
  className?: string;
  href?: string;
}

export function IssueCard({ title, description, imageSrc, className, href }: IssueCardProps) {
  const hasDescription = Boolean(description && description.trim().length > 0);

  return (
    <article
      className={cn(
        "group relative aspect-square flex flex-col rounded-[36px] bg-card p-3 shadow-lg ring-1 ring-black/5 transition-transform duration-300 hover:-translate-y-1 dark:ring-white/10 animate-in fade-in slide-in-from-bottom-4 animation-duration-500",
        className,
      )}
    >
      <div className="relative flex-1 overflow-hidden rounded-[30px]">
        <Image
          src={imageSrc}
          alt={title}
          fill
          sizes="(min-width: 1024px) 320px, (min-width: 768px) 40vw, 80vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-end">
          <div className="relative w-full p-6">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-full rounded-b-[30px] bg-gradient-to-t from-black/75 via-black/55 to-transparent"
            />
            <div className="relative flex flex-col gap-3 text-white">
              <h3 className="text-2xl font-semibold tracking-tight drop-shadow-lg">{title}</h3>
              <p
                className={cn(
                  "min-h-[44px] text-sm leading-snug font-medium text-white/90",
                  !hasDescription && "opacity-0",
                )}
                aria-hidden={!hasDescription}
              >
                {hasDescription ? description : ""}
              </p>
              {href ? (
                <Link
                  href={href}
                  className="pointer-events-auto inline-flex w-fit translate-y-3 items-center gap-2 rounded-full bg-white/90 px-5 py-2 text-sm font-medium text-neutral-900 shadow-lg backdrop-blur transition-all duration-300 opacity-0 hover:bg-white group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 dark:bg-white/15 dark:text-white dark:hover:bg-white/25"
                >
                  View full coverage
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
