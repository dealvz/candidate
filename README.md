## Candidate Insights Portal

This repository hosts a Next.js 15 App Router experience that spotlights local election candidates. The site combines biographical summaries, key issue stances, and campaign performance metrics to help voters compare candidates quickly.

### How the Site Is Organized

- Landing redirect: `app/page.tsx` sends visitors to the first configured candidate at `/candidate/[slug]`.
- Candidate shell: `app/candidate/[slug]/layout.tsx` renders a two-column layout with a hero profile on the left and dynamic content on the right, plus navigation to the next candidate.
- Key issues: `/candidate/[slug]/key-issues` surfaces the top policy priorities with background reading pulled from curated articles.
- Campaign metrics: `/candidate/[slug]/campaign-metrics` visualizes fundraising, donor, volunteer, and event trends, with drill-down pages per metric category.
- API routes: the `app/api/candidates/[slug]/…` endpoints expose the same insights as JSON for potential integrations.

All candidate data is sourced from static JSON under `lib/candidates.json`, which the server components load via helper functions in `lib/data.ts`.

## Prerequisites

- Node.js 20 (or the LTS specified by `.nvmrc` if present)
- [pnpm](https://pnpm.io/) 8+

Install dependencies once you have the prerequisites:

```bash
pnpm install
```

## Environment Variables

Create a `.env.local` file by copying `.env.example` and filling in the values that apply to your deployment. The variables currently supported are:

| Variable | Required | Description |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | Optional | API key used to authenticate with OpenRouter when requesting AI-generated summaries or insights. Leave blank to disable remote calls; the UI will fall back to seeded data. |
| `OPENROUTER_MODEL` | Optional | Identifier of the OpenRouter model to call (for example `google/gemini-2.5-flash`). Only relevant when `OPENROUTER_API_KEY` is provided. |

When deploying, ensure any secret values are configured through your hosting provider’s environment settings rather than committed to the repository.

## Available Scripts

All commands below assume the project root as the working directory.

- `pnpm dev` – Starts the development server with Turbopack at `http://localhost:3000`. Hot reloads are enabled for both server and client components.
- `pnpm build` – Creates an optimized production build.
- `pnpm start` – Runs the production build, useful for smoke testing the output of `pnpm build`.
- `pnpm lint` – Executes the Next.js ESLint configuration (`next/core-web-vitals`).

## Development Workflow

1. Install dependencies with `pnpm install`.
2. Copy `.env.example` to `.env.local` and fill any relevant values.
3. Run `pnpm dev` and open `http://localhost:3000`.
4. Edit files under `app/` or `components/`; the browser will update automatically.

Static candidate records live in `lib/candidates.json`. Updating metrics or issue statements there will propagate across the UI and the supporting API routes on the next reload or rebuild.

## Navigating the Experience

- **Candidate overview**: Each candidate page features a hero banner with portrait, slogan, party, and an average donation figure derived from recent metrics. Use the next-candidate control to jump between profiles.
- **Policy deep dive**: The Key Issues view groups topics with short summaries and reading lists. Article metadata is defined in `lib/articles` and surfaced via both page content and `app/api/candidates/[slug]/key-issues/[issue]/articles`.
- **Metrics dashboard**: The Campaign Metrics section highlights six-month trends. Use the “View details” links on each card to open the metric-specific route (e.g., `/campaign-metrics/fundsRaised`) for a longer historical series.
- **Sharing**: Canonical URLs and share metadata are derived from `NEXT_PUBLIC_BASE_URL` in `app/layout.tsx`, ensuring links render correctly in social previews.

## Deployment Notes

- `next.config.ts` currently keeps the default configuration. Document any future feature flags there.
- Uploaded assets under `public/` provide candidate portraits and issue illustrations; `next/image` handles optimization.
- Tailwind CSS is configured via `app/globals.css` with theming tokens and a `.dark` class variant. Prefer using the existing token classes (`bg-card`, `text-muted-foreground`, etc.) when adding UI.

## Troubleshooting

- Ensure all environment variables are defined before running `pnpm build`; missing secrets can cause runtime fetch failures.
- If charts fail to render, confirm browser support for `ResizeObserver` or wrap the chart component in a client boundary if future hooks are introduced.
- Run `pnpm lint` to catch type or accessibility issues before opening a pull request.

## Contributing

1. Create a feature branch from `frontend-mock`.
2. Make your changes and add tests or fixtures if applicable.
3. Run `pnpm lint` and `pnpm build` locally.
4. Open a pull request summarizing the user-facing impact and link any relevant issues.
