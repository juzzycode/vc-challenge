# Household Command Center

A local-first household organizer for chores, groceries, bills, and home maintenance.

## Setup

1. Install Node.js 20 or newer.
2. Install dependencies:

```bash
npm install
```

3. Create the SQLite database:

```bash
npm run prisma:migrate -- --name init
```

## Run

```bash
npm run dev
```

Open http://localhost:3000, register a local account, and start adding household data.

## Included

- Email and password auth with local sessions.
- User-scoped chores/tasks with daily, weekly, and monthly recurrence.
- Grocery list with categories and purchased state.
- Bill tracker with monthly recurrence and paid/unpaid status.
- Home maintenance tracker based on last completed date and frequency in days.
- Dashboard for today, overdue tasks, upcoming bills, and due maintenance.
- Search across tasks, groceries, and bills with status filters.
- JSON export and account-level JSON import.
- SQLite persistence through Prisma.

## Assumptions

- Bill amounts are stored in cents and displayed as USD.
- Completing a recurring task or paying a recurring bill creates the next instance.
- Import replaces the signed-in user's household data while leaving their account and password intact.
