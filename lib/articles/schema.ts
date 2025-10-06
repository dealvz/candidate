import { z } from "zod";

export const articleSearchSchema = z.object({
  issue: z.string().min(3).max(120),
  summary: z.string().min(30),
  articles: z.array(z.string()).min(1),
});

export type ArticleSearchSchema = z.infer<typeof articleSearchSchema>;
