export type DeepDiveCategory = "fundsRaised" | "donors" | "volunteers" | "events";

export interface InsightBlock {
  headline: string;
  summary: string;
  bullets: string[];
  caveats: string[] | null;
}

/** Base chart spec */
interface BaseChartSpec {
  id: string;
  title: string;
  narrative: string;
  forCategory: DeepDiveCategory | null;
}

/** Bar / Line / Area expect categories + values */
export interface AxisSeries1D extends BaseChartSpec {
  kind: "bar" | "line" | "area";
  categories: string[];    // e.g., ['Jan', 'Feb', ...]
  values: number[];        // must be same length as categories
  yAxisLabel: string | null;
}

/** Multi-series axis chart (when comparing multiple labeled series). */
export interface AxisSeriesMulti extends BaseChartSpec {
  kind: "bar" | "line" | "area"; // same discriminator values
  categories: string[];             // shared x-axis labels
  series: { label: string; data: number[] }[]; // 2-5 series, each data[] same length as categories
  yAxisLabel: string | null;
}

/** Pie expects name/value slices */
export interface PieSeries extends BaseChartSpec {
  kind: "pie";
  slices: { name: string; value: number }[];
  valueLabel: string | null;
}

export type LlmChartSpec = AxisSeries1D | AxisSeriesMulti | PieSeries;

/** Full response the LLM should return */
export interface DeepDiveResponse {
  insights: Record<DeepDiveCategory, InsightBlock>;
  chart: LlmChartSpec; // single best chart representing the focus category (may integrate supporting signals)
}
