import { Card } from "@/components/ui/card"
import { DollarSign, Users, Heart, Calendar } from "lucide-react"

const stats = [
  {
    label: "Total Funds Raised",
    value: "$2.4M",
    icon: DollarSign,
    description: "From grassroots supporters",
  },
  {
    label: "Individual Donors",
    value: "12,847",
    icon: Users,
    description: "Across all 50 states",
  },
  {
    label: "Average Donation",
    value: "$187",
    icon: Heart,
    description: "Powered by the people",
  },
  {
    label: "Campaign Events",
    value: "156",
    icon: Calendar,
    description: "Town halls and meetings",
  },
]

export function CampaignStats() {
  return (
    <section className="px-6 py-16 md:py-20 bg-secondary/30">
      <div className="mx-auto max-w-7xl">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-serif font-bold tracking-tight sm:text-4xl">Campaign by the Numbers</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Our movement is powered by thousands of supporters who believe in a better future
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="p-6 space-y-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-mono font-bold tracking-tight">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.description}</p>
                </div>
              </Card>
            )
          })}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Updated as of {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
      </div>
    </section>
  )
}
