import { importDataAction } from "@/actions";
import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ImportExportPage({ searchParams }: { searchParams: Promise<{ imported?: string }> }) {
  const user = await requireUser();
  const params = await searchParams;
  const [tasks, groceries, bills, maintenance] = await Promise.all([
    prisma.task.findMany({ where: { userId: user.id }, orderBy: { dueDate: "asc" } }),
    prisma.groceryItem.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
    prisma.bill.findMany({ where: { userId: user.id }, orderBy: { dueDate: "asc" } }),
    prisma.maintenanceItem.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } })
  ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    tasks: tasks.map((task) => ({
      name: task.name,
      description: task.description,
      dueDate: task.dueDate,
      recurrence: task.recurrence,
      completed: task.completed,
      completedAt: task.completedAt
    })),
    groceries: groceries.map((item) => ({
      name: item.name,
      category: item.category,
      purchased: item.purchased,
      purchasedAt: item.purchasedAt
    })),
    bills: bills.map((bill) => ({
      name: bill.name,
      amountCents: bill.amountCents,
      dueDate: bill.dueDate,
      recurring: bill.recurring,
      paid: bill.paid,
      paidAt: bill.paidAt
    })),
    maintenance: maintenance.map((item) => ({
      name: item.name,
      lastCompletedDate: item.lastCompletedDate,
      frequencyDays: item.frequencyDays
    }))
  };

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-zinc-900">Import and Export</h1>
        <p className="text-zinc-600">Back up this account or restore it from JSON.</p>
      </div>
      {params.imported ? <p className="mb-4 rounded-md bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">Import complete.</p> : null}
      <section className="grid gap-5 lg:grid-cols-2">
        <div className="panel">
          <h2 className="mb-3 text-xl font-bold">Export</h2>
          <p className="mb-3 text-sm text-zinc-600">Download a JSON backup or copy the current account data.</p>
          <a className="button mb-4" href="/api/export">
            Download JSON
          </a>
          <pre className="max-h-96 overflow-auto rounded-md bg-zinc-950 p-3 text-xs text-zinc-50">{JSON.stringify(exportData, null, 2)}</pre>
        </div>
        <div className="panel">
          <h2 className="mb-3 text-xl font-bold">Import</h2>
          <p className="mb-3 text-sm text-zinc-600">Import replaces this account's tasks, groceries, bills, and maintenance items.</p>
          <form action={importDataAction} className="grid gap-3">
            <label className="grid gap-1">
              <span className="label">JSON data</span>
              <textarea className="field min-h-96 font-mono text-xs" name="json" required />
            </label>
            <button className="button-danger" type="submit">
              Replace with import
            </button>
          </form>
        </div>
      </section>
    </AppShell>
  );
}
