"use client";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { cn } from "@/lib/utils";

interface EChartProps {
  title?: string;
  option: EChartsOption;
  height?: number | string;
  className?: string;
}

export default function EChart({ title, option, height = "100%", className }: EChartProps) {
  const resolvedHeight = typeof height === "number" ? `${height}px` : height;

  return (
    <div className={cn("flex h-full w-full flex-col", className)}>
      {title ? (
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </div>
      ) : null}
      <ReactECharts option={option} style={{ height: resolvedHeight, width: "100%" }} />
    </div>
  );
}