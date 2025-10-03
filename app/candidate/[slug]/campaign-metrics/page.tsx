import { notFound } from "next/navigation";
import { GraphCard } from "@/components/graph-card";
import EChart from "@/components/echart";
import { buildBarOption, buildLineOption } from "@/lib/chart-options";
import { getAllCandidates, getCandidateBySlug } from "@/lib/data";
import {
  buildDonationsByMonth,
  buildDonorsByMonth,
  buildEventsHeldByMonth,
  buildVolunteerCountsByMonth,
} from "@/lib/metrics";

export const revalidate = 86_400;
export const dynamicParams = false;

export async function generateStaticParams() {
  const candidates = await getAllCandidates();
  return candidates.map(({ slug }) => ({ slug }));
}

export default async function CandidateCampaignMetricsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const candidate = await getCandidateBySlug(slug);
  if (!candidate) notFound();

  const metrics = candidate.metrics;

  const categoryPath = (category: string) => `/candidate/${slug}/campaign-metrics/${category}`;

  const fundsRaisedByMonth = buildDonationsByMonth(metrics);
  const donorsByMonth = buildDonorsByMonth(metrics);      
  const volunteersByMonth = buildVolunteerCountsByMonth(metrics);
  const eventsHeldByMonth = buildEventsHeldByMonth(metrics);

  // Last 6 months for compact “headline” charts
  const lastSixFunds = takeLastMonths(fundsRaisedByMonth, 6);
  const lastSixDonors = takeLastMonths(donorsByMonth, 6);
  const lastSixVolunteers = takeLastMonths(volunteersByMonth, 6);
  const lastSixEvents = takeLastMonths(eventsHeldByMonth, 6);

  // Headline figures (totals/peaks)
  const totalRaised = sum(lastSixFunds.map(m => m.total));
  const totalDonors = sum(lastSixDonors.map(m => m.count));
  const totalVolunteers = sum(lastSixVolunteers.map(m => m.count));
  const totalEvents = sum(lastSixEvents.map(m => m.count));

  // Option builders for ECharts
  const fundsOption = buildBarOption({
    categories: lastSixFunds.map(m => shortMonth(m.month)),
    series: lastSixFunds.map(m => m.total),
    yLabel: "USD",
  });

  const donorsOption = buildLineOption({
    categories: lastSixDonors.map(m => shortMonth(m.month)),
    series: lastSixDonors.map(m => m.count),
    yLabel: "Donors",
  });

  const volunteersOption = buildLineOption({
    categories: lastSixVolunteers.map(m => shortMonth(m.month)),
    series: lastSixVolunteers.map(m => m.count),
    yLabel: "Volunteers",
  });

  const eventsOption = buildBarOption({
    categories: lastSixEvents.map(m => shortMonth(m.month)),
    series: lastSixEvents.map(m => m.count),
    yLabel: "Events",
  });

  return (
    <section id="campaign-metrics" className="flex flex-col gap-6">
      <div className="space-y-1 text-center">
        <h2 className="text-3xl font-serif font-bold tracking-tight sm:text-4xl">
          Campaign Metrics
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground text-pretty">
            {`Track ${candidate.name}'s fundraising, donor, volunteer, and event stats.`}
        </p>
      </div>

  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]">
        {/* 1) Total funds raised */}
        <GraphCard
          title="Total Funds Raised"
          description="Grassroots contributions over the last six months."
          chart={<EChart title="Last 6 Months" option={fundsOption} />}
          expandHref={categoryPath("fundsRaised")}
          statPrimary={formatCurrencyCompact(totalRaised)}
        />

        {/* 2) Number of donors */}
        <GraphCard
          title="Number of Donors"
          description="Unique donors by month over the last six months."
          chart={<EChart title="Last 6 Months" option={donorsOption} />}
          expandHref={categoryPath("donors")}
          statPrimary={formatNumber(totalDonors)}
        />

        {/* 3) Number of volunteers */}
        <GraphCard
          title="Number of Volunteers"
          description="Volunteer participation by month over the last six months."
          chart={<EChart title="Last 6 Months" option={volunteersOption} />}
          expandHref={categoryPath("volunteers")}
          statPrimary={formatNumber(totalVolunteers)}
        />

        {/* 4) Number of events held */}
        <GraphCard
          title="Number of Events Held"
          description="Events by month over the last six months."
          chart={<EChart title="Last 6 Months" option={eventsOption} />}
          expandHref={categoryPath("events")}
          statPrimary={formatNumber(totalEvents)}
        />
      </div>
    </section>
  );
}

// Helpers

function takeLastMonths<T extends { month: string }>(rows: T[], n: number): T[] {
  return rows.slice(-n);
}

function sum(values: number[]) {
  return values.reduce((a, b) => a + b, 0);
}

function shortMonth(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short" });
}

function formatCurrencyCompact(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}
