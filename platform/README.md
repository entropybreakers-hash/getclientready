# Get Client Ready — Student Platform

Next.js 16 (App Router) + Tailwind 4 + Supabase. Single-tenant student platform for the Get Client Ready 6-week programme. Brand parity with the landing page (Cormorant Garamond + Inter, beige `#C9A876` accent on a `#0F0F0F` dark background).

## Phase 1 status

- ✅ Project scaffold, brand palette, fonts wired
- ✅ Mock data layer — runs the whole UI without Supabase
- ✅ Auth pages (login, forgot password) — Supabase-ready
- ✅ Dashboard, modules overview, module detail, exercise + submission, submission + feedback view, profile, playbook, admin
- ✅ Supabase schema + RLS policies (`supabase/schema.sql`)
- ⏳ Live Supabase wiring — `data.ts` still throws in live mode (Phase 2)
- ⏳ Audio recording in submissions (Phase 2)
- ⏳ Resend transactional emails for welcome / reset (Phase 2)

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

1. Run `supabase/schema.sql` and `supabase/seed.sql` in Supabase Dashboard → SQL Editor.
2. In Supabase Storage, create two private buckets:
   - `audio-submissions`
   - `playbooks`
3. Copy `.env.local.example` to `.env.local`, set:
   ```
   NEXT_PUBLIC_USE_MOCK=false
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ…
   ```
4. Implement the live branches in `src/lib/data.ts` (currently they throw). The mock branches show the exact shape each function expects to return.

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
│   │   └── forgot-password/
│   ├── (app)/                 ← authenticated pages — top nav layout
│   │   ├── dashboard/
│   │   ├── modules/[slug]/
│   │   ├── exercises/[id]/
│   │   ├── submissions/[id]/
│   │   ├── playbook/
│   │   ├── profile/
│   │   └── admin/
│   ├── auth/sign-out/         ← POST handler for the sign-out form
│   ├── layout.tsx             ← root: html, fonts, base colors
│   └── page.tsx               ← redirects to /login
├── components/
│   ├── ui/                    ← Button, Card, Input, Badge, ProgressBar, Markdown
│   ├── brand/Logo.tsx
│   └── layout/TopNav.tsx
├── lib/
│   ├── env.ts                 ← centralised env reads
│   ├── types.ts               ← domain types
│   ├── mock.ts                ← demo data
│   ├── data.ts                ← data layer (mock today, Supabase tomorrow)
│   ├── utils.ts               ← cn + date helpers
│   └── supabase/
│       ├── client.ts          ← browser client
│       └── server.ts          ← server client (cookies)
└── middleware.ts              ← session refresh + route gating
```

## Deploy to Vercel

1. In Vercel: **Add New → Project → Import** the `getclientready` GitHub repo.
2. **Root directory**: `platform` (this folder, not the repo root — that one is the landing page).
3. **Framework preset**: Next.js (auto-detected).
4. **Environment variables**: copy from `.env.local.example` (set `NEXT_PUBLIC_USE_MOCK=true` for the first preview; flip to `false` once Supabase keys are in).
5. **Domain**: point `app.entropybreakers.com` at the Vercel project.
