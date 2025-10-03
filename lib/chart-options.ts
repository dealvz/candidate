import type { EChartsOption } from "echarts";
import type { LlmChartSpec } from "@/lib/insights/types";

interface SimpleSeriesOption {
  categories: string[];
  series: number[];
  yLabel?: string;
}

interface MultiSeriesOption {
  categories: string[];
  series: { label: string; data: number[]; kind: "bar" | "line" | "area" }[];
  yLabel?: string;
}

interface PieSeriesOption {
  slices: { name: string; value: number }[];
  valueLabel?: string | null;
}

const baseGrid = { left: 40, right: 20, bottom: 40, top: 20 } as const;
const baseTooltip = { trigger: "axis" as const };

/** Bar */
export function buildBarOption({ categories, series, yLabel }: SimpleSeriesOption): EChartsOption {
  return {
    grid: baseGrid,
    tooltip: baseTooltip,
    xAxis: { type: "category", data: categories },
    yAxis: { type: "value", name: yLabel },
    series: [{ type: "bar", data: series }],
  } satisfies EChartsOption;
}

export function buildMultiAxisOption({ categories, series, yLabel }: MultiSeriesOption): EChartsOption {
  return {
    grid: baseGrid,
    tooltip: baseTooltip,
    legend: { top: 0 },
    xAxis: { type: "category", data: categories },
    yAxis: { type: "value", name: yLabel },
    series: series.map(s => ({
      type: s.kind === "area" ? "line" : s.kind, // treat area as line with fill
      data: s.data,
      name: s.label,
      smooth: s.kind !== "bar",
      ...(s.kind === "area" ? { areaStyle: {} } : {}),
    })),
  } satisfies EChartsOption;
}

/** Line */
export function buildLineOption({ categories, series, yLabel }: SimpleSeriesOption): EChartsOption {
  return {
    grid: baseGrid,
    tooltip: baseTooltip,
    xAxis: { type: "category", data: categories },
    yAxis: { type: "value", name: yLabel },
    series: [{ type: "line", data: series, smooth: true }],
  } satisfies EChartsOption;
}

/** Area (line with fill) */
export function buildAreaOption({ categories, series, yLabel }: SimpleSeriesOption): EChartsOption {
  return {
    grid: baseGrid,
    tooltip: baseTooltip,
    xAxis: { type: "category", data: categories },
    yAxis: { type: "value", name: yLabel },
    series: [
      {
        type: "line",
        data: series,
        smooth: true,
        areaStyle: {},
      },
    ],
  } satisfies EChartsOption;
}

/** Pie / Donut */
export function buildPieOption({ slices, valueLabel }: PieSeriesOption): EChartsOption {
  return {
    tooltip: {
      trigger: "item",
      formatter: valueLabel ? `{b}: {c} ${valueLabel} ({d}%)` : undefined,
    },
    legend: { bottom: 0, type: "scroll" },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"], // donut style
        data: slices,
        avoidLabelOverlap: true,
      },
    ],
  } satisfies EChartsOption;
}

/**
 * Dispatcher to build an ECharts option from an LLM chart spec.
 * Supports: "bar" | "line" | "area" | "pie"
 */
export function buildOptionFromSpec(spec: LlmChartSpec): EChartsOption {
  switch (spec.kind) {
    case "bar":
      if ("series" in spec) {
        return buildMultiAxisOption({
          categories: spec.categories,
          series: spec.series.map(s => ({ ...s, kind: "bar" })),
          yLabel: spec.yAxisLabel ?? undefined,
        });
      }
      return buildBarOption({ categories: spec.categories, series: spec.values, yLabel: spec.yAxisLabel ?? undefined });
    case "line":
      if ("series" in spec) {
        return buildMultiAxisOption({
          categories: spec.categories,
            series: spec.series.map(s => ({ ...s, kind: "line" })),
          yLabel: spec.yAxisLabel ?? undefined,
        });
      }
      return buildLineOption({ categories: spec.categories, series: spec.values, yLabel: spec.yAxisLabel ?? undefined });
    case "area":
      if ("series" in spec) {
        return buildMultiAxisOption({
          categories: spec.categories,
          series: spec.series.map(s => ({ ...s, kind: "area" })),
          yLabel: spec.yAxisLabel ?? undefined,
        });
      }
      return buildAreaOption({ categories: spec.categories, series: spec.values, yLabel: spec.yAxisLabel ?? undefined });
    case "pie":
      return buildPieOption({ slices: spec.slices, valueLabel: spec.valueLabel });
    default:
      return {} as EChartsOption;
  }
}