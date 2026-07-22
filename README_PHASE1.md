# Total Insulation Hub — Phase 1

This is the first phase of the Hub build. It includes the project foundation,
login, mandatory 2FA for super admins, and a working Home dashboard connected
to live Supabase data.

## What's included in Phase 1

- Full project scaffold (Vite + React + TypeScript)
- Supabase client and shared types
- Login screen
- Two-factor authentication (TOTP) — setup flow with QR code and backup codes,
  plus verification on every login
- Home dashboard: live metrics (active tenders, WIP projects, pending
  variations, pipeline value), urgent items feed, and team status widget
- Bottom navigation shell (Onsite / Business / Crew / Team / More show a
  "coming soon" placeholder until their phase is built)
- Netlify deployment config

## What's NOT in Phase 1 (coming in later phases)

- Business module (Tenders, WIP, Variations, Documents) — Phase 2
- Chat / Messages (channels, communities) — Phase 3
- Crew module (Labour Allocation, Gantt, Schedule, Leave) — Phase 4
- Team module (Calendar, Tasks, Online Tracker detail view) — Phase 5
- More module, push notifications, OneDrive integration — Phase 6

## Setup steps

### 1. Run the database schema

In your Supabase project (tyzinzllfuufbqbkcutm), open the SQL editor and run,
in this order:

1. `supabase_schema.sql`
2. `supabase_schema_additions.sql`

### 2. Create the four super admin users

In Supabase Authentication, invite or create these four users (use their
existing emails):

- Jwallace@totalinsulation.com.au
- ntillman@totalinsulation.com.au
- Bwallace@totalinsulation.com.au
- mvega@totalinsulation.com.au

Then in the SQL editor, insert their profile rows (replace the UUIDs with the
actual `id` values Supabase generates for each user — you can find these in
Authentication > Users):

```sql
insert into public.users (id, email, full_name, state, role) values
  ('<jordan-uuid>', 'Jwallace@totalinsulation.com.au', 'Jordan Wallace', 'Office', 'super_admin'),
  ('<nelson-uuid>', 'ntillman@totalinsulation.com.au', 'Nelson Tillman', 'Office', 'super_admin'),
  ('<ben-uuid>', 'Bwallace@totalinsulation.com.au', 'Benjamin Wallace', 'Office', 'super_admin'),
  ('<margie-uuid>', 'mvega@totalinsulation.com.au', 'Margie Vega', 'Office', 'super_admin');
```

### 3. Install dependencies

```bash
cd total-insulation-hub
npm install
```

### 4. Set environment variables

Copy `.env.example` to `.env` and fill in your Supabase anon key (found in
Supabase project settings > API):

```bash
cp .env.example .env
```

### 5. Run locally

```bash
npm run dev
```

Visit `http://localhost:5173`. Log in with one of the four super admin
emails. You'll be prompted to set up 2FA on first login — scan the QR code
with Microsoft Authenticator, save the backup codes somewhere safe.

### 6. Deploy to Netlify

- Push this project to a GitHub repo
- In Netlify: "Add new site" > "Import an existing project" > connect the repo
- Build command: `npm run build`
- Publish directory: `dist`
- Add environment variables in Netlify site settings (same as your `.env`)
- Add custom domain: `hub.totalinsulation.com.au` (point the DNS record
  Netlify gives you at your domain provider)

## Notes on the 2FA flow

- Regular crew and admins are never prompted for 2FA — it only applies to
  super admins, matching what you asked for
- The TOTP secret is stored in the `user_2fa` table, protected by row level
  security so only the user themselves can read or write their own row
- Backup codes are generated once at setup and shown to the user a single
  time — make sure they're saved somewhere safe, they cannot be re-displayed
