# Household Command Center — Setup

## Requirements
- Node.js (tested with v24)
- Located at `C:\nodejs\node-v24.14.1-win-x64\` on this machine, or add Node to PATH

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Push database schema (creates dev.db)
npx prisma db push

# 3. Start development server
npm run dev
```

Open http://localhost:3000 in your browser.

## Running in Production

```bash
npm run build
npm start
```

## How to Run (Windows, Node not in PATH)

```powershell
# From the claude/ directory:
$env:PATH = 'C:\nodejs\node-v24.14.1-win-x64;' + $env:PATH
npm install
npx prisma db push
npm run dev
```

## Features

- **Dashboard** — Today's tasks, overdue tasks, upcoming/overdue bills
- **Tasks** — Create/edit/delete tasks with recurrence (daily/weekly/monthly), filter by status
- **Groceries** — Add items by category, mark purchased, clear purchased items
- **Bills** — Track bills with amounts, mark paid, recurring bills auto-create next month
- **Maintenance** — Track home maintenance tasks with frequency, mark done today
- **Search** — Search across all data with live results
- **Import/Export** — Export all data as JSON, import from JSON backup
- **Auth** — Register/login with email + password, data scoped per user

## Database

SQLite database stored at `prisma/dev.db`. All data persists across restarts.

## Environment Variables (.env)

```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-here"
```

Change `JWT_SECRET` in production.
