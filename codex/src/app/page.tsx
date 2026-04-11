import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { StatusPill } from "@/components/StatusPill";
import { completeTaskAction, payBillAction } from "@/actions";
import { addDays, endOfToday, formatDisplayDate, formatMoney, maintenanceNextDue, startOfToday } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireUser();
  const todayStart = startOfToday();
  const todayEnd = endOfToday();
  const nextWeek = addDays(todayStart, 7);

  const [todayTasks, overdueTasks, upcomingBills, maintenance] = await Promise.all([
    prisma.task.findMany({ where: { userId: user.id, completed: false, dueDate: { gte: todayStart, lte: todayEnd } }, orderBy: { dueDate: "asc" } }),
    prisma.task.findMany({ where: { userId: user.id, completed: false, dueDate: { lt: todayStart } }, orderBy: { dueDate: "asc" } }),
    prisma.bill.findMany({ where: { userId: user.id, paid: false, dueDate: { gte: todayStart, lte: nextWeek } }, orderBy: { dueDate: "asc" } }),
    prisma.maintenanceItem.findMany({ where: { userId: user.id } })
  ]);

  const dueMaintenance = maintenance
    .map((item) => ({ item, nextDue: maintenanceNextDue(item.lastCompletedDate, item.frequencyDays) }))
    .filter(({ nextDue }) => nextDue <= todayEnd)
    .sort((a, b) => a.nextDue.getTime() - b.nextDue.getTime());

  return (
    <AppShell>
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-zinc-900">Today</h1>
        <p className="text-zinc-600">The chores, bills, and upkeep that need attention now.</p>
      </div>
      <section className="grid gap-4 lg:grid-cols-3">
        <DashboardPanel title="Today's Tasks" href="/tasks">
          {todayTasks.length ? (
            todayTasks.map((task) => (
              <div key={task.id} className="border-b border-zinc-100 py-3 last:border-0">
                <p className="font-semibold">{task.name}</p>
                {task.description ? <p className="text-sm text-zinc-600">{task.description}</p> : null}
                <form action={completeTaskAction} className="mt-2">
                  <input type="hidden" name="id" value={task.id} />
                  <button className="button-secondary" type="submit">
                    Mark complete
                  </button>
                </form>
              </div>
            ))
          ) : (
            <EmptyState>No tasks due today.</EmptyState>
          )}
        </DashboardPanel>

        <DashboardPanel title="Overdue Tasks" href="/tasks?status=overdue">
          {overdueTasks.length ? (
            overdueTasks.map((task) => (
              <div key={task.id} className="border-b border-zinc-100 py-3 last:border-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{task.name}</p>
                  <StatusPill tone="bad">Due {formatDisplayDate(task.dueDate)}</StatusPill>
                </div>
                <form action={completeTaskAction} className="mt-2">
                  <input type="hidden" name="id" value={task.id} />
                  <button className="button-secondary" type="submit">
                    Mark complete
                  </button>
                </form>
              </div>
            ))
          ) : (
            <EmptyState>No overdue tasks.</EmptyState>
          )}
        </DashboardPanel>

        <DashboardPanel title="Upcoming Bills" href="/bills">
          {upcomingBills.length ? (
            upcomingBills.map((bill) => (
              <div key={bill.id} className="border-b border-zinc-100 py-3 last:border-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{bill.name}</p>
                  <span className="font-bold">{formatMoney(bill.amountCents)}</span>
                </div>
                <p className="text-sm text-zinc-600">Due {formatDisplayDate(bill.dueDate)}</p>
                <form action={payBillAction} className="mt-2">
                  <input type="hidden" name="id" value={bill.id} />
                  <button className="button-secondary" type="submit">
                    Mark paid
                  </button>
                </form>
              </div>
            ))
          ) : (
            <EmptyState>No bills due in the next 7 days.</EmptyState>
          )}
        </DashboardPanel>
      </section>

      <section className="mt-4 panel">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-bold">Maintenance Due</h2>
          <Link className="text-sm font-semibold text-teal-800" href="/maintenance">
            Open maintenance
          </Link>
        </div>
        {dueMaintenance.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {dueMaintenance.map(({ item, nextDue }) => (
              <div key={item.id} className="rounded-md border border-zinc-200 p-3">
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-zinc-600">Next due {formatDisplayDate(nextDue)}</p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState>No maintenance items are due.</EmptyState>
        )}
      </section>
    </AppShell>
  );
}

function DashboardPanel({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <section className="panel">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-xl font-bold">{title}</h2>
        <Link className="text-sm font-semibold text-teal-800" href={href}>
          View
        </Link>
      </div>
      {children}
    </section>
  );
}
