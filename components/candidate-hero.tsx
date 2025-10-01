import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"

export function CandidateHero() {
  return (
    <section className="relative min-h-screen grid lg:grid-cols-2 overflow-hidden">
      {/* Left side - Content */}
      <div className="relative z-10 flex items-center px-6 py-20 lg:px-12">
        <div className="max-w-xl space-y-6">
          {/* Badges */}
          <div className="flex flex-wrap gap-2.5">
            <Badge variant="secondary" className="text-sm px-4 py-1.5">
              Democratic Party
            </Badge>
            <Badge variant="outline" className="text-sm px-4 py-1.5">
              U.S. Senate
            </Badge>
          </div>

          {/* Name */}
          <h1 className="text-5xl font-serif font-bold tracking-tight text-balance sm:text-6xl">Sarah Mitchell</h1>

          <p className="text-lg text-muted-foreground font-medium text-pretty">Running for United States Senate</p>

          <div className="h-px bg-border max-w-sm" />

          {/* Mission Statement */}
          <div className="space-y-3">
            <h2 className="text-2xl font-serif font-semibold text-balance">Building a Future We Can All Believe In</h2>
            <p className="text-base text-muted-foreground leading-relaxed text-pretty">
              For over two decades, I've dedicated my life to public service—fighting for working families, protecting
              our environment, and ensuring every voice is heard. Together, we can create lasting change that puts
              people first.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <a
              href="#key-issues"
              className="group inline-flex items-center gap-2 text-base font-medium hover:text-primary transition-colors"
            >
              Key Issues & Priorities
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#campaign-metrics"
              className="group inline-flex items-center gap-2 text-base font-medium hover:text-primary transition-colors"
            >
              Campaign Metrics
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="relative h-full min-h-[600px] lg:min-h-screen">
        <Image
          src="/professional-candidate-portrait.jpg"
          alt="Candidate portrait"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent via-20% to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-80% to-background" />
      </div>
    </section>
  )
}
