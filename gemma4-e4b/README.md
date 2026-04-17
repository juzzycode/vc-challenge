# 🏠 Household Command Center

A production-ready, local-first web application designed to serve as a central hub for managing daily household life (chores, groceries, bills, maintenance).

## ✨ Current Status & Progress

The project is currently running successfully via the development server.

**🚀 Running Locally:**
*   **URL:** `http://localhost:3002`
*   **Command:** `npm run dev`

**✅ Prompt Evaluation Complete:**
The core requirements document (`prompt.md`) has been significantly enhanced to guide implementation agents more effectively. Key additions include:
*   **User Stories/Use Cases**: Providing context for *why* features are needed (e.g., "As a busy parent...").
*   **API Contracts**: Defining the expected REST endpoints, methods, and payload structures for all major modules (`/tasks`, `/groceries`, `/bills`, etc.).

## 🚧 Pending Implementation Tasks (Definition of Done)

While the requirements are fully defined, the implementation is not yet complete. The following features must be built out to meet the Definition of Done:
*   **Dashboard**: Fully functional display of today's tasks, overdue items, and upcoming bills.
*   **Chore / Task System**: Full CRUD functionality with correct recurrence handling (Daily/Weekly/Monthly).
*   **Grocery List**: Full CRUD with category filtering and purchase marking.
*   **Bill Tracker**: Full CRUD with clear status visualization (Overdue/Upcoming).
*   **Home Maintenance Tracker**: Logic to calculate and display the next due date based on frequency.
*   **Search & Filtering**: Global search across all data types, plus granular filtering options.
*   **Data Persistence**: All features must successfully read from and write to SQLite via Prisma.
*   **Basic Multi-User Support**: Full registration/login flow with user-scoped data isolation.
*   **Responsive UI**: Verified layout integrity on both mobile and desktop views.
*   **Import / Export**: Functional JSON import/export for full dataset restoration.

## ⚙️ Setup & Running Instructions

1.  **Clone Repository:** (Assuming this is done)
2.  **Install Dependencies:** Run `npm install` in the root directory.
3.  **Set up Database:** Run `npx prisma migrate dev --name initial_schema` to create the database and run migrations.
4.  **Seed Data (Optional):** Run `npx prisma db seed` to populate initial data.
5.  **Start Server:** Run `npm run dev`.

## 💡 Key Assumptions Made During Prompt Reevaluation
*   The application will use **Next.js App Router**.
*   Database interactions will be handled via **Prisma ORM** against a local **SQLite** file (`prisma/dev.db`).
*   Authentication will rely on simple email/password registration and session management.

---
*(Note: The original README mentioned an issue with the Cline extension, which has been resolved by using this comprehensive prompt structure.)*