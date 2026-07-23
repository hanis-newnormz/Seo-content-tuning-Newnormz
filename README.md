# SEO Content Review Board

A premium, client-facing review platform for presenting SEO/content optimization
recommendations — replacing the "screenshot + PowerPoint" workflow with a live,
annotated, shareable web experience.

**This app does not edit websites, deploy changes, or crawl pages.** It is purely
a review, presentation, and approval tool: upload a screenshot of a page, pin
recommendations directly onto it, and share a client-facing link where the
client can approve, request changes, or comment.

## Demo mode

`DEMO_MODE` in [`src/lib/demo/config.ts`](./src/lib/demo/config.ts) is currently `false` — the app
talks to a real Supabase project. Flip it to `true` any time you want to preview the interface
without a backend. While it's on:

- **No Supabase project or environment variables are required.** Auth, storage, and the database
  are all replaced by an in-memory store (`src/lib/demo/store.ts`) seeded with two sample projects
  (`ABC International School` and `Sunrise Café`).
- `/login` accepts **any** email/password and drops you straight into the dashboard.
- Uploading a screenshot on the "Add Page" dialog stores it as a data URL instead of uploading to
  Supabase Storage — no network call happens.
- The client share links `/client/demo-school-review` and `/client/demo-cafe-review` work out of the
  box.
- Data lives only in server memory for the life of the dev process (it resets on server restart, or
  any time you edit `src/lib/demo/store.ts`). Use **Reset demo data** in the user menu (top right) to
  restore the original seed data at any time without restarting the server.

To switch back to a real Supabase backend, set `DEMO_MODE = false` in `src/lib/demo/config.ts` and
follow the setup steps below.

## Tech stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui (hand-installed — the
  `shadcn` CLI's registry is blocked in this sandbox, so the primitives in `src/components/ui` were
  written by hand instead of generated)
- **Backend / DB:** Supabase (Postgres, Auth, Storage)
- **PDF export:** `@react-pdf/renderer`
- **Hosting:** Vercel-compatible

## Core features

1. **Review projects** — client name, website, project name, target keywords.
2. **Website pages** — add pages with a manually uploaded screenshot.
3. **Split-screen review workspace** — screenshot on the left, recommendation cards on the right.
4. **Screenshot annotation** — click to drop a pin, drag to reposition, click a pin to jump to its
   recommendation, delete pins.
5. **Recommendation cards** — section, current content, SEO issue, recommendation, reason, expected
   benefit, priority, category, status.
6. **Before/After comparison** — current vs. recommended content, side by side.
7. **Client view** — a public, unauthenticated link (`/client/[shareToken]`) with no internal notes,
   where clients can approve, request changes, and comment.
8. **Dashboard** — projects, pages reviewed, recommendations, approval progress.
9. **PDF export** — a shareable report with a cover page and one section per recommendation.

## Getting started

### 1. Create a Supabase project

Create a project at [supabase.com](https://supabase.com), then open the SQL editor and run the
migration in [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql). This creates:

- All tables (`projects`, `pages`, `recommendations`, `annotations`, `comments`, `profiles`)
- Row Level Security policies (authenticated agency users get full access; the public `/client/...`
  view is served through server-only code using the service-role key, so anonymous direct table
  access is intentionally left closed)
- A public `screenshots` Storage bucket with matching storage policies
- A trigger that creates a `profiles` row whenever a new user signs up

### 2. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in the values from your Supabase project's
**Settings → API** page:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` is used **only** in server-only code (`src/lib/supabase/server.ts`'s
`createServiceRoleClient`, used by the public client-view pages) — never expose it to the browser.

### 3. Create your first agency user

Either use the "Create account" tab on the `/login` page, or invite a user from the Supabase
dashboard under **Authentication → Users**.

### 4. Install and run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## Project structure

```
src/app/(app)/...            Authenticated agency workspace (dashboard, projects, review workspace)
src/app/client/[shareToken]  Public, unauthenticated client-facing review view
src/app/api/export/[id]      PDF report generation (@react-pdf/renderer)
src/app/login                Supabase Auth sign-in / sign-up
src/components/ui            Hand-built shadcn/ui-style primitives
src/components/shared        Cross-cutting UI (badges, before/after, sidebar, user menu)
src/lib/supabase             Browser/server/service-role Supabase clients + generated types
src/lib/data.ts               Server-only data-fetching helpers
supabase/migrations           SQL schema, RLS policies, storage bucket setup
```

## Deploying

The app deploys to Vercel with no special configuration beyond the three environment variables
above. The PDF export route (`src/app/api/export/[projectId]/route.ts`) requires the Node.js
runtime (already set via `export const runtime = "nodejs"`), which Vercel supports out of the box.

## Not in scope (by design)

- Editing or publishing changes to the client's live website
- WordPress / Elementor / CMS integrations
- Automatic screenshot capture or site crawling

These are explicitly out of scope — this tool replaces the *presentation* layer of an SEO review,
not the implementation of the changes themselves.
