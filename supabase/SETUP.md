# Supabase Setup — Samsmarana

Samsmarana is built to run on **Supabase** (PostgreSQL + Auth + Row Level Security).
The local demo in this repository uses **Prisma + SQLite** so it runs without any
external account, but the production schema, RLS policies and seed data are all
provided as SQL so the project owner can deploy to Supabase and inspect the
database directly.

---

## 1. Create a Supabase project

1. Sign in at **https://supabase.com** with your own account.
2. Click **New project** → choose an organisation, name it `samsmarana`, set a
   strong database password, pick a region close to your users, and click
   **Create new project**.
3. Wait ~2 minutes for provisioning to finish.

> The project owner accesses **everything** below through their own Supabase
> dashboard. No hidden accounts or service-role credentials are shared in this
> repository.

---

## 2. Find your Project URL and anon/public key

In the Supabase dashboard open **Project Settings** (gear icon) → **API**:

- **Project URL** — e.g. `https://abcdefgh.supabase.co`
- **anon (public) key** — a long `eyJ...` string. This is safe to expose to the
  browser.
- **service_role key** — **NEVER** put this in frontend code or commit it. Keep
  it only on your machine / server.

Add them to your local `.env.local` (gitignored):

```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key...   # server only
```

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are the only
keys the browser ever sees. The service-role key is used **only** in server
code / migrations.

---

## 3. Run the SQL migrations

Open **SQL Editor** (left sidebar) → **New query**.

1. Paste the contents of [`supabase/migrations/0001_init.sql`](./migrations/0001_init.sql)
   and click **Run**. This creates all tables, indexes, RLS policies and triggers.
2. Open a **New query**, paste [`supabase/seed.sql`](./seed.sql) and click
   **Run**. This creates the two demo profiles (Lakshmi — Karnataka/Kannada,
   Anima — Assam/NER/English), family messages, reminders and sample attempts.

---

## 4. View the tables

Open **Table Editor** (left sidebar). You will see:

| Table | Purpose |
|-------|---------|
| `profiles` | Elder / caregiver / family profiles |
| `activity_attempts` | Activity results (synced from offline-first IndexedDB) |
| `video_generations` | AI video generation records (Coming Soon feature) |
| `reminders` | Non-medical supportive reminders |
| `family_messages` | Family engagement messages, voice notes, photos |
| `caregiver_relationships` | Links caregivers to elders |

You can browse and edit rows directly here.

---

## 5. View Auth users

Open **Authentication** (left sidebar) → **Users**. Every elder/caregiver who
signs up through Supabase Auth appears here. The `profiles.user_id` column
references `auth.users.id`, so each profile is owned by exactly one auth user.

To create a test user: **Authentication → Users → Add user** (email + password),
then sign in through the app.

---

## 6. Inspect Row Level Security (RLS)

Open **Authentication → Policies** (or **Table Editor → click a table → RLS**).

You will see the policies created by the migration, for example:

- `profiles self read` — a user can read their own profile.
- `attempts owner all` — a user can fully manage attempts for their own profile.
- `caregiver reads elder attempts` — a caregiver can read (not write) the
  attempts of elders linked to them via `caregiver_relationships`.

RLS is **enabled** on every table, so even the anon key cannot read another
user's data.

---

## 7. How offline-first sync works with Supabase

1. The elder completes an activity (online or offline).
2. The result is saved locally in **IndexedDB** with `sync_state = pending`.
3. When connectivity returns, the sync queue POSTs each pending record to the
   backend. Because each record carries a unique `sync_id`, retries are
   **idempotent** — no duplicate rows.
4. The record is marked `sync_state = synced` locally and in Supabase.
5. The caregiver dashboard reads the synced records (authorized by RLS).

The UI shows: `Offline` → `Syncing…` → `Synced`.

---

## 8. Connecting the local app to Supabase

The local demo runs on Prisma/SQLite out of the box. To point it at Supabase
instead, install `@supabase/supabase-js` and replace the Prisma calls in
`src/app/api/*` with Supabase client calls using the env vars above. The schema
in `prisma/schema.prisma` and `supabase/migrations/0001_init.sql` are kept in
sync so either backend works with the same application code.

---

## 9. Security reminders

- **Never** commit `.env.local` (it is gitignored).
- **Never** put `SUPABASE_SERVICE_ROLE_KEY` in client code.
- **Never** expose the Gemini API key (`GEMINI_API_KEY`) in the browser.
- RLS is the source of truth for authorization — always go through it.

---

## 10. Demo profiles (also created by `seed.sql`)

| Name | Age | Region | Language | Interests |
|------|-----|--------|----------|-----------|
| Lakshmi | 72 | Karnataka (South India) | Kannada | Gardening, Cooking, Music |
| Anima | 70 | Assam (North Eastern Region) | English | Gardening, Stories, Music |

The Assam profile is especially important for demonstrating the NER requirement.
