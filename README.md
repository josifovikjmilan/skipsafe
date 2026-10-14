# SkipSafe

SkipSafe helps IE bachelor students track absences per course so they never fail a course on attendance.

Under the IE University bachelor attendance policy for 2026/27, attendance below 80% of a course gives a 0.0 in both the ordinary and the extraordinary call. A 30 session course allows 6 absences and a 15 session course allows 3. SkipSafe keeps that count for every course in one place.

## What a user does

1. Signs up with email and password.
2. Adds each course with its number of sessions (30 by default).
3. Taps "I missed a class" after each absence and sees how many are left, with a warning at the limit and when attendance drops below 80%.

Each user only sees their own courses.

## Stack

- Next.js 16 (App Router)
- Supabase Auth (email and password) and Postgres with Row Level Security
- Deployed on Vercel

## Run it locally

1. `npm install`
2. Copy `.env.example` to `.env.local` and add your Supabase Project URL and publishable key.
3. In Supabase, open SQL Editor, New query, paste `supabase/schema.sql` and click Run.
4. In Supabase, Authentication, Sign In / Providers, Email: turn "Confirm email" off.
5. `npm run dev` and open http://localhost:3000

## Security

- All data is stored in the `public.courses` table. Row Level Security is on, and every policy checks `auth.uid() = user_id`.
- Logged out visitors have no access to the table.
- Only the Supabase URL and the publishable key reach the browser. Keys live in `.env.local` (ignored by git) and in Vercel environment variables.

Not an official IE University tool.
