import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { TaskForm } from "@/components/Forms";
import { StatusPill } from "@/components/StatusPill";
import { completeTaskAction, deleteTaskAction } from "@/actions";
import { formatDisplayDate, startOfToday } from "@/lib/dates";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const user = await requireUser();
  const params = await searchParams;
  const today = startOfToday();
  const status = params.status ?? "active";

  const tasks = await prisma.task.findMany({
    where: { userId: user.id },
    orderBy: [{ completed: "asc" }, { dueDate: "asc" }]
  });

  const filtered = tasks.filter((task) => {
    if (status === "completed") return task.completed;
    if (status === "overdue") return !task.completed && task.dueDate < today;
    if (status === "all") return true;
    return !task.completed;
  });

  return (
    <AppShell>
      <PageHeader title="Tasks" subtitle="Chores, reminders, and recurring household work." />
      <section className="panel mb-5">
        <h2 className="mb-3 text-xl font-bold">Add task</h2>
        <TaskForm />
      </section>
      <FilterNav base="/tasks" active={status} options={["active", "overdue", "completed", "all"]} />
      <section className="mt-4 grid gap-3">
        {filtered.length ? (
          filtered.map((task) => (
            <article key={task.id} className="panel">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold">{task.name}</h2>
                    {task.completed ? <StatusPill tone="good">Completed</StatusPill> : task.dueDate < today ? <StatusPill tone="bad">Overdue</StatusPill> : <StatusPill tone="neutral">Open</StatusPill>}
                    {task.recurrence !== "NONE" ? <StatusPill tone="warn">{task.recurrence.toLowerCase()}</StatusPill> : null}
                  </div>
                  <p className="text-sm text-zinc-600">Due {formatDisplayDate(task.dueDate)}</p>
                  {task.description ? <p className="mt-2 text-zinc-700">{task.description}</p> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {!task.completed ? (
                    <form action={completeTaskAction}>
                      <input type="hidden" name="id" value={task.id} />
                      <button className="button-secondary" type="submit">
                        Complete
                      </button>
                    </form>
                  ) : null}
                  <form action={deleteTaskAction}>
                    <input type="hidden" name="id" value={task.id} />
                    <button className="button-danger" type="submit">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
              <details className="mt-4">
                <summary className="text-sm font-semibold text-teal-800">Edit task</summary>
                <div className="mt-3">
                  <TaskForm task={task} />
                </div>
              </details>
            </article>
          ))
        ) : (
          <EmptyState>No tasks match this filter.</EmptyState>
        )}
      </section>
    </AppShell>
  );
}

function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-zinc-900">{title}</h1>
      <p className="text-zinc-600">{subtitle}</p>
    </div>
  );
}

function FilterNav({ base, active, options }: { base: string; active: string; options: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <a key={option} href={`${base}?status=${option}`} className={option === active ? "button" : "button-secondary"}>
          {option}
        </a>
      ))}
    </div>
  );
}
