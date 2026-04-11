You are building a production-ready, local-first web application called:

🏠 Household Command Center

This app is designed for a small household to manage daily life: chores, groceries, bills, and home maintenance.

--------------------------------------------------
OBJECTIVE
--------------------------------------------------

Build a fully functional, usable application — not a mockup or scaffold.

The app must:
- Run locally
- Persist data
- Be usable immediately by a non-technical user

--------------------------------------------------
REQUIRED TECH STACK
--------------------------------------------------

Use the following unless absolutely necessary to change:
- Frontend: Next.js (App Router preferred)
- Backend: Node.js (API routes or separate server)
- Database: SQLite (default) or PostgreSQL
- ORM: Prisma (preferred)
- Auth: Simple local auth (email + password, no OAuth)
- Styling: TailwindCSS

Do NOT leave placeholder code or TODOs for core features.

--------------------------------------------------
CORE FEATURES (REQUIRED)
--------------------------------------------------

1. Dashboard
- Shows:
  - Today’s tasks
  - Overdue tasks
  - Upcoming bills (next 7 days)
- Clean, readable layout

2. Chore / Task System
- Create, edit, delete tasks
- Fields:
  - Name
  - Description
  - Due date
  - Optional recurrence:
    - Daily
    - Weekly
    - Monthly
- Mark complete
- Handle recurrence correctly (generate next instance)

3. Grocery List
- Add/remove items
- Categories (produce, meat, dairy, etc.)
- Mark items as purchased
- Persist state between sessions

4. Bill Tracker
- Add bills:
  - Name
  - Amount
  - Due date
  - Recurring (monthly)
- Mark as paid
- Show overdue and upcoming clearly

5. Home Maintenance Tracker
- Track items like:
  - Air filter replacement
  - Smoke detector batteries
  - Oil changes
- Fields:
  - Task name
  - Last completed date
  - Frequency (in days)
- Show when next due

6. Search & Filtering
- Search across tasks, groceries, bills
- Filter by status (completed, overdue, etc.)

7. Data Persistence
- All data must persist via database
- No in-memory-only solutions

8. Basic Multi-User Support
- Users can register/login
- Data is scoped per user

9. Responsive UI
- Must work on mobile and desktop
- No broken layouts

10. Import / Export
- Export all user data as JSON
- Import JSON to restore data

--------------------------------------------------
CONSTRAINTS
--------------------------------------------------

- No external SaaS dependencies (must run locally)
- No skipping features due to complexity
- No fake/mock data for final output
- No partial implementations

--------------------------------------------------
EXPECTATIONS
--------------------------------------------------

You must:
- Design the database schema
- Implement backend + frontend
- Handle edge cases (overdue, recurrence, etc.)
- Validate inputs
- Handle errors gracefully
- Produce clean, readable code

--------------------------------------------------
EXECUTION RULES
--------------------------------------------------

- Work iteratively, but ensure the app is runnable early
- Prioritize working features over perfection
- Do NOT stop at scaffolding — complete features

--------------------------------------------------
DEFINITION OF DONE
--------------------------------------------------

The project is complete when:
- App runs locally without errors
- All features above are implemented
- Data persists after restart
- A user can realistically use it daily

--------------------------------------------------
OUTPUT FORMAT
--------------------------------------------------

Provide:
1. Setup instructions (clear and minimal)
2. How to run the app
3. Any assumptions made
4. What is fully complete vs partial (be honest)

--------------------------------------------------
EVALUATION NOTE (IMPORTANT)
--------------------------------------------------

This project is being used to compare multiple coding agents on:
- Completeness
- Accuracy
- Speed
- Code quality

Favor fully working implementations over explanations.

--------------------------------------------------
START
--------------------------------------------------

Begin by:
1. Designing the database schema
2. Setting up the project
3. Building a minimal working version quickly
4. Iterating to full feature completion