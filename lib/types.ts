export interface Donation {
  name: string;
  city: string;
  state: string;
  age: number;
  amountUSD: number;
  date: string;     
}

export interface VolunteerByMonth {
  month: string;
  count: number;
}

export interface CampaignEvent {
  date: string;
  type: string;
  city: string;
  state: string;
  attendees: number;
}

export interface ExpandedMetrics {
  donations: Donation[];
  volunteerCountsByMonth: VolunteerByMonth[];
  events: CampaignEvent[];
}

export type Party =
  | "Democrat" | "Republican" | "Independent" | "Nonpartisan"
  | "Green" | "Libertarian" | "Other";

export interface KeyIssue {
  slug: string;
  title: string;
  summary: string;
}

export interface Candidate {
  id?: string;
  slug: string;
  name: string;
  photoUrl: string;
  office: string;
  party: Party;
  slogan: string;
  issues: KeyIssue[];
  metrics: ExpandedMetrics;
}
