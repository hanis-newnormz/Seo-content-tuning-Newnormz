# SEO Content Review Board

A web platform for a digital marketing agency to present website content and SEO
optimization recommendations to clients — replacing the "screenshot pasted into
PowerPoint" workflow with an interactive, presentation-ready review experience.

This application only **reviews, presents, and approves** SEO recommendations.
It never edits or deploys changes to a client's live website.

## Tech stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, hand-rolled shadcn/ui-style components
- **Backend / Auth / DB:** Supabase (Postgres, Auth, Storage)
- **PDF export:** `@react-pdf/renderer`
- **Hosting:** Vercel-compatible

## Getting started

### 1. Create a Supabase project

Create a project at [supabase.com](https://supabase.com), then open the SQL editor
and run the migrations in order:

```
supabase/migrations/0001_init.sql
supabase/migrations/0002_views.sql
```

This creates all tables (`projects`, `pages`, `recommendations`, `annotations`,
`comments`, `client_shares`, `profiles`), row-level security policies, the
`screenshots` storage bucket, and the `project_stats` / `page_stats` views used
by the dashboard.

> Email confirmation is on by default in new Supabase projects. For local
> testing, you can disable it under **Authentication → Providers → Email** so
> sign-up logs you in immediately.

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your project's values from
**Project Settings → API**:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

The service role key is used server-side only, to serve the public client
review link (`/client/[token]`) and verify share tokens without exposing
Supabase's row-level security to anonymous visitors.

### 3. Install dependencies and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Create an account from
the login screen to get started — the first user to sign up already has full
access to create and manage review projects (there's a single shared agency
workspace; no separate admin step is required for the MVP).

## Core flow

1. **Create a review project** — client name, website URL, project name, target keywords.
2. **Add pages** to the project and upload a screenshot of each.
3. **Open the review workspace** — a split screen with the screenshot on the
   left and recommendation cards on the right. Click anywhere on the
   screenshot to drop a pin and create a recommendation; drag pins to
   reposition them; click a pin to jump to its card.
4. Each recommendation captures section, category, priority, current vs.
   recommended content, the SEO reason, status, and internal-only notes.
5. **Generate a client review link** from the project page — a public,
   token-based URL with no login required. Clients see screenshots, issues,
   recommendations, and expected benefit, and can approve, request changes,
   or comment. Internal notes are never sent to this view.
6. **Export a PDF report** of the full project (cover page + per-recommendation
   detail) directly from the project page.

## Project structure

```
src/
  app/
    (app)/            authenticated agency workspace (dashboard, projects, review UI)
    login/            sign in / sign up
    client/[token]/    public, token-based client review view
    api/               PDF export route
  components/          UI, split by feature area (dashboard, projects, review, client, shared)
  lib/
    actions/           Next.js Server Actions (mutations)
    supabase/           browser / server / middleware Supabase clients
    pdf/                @react-pdf/renderer report definition
    data.ts             authenticated read queries
    client-data.ts       service-role reads for the public client view
  types/database.ts     hand-written Supabase Database types + shared enums/labels
supabase/migrations/    SQL schema, RLS policies, storage bucket
```

## Notes on scope

This is intentionally scoped as an MVP focused on replacing the PowerPoint
workflow: manual screenshot upload (no automatic crawling), no CMS/WordPress/
Elementor integration, and no website editing capability of any kind.
