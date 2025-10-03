import "server-only";
import { generateText } from "ai";
import { jsonrepair } from "jsonrepair";
import { openrouter, MODEL_ID } from "./provider";
import { deepDiveSchema } from "./schema";
import type { ExpandedMetrics } from "@/lib/types";
import type { DeepDiveCategory, DeepDiveResponse } from "./types";
import { retryWithValidation } from "@/lib/utils";

const deepDiveSystemPrompt = `You are a senior campaign data analyst tasked with narrating trends for a political analytics product.
Return ONLY valid JSON that conforms to the provided JSON schema. Anchor every claim in the supplied data, cite concrete figures or date ranges when available, surface notable deltas or anomalies, and flag material uncertainties instead of speculating. Never invent metrics.`;

type MetricsCsvSections = {
  donationsCsv: string;
  volunteersCsv: string;
  eventsCsv: string;
};

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function toCsv(rows: Record<string, unknown>[], columns: readonly string[]): string {
  const header = columns.join(",");
  if (!rows.length) {
    return header;
  }

  const lines = rows.map((row) =>
    columns
      .map((column) => escapeCsvValue(row[column]))
      .join(",")
  );

  return [header, ...lines].join("\n");
}

/**
 * This function helps us reduce the number of tokens we sent to an LLM by deduping the common keys inherent to JSON like data
 * @param metrics The raw javasript object of campaign metrics
 * @returns Data transformed into CSV sections for donations, volunteers, and events
 */
function buildMetricsCsv(metrics: ExpandedMetrics): MetricsCsvSections {
  const donationColumns = ["name", "city", "state", "age", "amountUSD", "date"] as const;
  const volunteerColumns = ["month", "count"] as const;
  const eventColumns = ["date", "type", "city", "state", "attendees"] as const;

  return {
    donationsCsv: toCsv(
      metrics.donations.map((donation) => ({
        name: donation.name,
        city: donation.city,
        state: donation.state,
        age: donation.age,
        amountUSD: donation.amountUSD,
        date: donation.date,
      })),
      donationColumns,
    ),
    volunteersCsv: toCsv(
      metrics.volunteerCountsByMonth.map((entry) => ({
        month: entry.month,
        count: entry.count,
      })),
      volunteerColumns,
    ),
    eventsCsv: toCsv(
      metrics.events.map((event) => ({
        date: event.date,
        type: event.type,
        city: event.city,
        state: event.state,
        attendees: event.attendees,
      })),
      eventColumns,
    ),
  };
}

const deepDiveResponseExample = `{
  "insights": {
    "fundsRaised": {
      "headline": "Grassroots Surge Drives Q2 Fundraising",
      "summary": "Small-dollar donations accelerated in late spring, outpacing high-dollar checks.",
      "bullets": [
        "Average donation rose 12% after the town hall tour.",
        "First-time donors accounted for 38% of Q2 revenue.",
        "Repeat donors gave 1.4 gifts on average in June."
      ],
      "caveats": ["Monitor donor fatigue if July pace slows."]
    },
    "donors": {
      "headline": "Volunteer Referrals Grow Donor Base",
      "summary": "Referral programs are unlocking new supporters in suburban precincts.",
      "bullets": [
        "Referral codes delivered 420 new donors in June.",
        "Average referred gift is $87 compared with $74 overall.",
        "Suburban zip codes contributed 62% of new donors."
      ],
      "caveats": null
    },
    "volunteers": {
      "headline": "Field Team Momentum Sustained",
      "summary": "Weekend canvass launches continue to attract returning volunteers.",
      "bullets": [
        "Volunteer hours jumped 28% during the May blitz.",
        "Retention held at 71% for volunteers active in April/May.",
        "Phone bank captains recruited 95 new callers."
      ],
      "caveats": null
    },
    "events": {
      "headline": "Town Halls Anchor Voter Contact",
      "summary": "Hybrid events are drawing both local attendees and livestream audiences.",
      "bullets": [
        "Average on-site attendance reached 210 per event.",
        "Livestream viewers grew 45% after paid promotion.",
        "Rural swing counties hosted three of the four biggest turnouts."
      ],
      "caveats": ["Consider accessibility services for virtual audiences."]
    }
  },
  "chart": {
    "id": "focus-series-comparison",
    "title": "Focused Metric Trend with Context",
    "narrative": "The primary category accelerated mid-period while supportive indicators signaled durable momentum that sustained gains.",
    "forCategory": "fundsRaised",
    "kind": "line",
    "categories": ["Week 1", "Week 2"],
    "values": [125000, 162000],
    "yAxisLabel": "USD"
  }
}`;

