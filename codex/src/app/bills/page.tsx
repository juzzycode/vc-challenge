import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { BillForm } from "@/components/Forms";
import { StatusPill } from "@/components/StatusPill";
import { deleteBillAction, payBillAction } from "@/actions";
import { formatDisplayDate, formatMoney, startOfToday } from "@/lib/dates";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function BillsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const user = await requireUser();
  const params = await searchParams;
  const status = params.status ?? "unpaid";
  const today = startOfToday();
  const bills = await prisma.bill.findMany({ where: { userId: user.id }, orderBy: [{ paid: "asc" }, { dueDate: "asc" }] });
  const filtered = bills.filter((bill) => {
    if (status === "paid") return bill.paid;
    if (status === "overdue") return !bill.paid && bill.dueDate < today;
    if (status === "all") return true;
    return !bill.paid;
  });

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-zinc-900">Bills</h1>
        <p className="text-zinc-600">Track due dates, monthly bills, and payment status.</p>
      </div>
      <section className="panel mb-5">
        <h2 className="mb-3 text-xl font-bold">Add bill</h2>
        <BillForm />
      </section>
      <div className="flex flex-wrap gap-2">
        {["unpaid", "overdue", "paid", "all"].map((option) => (
          <a key={option} href={`/bills?status=${option}`} className={option === status ? "button" : "button-secondary"}>
            {option}
          </a>
        ))}
      </div>
      <section className="mt-4 grid gap-3">
        {filtered.length ? (
          filtered.map((bill) => (
            <article key={bill.id} className="panel">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold">{bill.name}</h2>
                    <strong>{formatMoney(bill.amountCents)}</strong>
                    {bill.paid ? <StatusPill tone="good">Paid</StatusPill> : bill.dueDate < today ? <StatusPill tone="bad">Overdue</StatusPill> : <StatusPill tone="neutral">Unpaid</StatusPill>}
                    {bill.recurring ? <StatusPill tone="warn">monthly</StatusPill> : null}
                  </div>
                  <p className="text-sm text-zinc-600">Due {formatDisplayDate(bill.dueDate)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!bill.paid ? (
                    <form action={payBillAction}>
                      <input type="hidden" name="id" value={bill.id} />
                      <button className="button-secondary" type="submit">
                        Mark paid
                      </button>
                    </form>
                  ) : null}
                  <form action={deleteBillAction}>
                    <input type="hidden" name="id" value={bill.id} />
                    <button className="button-danger" type="submit">
                      Delete
                    </button>
                  </form>
                </div>
              </div>
              <details className="mt-4">
                <summary className="text-sm font-semibold text-teal-800">Edit bill</summary>
                <div className="mt-3">
                  <BillForm bill={bill} />
                </div>
              </details>
            </article>
          ))
        ) : (
          <EmptyState>No bills match this filter.</EmptyState>
        )}
      </section>
    </AppShell>
  );
}
