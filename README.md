# Grocery Tracker

A simple, mobile-first family grocery shopping tracker. Built with Next.js 16 App Router, TypeScript, Tailwind CSS, and Vercel Postgres.

## Features

- **Shopping List** — add items, mark as bought, delete
- **Shopping Trips** — save trip with store name, total cost, and notes; bought items are attached automatically
- **Trip History** — browse all past trips with cost and date
- **Analytics** — monthly spending totals, trip count, and average cost per trip

## Local Development

### 1. Clone and install

```bash
git clone <your-repo-url>
cd food-tracker
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Fill in the Postgres connection strings (see **Connect Postgres** below).

### 3. Run database migrations

```bash
npm run db:migrate
```

Or paste `scripts/setup-db.sql` into the Vercel Postgres Query console.

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploy to Vercel

### 1. Push to GitHub

```bash
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the GitHub repository
3. Vercel auto-detects Next.js — click **Deploy**

### 3. Connect Postgres

1. In your Vercel project, go to **Storage → Connect Store → Create new → Postgres**
2. After creation, open the database → **.env.local tab** → copy the connection strings
3. Add them to your project's **Environment Variables** in Vercel Settings
4. Re-deploy (or push a new commit)

### 4. Run migrations

Paste and run `scripts/setup-db.sql` in the Vercel Postgres Query console.

---

## Environment Variables

| Variable | Description |
|---|---|
| `POSTGRES_URL` | Pooled connection URL (used by the app) |
| `POSTGRES_PRISMA_URL` | Prisma-compatible URL with PgBouncer params |
| `POSTGRES_URL_NON_POOLING` | Direct connection (for migrations) |
| `POSTGRES_USER` | Database user |
| `POSTGRES_HOST` | Database host |
| `POSTGRES_PASSWORD` | Database password |
| `POSTGRES_DATABASE` | Database name |

Vercel provides all of these automatically when you link a Postgres store to your project.

---

## Database Schema

```sql
items      (id, name, quantity, status, created_at)
trips      (id, store_name, total_cost, notes, created_at)
trip_items (id, trip_id, item_name, quantity)
```

Full DDL with indexes is in `scripts/setup-db.sql`.

---

## UX Flow

1. Open app → see shopping list
2. Add items quickly (name + optional quantity)
3. Tap items in-store to mark as bought (green checkmark)
4. Tap **End trip** → enter store name + total cost → save
5. View history in **Trips** tab; monthly totals in **Analytics** tab