const deepDiveTypesDefinition = `type DeepDiveCategory = "fundsRaised" | "donors" | "volunteers" | "events"; // Fixed set of valid category identifiers

interface InsightBlock { // One narrative insight block per category
  headline: string;        // Short, compelling, data-grounded headline (<= 140 chars)
  summary: string;         // 1–3 sentences expanding the headline with quantified evidence
  bullets: string[];       // 3–8 concise, action / insight oriented bullet points
  caveats: string[] | null;// Optional list of risks / uncertainties; null when none
}

interface AxisChartSpec {  // Chart with an x-axis of categories and a single numeric series
  kind: "bar" | "line" | "area"; // Allowed axis chart kinds
  id: string;               // Stable, machine-safe identifier (kebab-case)
  title: string;            // Human-readable chart title
  narrative: string;        // 2–3 sentence plain-English interpretation of the chart
  forCategory: DeepDiveCategory | null; // Primary category this chart supports or null if cross-cutting
  categories: string[];     // Ordered x-axis category labels (e.g. months)
  values: number[];         // EXACTLY one numeric series – SAME LENGTH as categories
  yAxisLabel: string | null;// Unit/measure label (e.g. "USD", "Number of donors") or null if obvious
}

interface AxisChartMultiSpec { // Multi-series comparison chart (2–5 series). Use ONLY when comparing related metrics.
  kind: "bar" | "line" | "area"; // Same discriminator
  id: string;               // Stable id
  title: string;            // Title describing comparison
  narrative: string;        // Interprets the relationship/differences between series
  forCategory: DeepDiveCategory | null; // Category most supported
  categories: string[];     // Shared x-axis labels
  series: { label: string; data: number[] }[]; // 2–5 labeled numeric series
  yAxisLabel: string | null;// Unit label
}

interface PieChartSpec {   // Pie / donut chart specification
  kind: "pie";             // Discriminator for pie charts
  id: string;               // Stable, machine-safe identifier (kebab-case)
  title: string;            // Human-readable chart title
  narrative: string;        // 2–3 sentence interpretation of slice distribution
  forCategory: DeepDiveCategory | null; // Category most supported by this chart or null
  slices: { name: string; value: number }[]; // Each slice name and its numeric value
  valueLabel: string | null;// Label describing what slice values represent (e.g. "Attendees")
}

type LlmChartSpec = AxisChartSpec | AxisChartMultiSpec | PieChartSpec; // Union of supported chart spec shapes

interface DeepDiveResponse { // Complete model response object
  insights: Record<DeepDiveCategory, InsightBlock>; // Must include all four categories as keys
  chart: LlmChartSpec;       // EXACTLY ONE chart – best representation of the focus category leveraging supporting data
}

// IMPORTANT RULES:
// - Use EITHER \`values\` (single series) OR \`series\` (multi-series). Never both in one chart.
// - When using multi-series, each series.data length MUST match categories length.
// - Avoid unnecessary multi-series charts; only use them when comparison adds analytical value.
// - categories.length MUST === values.length for every axis chart.
// - Provide exactly 1 chart total (no more, no less).
// - Do NOT introduce additional fields.
// - JSON output ONLY – no comments, no trailing commas, no markdown.
`;

