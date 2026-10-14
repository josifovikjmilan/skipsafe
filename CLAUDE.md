## Grading contract — EdTech Challenge (never remove or break this)
An automated bot grades this app on its public Vercel URL, acting like a stranger.

### Pages
- `/` public landing page (no login needed): what the app does, who it is for, and one button to sign up.
- `/signup` sign-up with email + password. `/login` login with email + password.
- `/app` the main feature, only for logged-in users.
- After sign-up and after login, send the user to `/app`.
- No email confirmation, no CAPTCHA, no "Google only" login, no mandatory onboarding before `/app`.

### data-testid attributes (exact names, do not translate)
- Sign-up form: `signup-email`, `signup-password`, `signup-submit`
- Login form: `login-email`, `login-password`, `login-submit`
- `logout`: the logout button, visible on every page of a logged-in user
- On `/app`:
  - `core-input`: a TEXT field of the main feature (type="text" or a textarea, e.g. the title or description, never a number or date picker). The bot types a short text like "QA-7F3K2A grading bot test"
  - `core-submit`: the button that saves it
  - `core-item`: EVERY saved item in the list, showing the text typed in `core-input`
- Typing only in `core-input` and clicking `core-submit` must save a new item. Any other field needs a valid default value.

### Data and security
- Use Supabase Auth (email + password) and save all data in Supabase tables, never only in the browser (no localStorage for user data).
- Row Level Security ON for every table, with policies based on `auth.uid()`. Nobody can read anything without logging in.
- Only the Supabase URL and the publishable (anon) key may reach the browser. Never put the secret/service_role key or any AI API key in the frontend or in GitHub.
- Keep keys in `.env.local` (listed in `.gitignore`) and in Vercel environment variables.

## Project notes: SkipSafe

One-liner: SkipSafe helps IE bachelor students track absences per course so they never fail a course on attendance.
Data: private. Each user only sees their own courses.

- Stack: Next.js 16 (App Router, client components), Supabase Auth + Postgres via `@supabase/ssr` (session in cookies), plain CSS in `app/globals.css`.
- Main feature: add a course (`core-input` = course name, sessions default 30), then log absences with "I missed a class" and "Undo".
- Rule logic lives in `lib/budget.ts`: IE bachelor policy 2026/27, attendance below 80% fails the ordinary and extraordinary call, so allowed absences = floor(sessions / 5). Source: https://docs.ie.edu/documents/Attendance_Policy_Bachelor_Programs.pdf
- Database: one table, `public.courses`, created by `supabase/schema.sql` (RLS on, owner only policies, no access for `anon`).
- Never redirect logged in users away from `/signup` or `/login`: the bot may sign up a second user from the same browser.
- Writing style for visible copy: plain sentences, no dashes.
