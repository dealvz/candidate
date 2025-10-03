import { z } from "zod";

export const issueArticleSchema = z.object({
  title: z.string().min(5).max(240),
  link: z.string().url(),
  source: z.string().min(2).max(120),
  description: z.string().min(10).max(400).nullable(),
  publishedAt: z.string().min(4).max(40).nullable(),
  imageUrl: z.string().url().max(600).nullish(),
});

export const articleSearchSchema = z.object({
  issue: z.string().min(3).max(120),
  summary: z.string().min(30).max(600),
  articles: z.array(issueArticleSchema).min(1).max(10),
});

export type ArticleSearchSchema = z.infer<typeof articleSearchSchema>;