export function deepDiveUserPrompt(primaryCategory: DeepDiveCategory, csv: MetricsCsvSections) {
  return [
    `Primary focus category: ${primaryCategory}`,
    "You will receive multiple campaign data tables in CSV format. Craft a cohesive story that spotlights the primary category while incorporating supporting evidence from the other datasets.",
  "Produce exactly ONE chart: the analytically strongest representation of the PRIMARY focus category using any supporting data for context.",
  "Chart requirements (single best chart):",
  "- Allowed kinds: bar, line, area, pie.",
  "- Choose the kind based on analytical clarity: line for temporal volatility/trajectory, area for cumulative or compounding growth, bar for categorical comparisons, pie for composition breakdown. It's okay to create a chart that is not the main storyline if there is still something interesting in the data.",
  "Pie chart selection heuristics:",
  "  1. The focus category's most compelling story hinges on proportion, share, mix, or distribution across discrete groups.",
  "  2. Relative differences (e.g. largest vs smallest segments) are more impactful than temporal change.",
  "  3. There are between 3 and 10 meaningful segments after optional consolidation (avoid long tail noise).",
  "If these criteria are met, strongly prefer a pie. If not met, justify another chart type implicitly through the narrative (no explicit justification text).",
  "When using pie: ensure slice names are human-readable and valueLabel clarifies the measured unit (e.g. 'Attendees', 'Donations in USD').",
  "- If comparing multiple related series, use the multi-series axis format (series array) ONLY when the comparison sharpens the primary category's story; otherwise keep a single series.",
  "- Ensure categories.length matches each series' data length (or values length for single-series).",
  "- Set forCategory to the primary focus category (never null here unless a cross-cutting rationale is overwhelming and still clarifies the focus).",
  "- Provide yAxisLabel for axis charts (null only if redundant). For pie include valueLabel when meaningful.",
  "Narrative DOs and DON'Ts:",
  "- DO synthesize causes, implications, and cross-metric relationships (e.g., link volunteer growth preceding fundraising spikes).",
  "- DO surface meaningful contrasts (peaks vs troughs, acceleration vs stagnation, leading vs trailing segments).",
  "- DO write in an engaging, editorial yet objective style—informative and forward-looking without hype.",
  "- DO lead with the most actionable or surprising takeaway, not a bland restatement of numbers.",
  "- DON'T mention or refer to 'the chart', 'this chart', 'the visualization', 'the figure', or 'the graphic'.",
  "- DON'T merely list data points in order; every sentence must add interpretation or relevance.",
  "- DON'T fabricate drivers—only infer relationships clearly supported by temporal ordering or magnitude shifts in the data.",
  "Insight requirements:",
  "- Lead each summary with the most recent or most material quantified takeaway for that category, referencing exact numbers, deltas, or timeframes from the tables.",
  "- Draw at least one cross-category connection when it sharpens the takeaway (e.g., link fundraising spikes to volunteer surges) while staying evidence-based.",
  "- Provide concise, data-backed insights for each category with actionable bullet points and optional caveats (return caveats as an array of short strings, or null when none).",
  "- Highlight risks or uncertainties only when the data directly signals them; otherwise omit speculation.",
    "Style:",
    "- No markdown, percentages should include the % symbol, currency should use dollars.",
    "- Be creative in revealing non-obvious connections but remain data-faithful.",
    "- Do not repeat the same sentence in multiple narratives or insights.",
    "Type definitions (authoritative schema with comments – follow EXACTLY):",
    deepDiveTypesDefinition,
    "Example JSON response (structure only, values illustrative):",
    deepDiveResponseExample,
    "",
    "Donations CSV:",
    csv.donationsCsv,
    "",
    "Volunteer Counts CSV:",
    csv.volunteersCsv,
    "",
    "Events CSV:",
    csv.eventsCsv,
  ].join("\n");
}

export async function generateDeepDiveLLM(
  metrics: ExpandedMetrics,
  primaryCategory: DeepDiveCategory,
): Promise<DeepDiveResponse> {
  const metricsCsv = buildMetricsCsv(metrics);
  let lastValidationIssue: string | undefined;
  let lastValidatedResult: DeepDiveResponse | undefined;

  try {
    const rawText = await retryWithValidation(
      async () => {
        const response = await generateText({
          model: openrouter(MODEL_ID),
          system: deepDiveSystemPrompt,
          prompt: deepDiveUserPrompt(primaryCategory, metricsCsv),
        });

        return response.text.trim();
      },
      async (text) => {
        try {
          const repaired = jsonrepair(text);
          const parsed = JSON.parse(repaired);
          const validation = deepDiveSchema.safeParse(parsed);

          if (!validation.success) {
            lastValidatedResult = undefined;
            lastValidationIssue = validation.error.issues
              .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
              .join("; ");

            return false;
          }

          lastValidationIssue = undefined;
          lastValidatedResult = validation.data as DeepDiveResponse;
          return true;
        } catch (error) {
          lastValidatedResult = undefined;
          lastValidationIssue =
            error instanceof Error ? error.message : "Failed to parse JSON response.";
          return false;
        }
      },
      {
        onError: async (error, attempt) => {
          lastValidationIssue = undefined;
          console.warn(`[generateDeepDiveLLM] LLM request failed on attempt ${attempt}`, error);
        },
        onValidationFailure: async (_, attempt) => {
          if (lastValidationIssue) {
            console.warn(
              `[generateDeepDiveLLM] Validation failed on attempt ${attempt}: ${lastValidationIssue}`,
            );
          }
        },
      },
    );

    if (!lastValidatedResult) {
      const repaired = jsonrepair(rawText);
      const parsed = JSON.parse(repaired);
      return deepDiveSchema.parse(parsed) as DeepDiveResponse;
    }

    return lastValidatedResult;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Validation failed") && lastValidationIssue) {
      throw new Error(`Deep dive response failed schema validation: ${lastValidationIssue}`);
    }

    const apiError = error as {
      statusCode?: number;
      responseBody?: unknown;
      requestBodyValues?: unknown;
    };

    const responseBody =
      typeof apiError.responseBody === "string" ? apiError.responseBody.slice(0, 2000) : undefined;


    if (responseBody && responseBody.trim().startsWith("<!DOCTYPE html>")) {
      throw new Error(
        "OpenRouter returned an HTML response. Confirm OPENROUTER_API_KEY and requested model access."
      );
    }

    throw error;
  }
}
