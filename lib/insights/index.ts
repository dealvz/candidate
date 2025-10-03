import "server-only";
import { generateObject, generateText } from "ai";
import { openrouter, MODEL_ID } from "./provider";
import { deepDiveSchema } from "./schema";
import type { ExpandedMetrics } from "@/lib/types";
import type { DeepDiveCategory, DeepDiveResponse } from "./types";

const deepDiveSystemPrompt = `You are a senior campaign data analyst tasked with narrating trends for a political analytics product.
Return ONLY valid JSON that conforms to the provided JSON schema. Anchor every claim in the supplied data, cite concrete figures or date ranges when available, surface notable deltas or anomalies, and flag material uncertainties instead of speculating. Never invent metrics.`;

const deepDiveRepairSystemPrompt = `You are a meticulous schema enforcer. Convert a draft response into JSON that exactly matches the target schema, correcting structural issues or missing fields without inventing unsupported metrics.`;

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



const deepDiveTypesDefinition = `type DeepDiveCategory = "fundsRaised" | "donors" | "volunteers" | "events";

interface InsightBlock {
  headline: string;        // Short, compelling headline (<= 140 chars)
  summary: string;         // 1–3 sentences expanding the headline
  bullets: string[];       // 3–8 concise bullet points
  caveats: string[] | null;// Optional risks/uncertainties; null when none
}

interface AxisChartSpec {
  kind: "bar" | "line" | "area";
  title: string;
  narrative: string;        // 2–3 sentence interpretation
  forCategory: DeepDiveCategory | null;
  categories: string[];     // X-axis labels
  values: number[];         // Single numeric series (same length as categories)
  yAxisLabel: string | null;// Unit label or null
}

interface AxisChartMultiSpec {
  kind: "bar" | "line" | "area";
  title: string;
  narrative: string;        // 2–3 sentence interpretation
  forCategory: DeepDiveCategory | null;
  categories: string[];     // X-axis labels
  series: Array<{           // 2-5 labeled series
    label: string;
    data: number[];         // Same length as categories
  }>;
  yAxisLabel: string | null;// Unit label or null
}

interface PieChartSpec {
  kind: "pie";
  title: string;
  narrative: string;        // 2–3 sentence interpretation
  forCategory: DeepDiveCategory | null;
  slices: Array<{
    name: string;
    value: number;
  }>;
  valueLabel: string | null;// What values represent
}

type LlmChartSpec = AxisChartSpec | AxisChartMultiSpec | PieChartSpec;

interface DeepDiveResponse {
  insights: Record<DeepDiveCategory, InsightBlock>;
  chart: LlmChartSpec;
}`;

export function deepDiveUserPrompt(primaryCategory: DeepDiveCategory, csv: MetricsCsvSections) {
  return [
    `Primary focus category: ${primaryCategory}`,
    "You will receive multiple campaign data tables in CSV format. Craft a cohesive story that spotlights the primary category while incorporating supporting evidence from the other datasets.",
  "Produce exactly ONE chart: the analytically strongest representation of the PRIMARY focus category using any supporting data for context.",
  "Chart requirements (single best chart):",
  "- Allowed kinds: pie, bar, area, line.",
  "- STRUCTURE: For single-series (bar/line/area), include 'values' array. For multi-series, include 'series' array with label+data. For pie, include 'slices' array. NEVER mix these fields.",
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
    "",
    "Type definitions (authoritative schema – follow EXACTLY):",
    deepDiveTypesDefinition,
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

function deepDiveRepairPrompt(primaryCategory: DeepDiveCategory, draft: string): string {
  return [
    `Primary focus category: ${primaryCategory}`,
    "You previously produced the following draft response. It may contain schema violations or missing fields.",
    "Tasks:",
    "- Return strictly valid JSON that matches the schema.",
    "- Preserve the analytical intent and data fidelity of the draft.",
    "- Fill in missing required fields using the draft content only; do not fabricate unsupported metrics.",
    "",
    "Draft response:",
    draft,
    "",
    "Schema definition:",
    deepDiveTypesDefinition,
  ].join("\n");
}

export async function generateDeepDiveLLM(
  metrics: ExpandedMetrics,
  primaryCategory: DeepDiveCategory,
): Promise<DeepDiveResponse> {
  const metricsCsv = buildMetricsCsv(metrics);

  try {
    const firstPass = await generateText({
      model: openrouter(MODEL_ID),
      system: deepDiveSystemPrompt,
      prompt: deepDiveUserPrompt(primaryCategory, metricsCsv),
    });

    const secondPass = await generateObject({
      model: openrouter(MODEL_ID),
      schema: deepDiveSchema,
      system: deepDiveRepairSystemPrompt,
      prompt: deepDiveRepairPrompt(primaryCategory, firstPass.text.trim()),
    });

    return deepDiveSchema.parse(secondPass.object) as DeepDiveResponse;
  } catch (error) {
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
