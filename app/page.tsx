import { CandidateHero } from "@/components/candidate-hero"
import { CampaignStats } from "@/components/campaign-stats"
import { KeyIssues } from "@/components/key-issues"

export default function Home() {
  return (
    <div className="flex flex-col">
      <CandidateHero />
      <div id="key-issues">
        <KeyIssues />
      </div>
      <div id="campaign-metrics">
        <CampaignStats />
      </div>
    </div>
  )
}
