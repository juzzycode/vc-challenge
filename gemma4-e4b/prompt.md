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

--- USER STORIES / USE CASES ---

As a busy parent, I want to see all overdue tasks on the dashboard so I know what needs attention first thing in the morning.
As a household manager, I want to easily add recurring chores (e.g., 'Take out trash' weekly) so that maintenance is automated.
As a shopper, I want to filter groceries by category (Produce/Meat) so I can quickly find what I need while at the store.

As a busy parent, I want to see all overdue tasks on the dashboard so I know what needs attention first thing in the morning.
As a household manager, I want to easily add recurring chores (e.g., 'Take out trash' weekly) so that maintenance is automated.
As a shopper, I want to filter groceries by category (Produce/Meat) so I can quickly find what I need while at the store.

--- API CONTRACTS (REST Endpoints) ---

// Base URL: /api/v1

// 1. Tasks (/tasks)
// GET /tasks: List all tasks (supports query params for filtering/status)
// POST /tasks: Create new task {name, description, dueDate, recurrenceType}
// PUT /tasks/[id]: Update task details
// DELETE /tasks/[id]: Delete task
// PATCH /tasks/[id]/complete: Mark as complete

// 2. Groceries (/groceries)
// GET /groceries: List all items (supports query params for category/purchased status)
// POST /groceries: Add new item {name, category}
// PUT /groceries/[id]: Update item details (e.g., change name)
// PATCH /groceries/[id]/purchase: Mark as purchased

// 3. Bills (/bills)
// GET /bills: List all bills (supports query params for status/upcoming range)
// POST /bills: Create new bill {name, amount, dueDate, isRecurring}
// PUT /bills/[id]: Update bill details
// PATCH /bills/[id]/paid: Mark as paid

// 4. Maintenance (/maintenance)
// GET /maintenance: List all maintenance items (supports query params for status/nextDue)
// POST /maintenance: Create new item {name, lastCompletedDate, frequencyDays}
// PUT /maintenance/[id]: Update item details
// PATCH /maintenance/[id]/complete: Mark as completed

// 5. Users (/users) - For Auth & Scoping
// GET /users/me: Get current user profile
// POST /auth/register: Register new user {email, password}
// POST /auth/login: Authenticate user {email, password}