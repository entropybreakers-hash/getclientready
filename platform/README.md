# Get Client Ready — Student Platform

Next.js 16 (App Router) + Tailwind 4 + Supabase. Single-tenant student platform for the Get Client Ready 6-week programme. Brand parity with the landing page (Cormorant Garamond + Inter, beige `#C9A876` accent on a `#0F0F0F` dark background).

## Status

- ✅ Project scaffold, brand palette, fonts wired
- ✅ Mock data layer — runs the whole UI without Supabase
- ✅ Auth pages (login, forgot password, reset password) + `/auth/callback`
- ✅ Dashboard, modules overview, module detail, exercise + submission, submission + feedback view, profile, playbook, admin
- ✅ Supabase schema + RLS policies (`supabase/schema.sql`)
- ✅ Live Supabase wiring — `src/lib/data.ts` reads/writes real tables
- ✅ Audio recording in submissions (`components/feature/AudioRecorder.tsx`)
- ✅ Resend transactional emails (welcome + feedback-ready)
- ✅ Stripe webhook — auto-provisions Supabase accounts after checkout
- ✅ AI feedback drafting (`src/lib/ai-feedback.ts`)

The codebase is feature-complete and builds clean (`pnpm build`). What
remains is operational, not code: provisioning the live Supabase project,
setting the production env vars, and Bettina supplying real content/photos.

## Local preview (no Supabase needed)

```bash
cd platform
pnpm install
pnpm dev
```

Then open http://localhost:3000. `NEXT_PUBLIC_USE_MOCK=true` is set in `.env.local` so the whole app runs against `src/lib/mock.ts`.

Use any (or no) credentials on the login page — Sign in just bounces to the dashboard in preview mode.

## Hooking up the real Supabase

When Bettina sends the Project URL + anon key:

1. Run `supabase/schema.sql`, `supabase/seed.sql`, the `content_v*.sql`
   files, `quiz_results.sql`, and `storage-policies.sql` in Supabase
   Dashboard → SQL Editor.
2. In Supabase Storage, create two private buckets:
   - `audio-submissions`
   - `playbooks`
3. Copy `.env.local.example` to `.env.local`, set:
   ```
   NEXT_PUBLIC_USE_MOCK=false
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ…
   ```
   See `.env.local.example` for the full list (service-role key, Stripe,
   Resend, Anthropic).
4. The live branches in `src/lib/data.ts` are already implemented — flip
   `NEXT_PUBLIC_USE_MOCK` to `false` and the app reads from Supabase.

## Tech stack

- **Framework**: Next.js 16 App Router
- **Styling**: Tailwind 4 (CSS-first theme via `@theme` in `globals.css`)
- **Fonts**: `next/font` with Cormorant Garamond + Inter
- **Auth + DB**: `@supabase/ssr` (browser + server clients)
- **Markdown**: `react-markdown` (for module content + feedback)
- **Icons**: `lucide-react`

## Directory layout

```
src/
├── app/
│   ├── (auth)/                ← public auth pages — own layout
│   │   ├── login/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── (app)/                 ← authenticated pages — top nav layout
│   │   ├── dashboard/
│   │   ├── modules/[slug]/
│   │   ├── exercises/[id]/
│   │   ├── submissions/[id]/
│   │   ├── playbook/
│   │   ├── profile/
│   │   └── admin/             ← students, submissions, pattern reports, playbooks
│   ├── api/stripe/webhook/    ← Stripe checkout → Supabase provisioning
│   ├── auth/callback/         ← Supabase auth code exchange (password reset)
│   ├── auth/sign-out/         ← POST handler for the sign-out form
│   ├── layout.tsx             ← root: html, fonts, base colors
│   └── page.tsx               ← redirects to /login
├── components/
│   ├── ui/                    ← Button, Card, Input, Badge, ProgressBar, Markdown
│   ├── feature/AudioRecorder.tsx
│   ├── brand/Logo.tsx
│   └── layout/TopNav.tsx
├── lib/
│   ├── env.ts                 ← centralised env reads
│   ├── types.ts               ← domain types
│   ├── mock.ts                ← demo data
│   ├── data.ts                ← data layer (mock ↔ live Supabase)
│   ├── actions.ts             ← server actions (submissions, feedback, admin)
│   ├── ai-feedback.ts         ← Claude-drafted feedback
│   ├── email.ts               ← Resend transactional email
│   ├── stripe.ts              ← Stripe client
│   ├── utils.ts               ← cn + date helpers
│   └── supabase/
│       ├── client.ts          ← browser client
│       ├── server.ts          ← server client (cookies)
│       └── admin.ts           ← service-role client (webhook only)
└── proxy.ts                   ← session refresh + route gating
```

## Deploy to Vercel

1. In Vercel: **Add New → Project → Import** the `getclientready` GitHub repo.
2. **Root directory**: `platform` (this folder, not the repo root — that one is the landing page).
3. **Framework preset**: Next.js (auto-detected).
4. **Environment variables**: copy from `.env.local.example` (set `NEXT_PUBLIC_USE_MOCK=true` for the first preview; flip to `false` once Supabase keys are in).
5. **Domain**: point `app.entropybreakers.com` at the Vercel project.
