import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { MaintenanceForm } from "@/components/Forms";
import { StatusPill } from "@/components/StatusPill";
import { completeMaintenanceAction, deleteMaintenanceAction } from "@/actions";
import { formatDisplayDate, maintenanceNextDue, startOfToday } from "@/lib/dates";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MaintenancePage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const user = await requireUser();
  const params = await searchParams;
  const status = params.status ?? "due";
  const today = startOfToday();
  const items = await prisma.maintenanceItem.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } });
  const withDue = items.map((item) => ({ item, nextDue: maintenanceNextDue(item.lastCompletedDate, item.frequencyDays) }));
  const filtered = withDue.filter(({ nextDue }) => (status === "all" ? true : nextDue <= today));

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-zinc-900">Home Maintenance</h1>
        <p className="text-zinc-600">Keep filters, alarms, vehicles, and household systems on schedule.</p>
      </div>
      <section className="panel mb-5">
        <h2 className="mb-3 text-xl font-bold">Add maintenance item</h2>
        <MaintenanceForm />
      </section>
      <div className="flex flex-wrap gap-2">
        {["due", "all"].map((option) => (
          <a key={option} href={`/maintenance?status=${option}`} className={option === status ? "button" : "button-secondary"}>
            {option}
          </a>
        ))}
      </div>
      <section className="mt-4 grid gap-3 md:grid-cols-2">
        {filtered.length ? (
          filtered.map(({ item, nextDue }) => (
            <article key={item.id} className="panel">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold">{item.name}</h2>
                    <StatusPill tone={nextDue <= today ? "bad" : "good"}>{nextDue <= today ? "Due" : "Scheduled"}</StatusPill>
                  </div>
                  <p className="text-sm text-zinc-600">Last done {formatDisplayDate(item.lastCompletedDate)}</p>
                  <p className="text-sm text-zinc-600">Next due {formatDisplayDate(nextDue)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <form action={completeMaintenanceAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <button className="button-secondary" type="submit">
                      Done today
                    </button>
                  </form>
                  <form action={deleteMaintenanceAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <button className="button-danger" type="submit">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
              <details className="mt-4">
                <summary className="text-sm font-semibold text-teal-800">Edit item</summary>
                <div className="mt-3">
                  <MaintenanceForm item={item} />
                </div>
              </details>
            </article>
          ))
        ) : (
          <EmptyState>No maintenance items match this filter.</EmptyState>
        )}
      </section>
    </AppShell>
  );
}
