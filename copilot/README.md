# Household Command Center

A production-ready web application for managing household daily life: chores, groceries, bills, and home maintenance.

## Features

- **Dashboard**: Overview of today's tasks, overdue tasks, and upcoming bills
- **Chore/Task System**: Create, edit, delete tasks with due dates and recurrence (daily, weekly, monthly)
- **Grocery List**: Add/remove items with categories, mark as purchased
- **Bill Tracker**: Track bills with amounts, due dates, recurring options, mark as paid
- **Home Maintenance Tracker**: Track maintenance tasks with last completed date and frequency
- **Search & Filtering**: Search across all data, filter by status
- **Data Persistence**: All data stored in SQLite database
- **Multi-User Support**: User registration and login with data scoped per user
- **Responsive UI**: Works on mobile and desktop
- **Import/Export**: Export all user data as JSON, import to restore

## Tech Stack

- **Frontend**: Next.js 15 (App Router)
- **Backend**: Next.js API routes
- **Database**: SQLite
- **ORM**: Prisma
- **Auth**: Local authentication (email + password)
- **Styling**: TailwindCSS
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ (installed via setup)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up the database (when Prisma is added):
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

- `app/`: Next.js App Router pages and layouts
- `prisma/`: Database schema and migrations
- `components/`: Reusable React components
- `lib/`: Utility functions and database client

## Development

- `npm run lint`: Run ESLint
- `npm run build`: Build for production
- `npm run start`: Start production server

## License

This project is for educational purposes.