import Image from "next/image"
import { Card } from "@/components/ui/card"

const issues = [
  {
    title: "Education & Opportunity",
    description:
      "Investing in quality education from pre-K through college, making higher education affordable, and supporting teachers.",
    image: "/placeholder.svg?height=400&width=700",
  },
  {
    title: "Healthcare Access",
    description:
      "Ensuring every family has access to affordable, quality healthcare and protecting coverage for pre-existing conditions.",
    image: "/placeholder.svg?height=400&width=700",
  },
  {
    title: "Climate Action",
    description:
      "Combating climate change through clean energy jobs, protecting our natural resources, and building sustainable communities.",
    image: "/placeholder.svg?height=400&width=700",
  },
  {
    title: "Economic Justice",
    description: "Creating good-paying jobs, supporting small businesses, and ensuring fair wages for all workers.",
    image: "/placeholder.svg?height=400&width=700",
  },
  {
    title: "Affordable Housing",
    description:
      "Addressing the housing crisis by increasing affordable housing options and protecting renters' rights.",
    image: "/placeholder.svg?height=400&width=700",
  },
  {
    title: "Criminal Justice Reform",
    description:
      "Building a fair justice system that prioritizes rehabilitation, reduces incarceration, and addresses systemic inequities.",
    image: "/placeholder.svg?height=400&width=700",
  },
]

export function KeyIssues() {
  return (
    <section className="px-6 py-16 md:py-20 bg-muted/30">
      <div className="mx-auto max-w-7xl">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-serif font-bold tracking-tight sm:text-4xl">Key Priorities</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            The issues that matter most to our communities and the policies we'll fight for
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {issues.map((issue) => {
            return (
              <Card
                key={issue.title}
                className="overflow-hidden bg-background border-0 shadow-lg hover:shadow-xl transition-shadow rounded-3xl p-4"
              >
                {/* Image container with 4:3 aspect ratio */}
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                  <Image src={issue.image || "/placeholder.svg"} alt={issue.title} fill className="object-cover" />
                </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                  <h3 className="text-2xl font-bold tracking-tight">{issue.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-pretty">{issue.description}</p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
