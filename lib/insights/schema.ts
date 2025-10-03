import { z } from "zod";

const caveatsSchema = z.array(z.string().min(3)).max(12).nullable();

export const insightBlockSchema = z.object({
  headline: z.string().min(3).max(140),
  summary: z.string().min(10).max(600),
  bullets: z.array(z.string().min(3)).min(3).max(8),
  caveats: caveatsSchema,
});

const baseChart = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  narrative: z.string().min(20).max(600),
  forCategory: z.enum(["fundsRaised", "donors", "volunteers", "events"]).nullable(),
});

// Single-series axis chart (legacy / simplest form)
const axisSeries1D = baseChart.extend({
  kind: z.enum(["bar", "line", "area"]),
  categories: z.array(z.string()),
  values: z.array(z.number()),
  yAxisLabel: z.string().nullable(),
}).refine(v => v.categories.length === v.values.length, {
  message: "categories and values must be same length",
});

// Multi-series axis chart (supports 2-5 labeled numeric series) – keeps same kind values but uses `series` instead of `values`.
const axisSeriesMulti = baseChart.extend({
  kind: z.enum(["bar", "line", "area"]),
  categories: z.array(z.string()),
  series: z.array(
    z.object({
      label: z.string().min(1),
      data: z.array(z.number()),
    })
  ).min(2).max(5),
  yAxisLabel: z.string().nullable(),
}).refine(v => v.series.every(s => s.data.length === v.categories.length), {
  message: "each series.data length must match categories length",
});

const pieSeries = baseChart.extend({
  kind: z.literal("pie"),
  slices: z.array(z.object({ name: z.string(), value: z.number() })),
  valueLabel: z.string().nullable(),
});

// Because single & multi axis variants share the same discriminator (kind), we use a standard union instead of discriminatedUnion.
export const llmChartSpecSchema = z.union([
  axisSeries1D,
  axisSeriesMulti,
  pieSeries,
]);

export const deepDiveSchema = z.object({
  insights: z.object({
    fundsRaised: insightBlockSchema,
    donors: insightBlockSchema,
    volunteers: insightBlockSchema,
    events: insightBlockSchema,
  }),
  chart: llmChartSpecSchema, // single best-fit chart for the primary category leveraging supporting data
});

export type DeepDiveSchema = z.infer<typeof deepDiveSchema>;