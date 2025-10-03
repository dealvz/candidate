import type { ExpandedMetrics } from "./types";

const toMonthKey = (isoDate: string) => isoDate.slice(0, 7); // "YYYY-MM"

export interface MetricSummary {
  totalRaisedUSD: number;
  donors: number;
  avgDonationUSD: number;
  volunteers: number;
  events: number;
}

export function buildMetricSummary(metrics: ExpandedMetrics): MetricSummary {
  const totalRaisedUSD = metrics.donations.reduce((sum, donation) => sum + donation.amountUSD, 0);
  const donors = metrics.donations.length;
  const avgDonationUSD = donors ? Math.round(totalRaisedUSD / donors) : 0;
  const volunteers = metrics.volunteerCountsByMonth.reduce((sum, item) => sum + item.count, 0);
  const events = metrics.events.length;

  return { totalRaisedUSD, donors, avgDonationUSD, volunteers, events };
}

export function buildDonationsByMonth(metrics: ExpandedMetrics) {
  const monthTotals = new Map<string, number>();
  for (const donation of metrics.donations) {
    const key = toMonthKey(donation.date);
    monthTotals.set(key, (monthTotals.get(key) ?? 0) + donation.amountUSD);
  }
  return [...monthTotals.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([month, total]) => ({ month, total }));
}

export function buildDonationsByCity(metrics: ExpandedMetrics) {
  const cityTotals = new Map<string, number>();
  for (const donation of metrics.donations) {
    const label = `${donation.city}, ${donation.state}`;
    cityTotals.set(label, (cityTotals.get(label) ?? 0) + donation.amountUSD);
  }
  return [...cityTotals.entries()].map(([name, value]) => ({ name, value }));
}

export function buildEventAttendanceByMonth(metrics: ExpandedMetrics) {
  const monthTotals = new Map<string, number>();
  for (const event of metrics.events) {
    const key = toMonthKey(event.date);
    monthTotals.set(key, (monthTotals.get(key) ?? 0) + event.attendees);
  }
  return [...monthTotals.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([month, attendees]) => ({ month, attendees }));
}

export function buildDonorsByMonth(metrics: ExpandedMetrics) {
  const donorsByMonth = new Map<string, Set<string>>();
  for (const donation of metrics.donations) {
    const key = toMonthKey(donation.date);
    if (!donorsByMonth.has(key)) donorsByMonth.set(key, new Set());
    donorsByMonth.get(key)!.add(donation.name);
  }
  return [...donorsByMonth.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([month, donors]) => ({ month, count: donors.size }));
}

export function buildEventsHeldByMonth(metrics: ExpandedMetrics) {
  const eventCounts = new Map<string, number>();
  for (const event of metrics.events) {
    const key = toMonthKey(event.date);
    eventCounts.set(key, (eventCounts.get(key) ?? 0) + 1);
  }
  return [...eventCounts.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([month, count]) => ({ month, count }));
}

export function buildVolunteerCountsByMonth(metrics: ExpandedMetrics) {
  return [...metrics.volunteerCountsByMonth].sort((a, b) => (a.month < b.month ? -1 : 1));
}