# Choreo

A small, shared household chore tracker. Rooms, tasks with frequencies (daily / weekly / monthly / quarterly), per-person assignment, mark-complete, and a Today dashboard that shows what's overdue, due today, and due this week.

Built as a PWA — opens in the browser, installs to the home screen on iOS and Android, runs full-screen.

## Stack

- **Next.js 14** (App Router, Server Components + Server Actions) + TypeScript
- **Supabase** — Postgres database, Row Level Security, magic-link email auth
- **Tailwind CSS**
- **Vercel** for hosting (free tier)

No client-side state library, no API routes — every mutation is a Server Action that writes through Supabase using the logged-in user's session.

## Repository layout

```
choreo/
├── public/                          PWA icons + manifest
├── supabase/
│   └── schema.sql                   Run this once in your Supabase project
└── src/
    ├── app/
    │   ├── (app)/                   Authenticated routes (dashboard, rooms, members, settings)
    │   │   ├── _actions.ts          All server actions (CRUD + complete + seed)
    │   │   ├── layout.tsx           Ensures a household exists; renders nav
    │   │   ├── dashboard/page.tsx   Today / This week buckets
    │   │   ├── rooms/page.tsx       Rooms list + add
    │   │   ├── rooms/[roomId]/      Room detail with tasks
    │   │   ├── members/page.tsx     People (assignees)
    │   │   └── settings/page.tsx    Household name, sign out
    │   ├── auth/
    │   │   ├── callback/route.ts    Magic-link exchange
    │   │   └── signout/route.ts
    │   ├── login/                   Email-magic-link form
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx                 Redirects to /dashboard or /login
    ├── components/                  Nav, TaskRow, PageHeader, Empty, etc.
    ├── lib/
    │   ├── supabase/{server,client,middleware}.ts
    │   ├── household.ts             Auto-creates a household on first sign-in
    │   ├── queries.ts               Reads tasks + completions for a household
    │   ├── schedule.ts              next-due-at + bucket logic
    │   ├── seed.ts                  Sitting Room / Kitchen / Bathroom starter
    │   └── types.ts
    └── middleware.ts                Refreshes Supabase session on every request
```

## One-time setup

You need three accounts (all free):

1. **GitHub** — to host the repo
2. **Supabase** — Postgres + auth (https://supabase.com)
3. **Vercel** — hosting (https://vercel.com)

### 1. Create the Supabase project

1. Sign in at https://supabase.com and create a new project. Pick the region closest to you. Set a strong database password (you don't need to remember it for the app, but save it somewhere).
2. Wait ~1 minute for the project to provision.
3. Go to **SQL Editor → New query**, paste the entire contents of `supabase/schema.sql`, and click **Run**. This creates the tables, the `is_household_member` helper, and all the RLS policies. The script is re-runnable — you can run it again to reset the schema during development.
4. Go to **Authentication → Providers → Email**. Make sure **Email** is enabled. Toggle off **Confirm email** if you'd like the magic link to sign you in immediately on first use.
5. Go to **Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Run it locally

```bash
git clone <your-fork-url> choreo
cd choreo
cp .env.local.example .env.local
# Fill in the two NEXT_PUBLIC_SUPABASE_* values from Supabase → Settings → API.
npm install
npm run dev
```

Open http://localhost:3000, enter your email, click the magic link in your inbox, and you should land on the dashboard.

The first time you sign in, a new household is created automatically and you're added to it. Hit **Rooms → Use sample tasks** to load the Sitting Room / Kitchen / Bathroom starter (lifted from your sister-in-law's spec).

### 3. Deploy to Vercel

1. Push the repo to GitHub.
2. Go to https://vercel.com/new and import the repo. Accept the default Next.js settings.
3. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` — set this to the URL Vercel assigns you (e.g. `https://choreo-xyz.vercel.app`)
4. Deploy. After it's live, copy the deployed URL.
5. Back in Supabase, go to **Authentication → URL Configuration** and add the Vercel URL to **Site URL** and to **Redirect URLs** (e.g. `https://choreo-xyz.vercel.app/**`). Without this, magic-link emails will keep redirecting to localhost.

### 4. Install on her phone

On iPhone, open the URL in Safari → Share → **Add to Home Screen**. On Android in Chrome, open the URL → menu → **Install app**. It runs full-screen with the Choreo icon.

## Day-to-day

- **Adding a person**: People → fill the form. Anyone listed can be assigned tasks, even kids without their own login.
- **Adding another adult login**: have them open the app on their phone, sign in with their email, and you'll get a separate household by default. Inviting another user *into* the same household is not yet a UI feature — for now, run this in Supabase SQL editor:

  ```sql
  insert into household_members (household_id, user_id, role)
  values (
    (select id from households where owner_id = auth.uid() limit 1),
    (select id from auth.users where email = 'them@example.com'),
    'member'
  );
  ```

  Then have them refresh and they'll see your household.
- **Resetting their data**: easiest path is to delete and re-create the household row in Supabase; cascade deletes will clean up everything else.

## What's intentionally not in v1

These are punted to v1.1+ to keep the scope honest:

- Push / email reminders (V1 is in-app only — open the app, see what's due)
- Photos and visual reference library
- Step-by-step instructional content beyond the per-task notes field
- Dish rotation & laundry rotation as first-class features (model them as tasks for now)
- Gamification, analytics, smart-home integrations
- Multi-household invites in the UI (workaround above)

## Common issues

- **"Magic link works locally but not in production"** — you forgot to set `NEXT_PUBLIC_SITE_URL` on Vercel, or you didn't add the Vercel URL to Supabase's redirect allow-list.
- **"I see a row but can't update it"** — RLS is doing its job. The user must be a member of that row's household. Check `household_members`.
- **"Build fails on Vercel with a Tailwind error"** — make sure you didn't accidentally commit `.next/` or remove `tailwind.config.ts`.

## Scripts

```bash
npm run dev      # local dev server
npm run lint     # ESLint
npm run build    # production build (run before pushing if you want to be safe)
```
