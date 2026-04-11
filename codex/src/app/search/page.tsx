import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { StatusPill } from "@/components/StatusPill";
import { formatDisplayDate, formatMoney, startOfToday } from "@/lib/dates";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Result = {
  id: string;
  type: "Task" | "Grocery" | "Bill";
  title: string;
  detail: string;
  status: string;
  href: string;
  overdue?: boolean;
  complete?: boolean;
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const user = await requireUser();
  const params = await searchParams;
  const q = (params.q ?? "").trim().toLowerCase();
  const status = params.status ?? "all";
  const today = startOfToday();

  const [tasks, groceries, bills] = await Promise.all([
    prisma.task.findMany({ where: { userId: user.id }, orderBy: { dueDate: "asc" } }),
    prisma.groceryItem.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.bill.findMany({ where: { userId: user.id }, orderBy: { dueDate: "asc" } })
  ]);

  const results: Result[] = [
    ...tasks.map((task) => ({
      id: task.id,
      type: "Task" as const,
      title: task.name,
      detail: `${task.description ?? ""} Due ${formatDisplayDate(task.dueDate)}`,
      status: task.completed ? "completed" : task.dueDate < today ? "overdue" : "active",
      complete: task.completed,
      overdue: !task.completed && task.dueDate < today,
      href: "/tasks"
    })),
    ...groceries.map((item) => ({
      id: item.id,
      type: "Grocery" as const,
      title: item.name,
      detail: item.category.toLowerCase(),
      status: item.purchased ? "purchased" : "needed",
      complete: item.purchased,
      href: "/groceries"
    })),
    ...bills.map((bill) => ({
      id: bill.id,
      type: "Bill" as const,
      title: bill.name,
      detail: `${formatMoney(bill.amountCents)} due ${formatDisplayDate(bill.dueDate)}`,
      status: bill.paid ? "paid" : bill.dueDate < today ? "overdue" : "unpaid",
      complete: bill.paid,
      overdue: !bill.paid && bill.dueDate < today,
      href: "/bills"
    }))
  ];

  const filtered = results.filter((result) => {
    const matchesText = q.length === 0 || `${result.title} ${result.detail} ${result.type}`.toLowerCase().includes(q);
    const matchesStatus =
      status === "all" ||
      result.status === status ||
      (status === "completed" && result.complete) ||
      (status === "open" && !result.complete) ||
      (status === "overdue" && result.overdue);
    return matchesText && matchesStatus;
  });

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-zinc-900">Search</h1>
        <p className="text-zinc-600">Find chores, groceries, and bills in one place.</p>
      </div>
      <form className="panel grid gap-3 md:grid-cols-[1fr_220px_auto]">
        <label className="grid gap-1">
          <span className="label">Search text</span>
          <input className="field" name="q" defaultValue={params.q ?? ""} placeholder="air filter, milk, rent" />
        </label>
        <label className="grid gap-1">
          <span className="label">Status</span>
          <select className="field" name="status" defaultValue={status}>
            {["all", "open", "completed", "overdue", "needed", "purchased", "unpaid", "paid"].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <button className="button" type="submit">
            Search
          </button>
        </div>
      </form>

      <section className="mt-5 grid gap-3">
        {filtered.length ? (
          filtered.map((result) => (
            <article key={`${result.type}-${result.id}`} className="panel">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold">{result.title}</h2>
                    <StatusPill tone={result.overdue ? "bad" : result.complete ? "good" : "neutral"}>{result.status}</StatusPill>
                    <StatusPill tone="warn">{result.type}</StatusPill>
                  </div>
                  <p className="text-sm text-zinc-600">{result.detail}</p>
                </div>
                <Link className="button-secondary" href={result.href}>
                  Open
                </Link>
              </div>
            </article>
          ))
        ) : (
          <EmptyState>No matching records.</EmptyState>
        )}
      </section>
    </AppShell>
  );
}
