export interface IssueArticle {
  title: string;
  link: string;
  source: string;
  description: string | null;
  publishedAt: string | null;
  imageUrl?: string | null;
}

export interface ArticleSearchResponse {
  issue: string;
  summary: string;
  articles: IssueArticle[];
}
