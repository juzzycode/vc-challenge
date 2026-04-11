import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { GroceryForm } from "@/components/Forms";
import { StatusPill } from "@/components/StatusPill";
import { deleteGroceryAction, toggleGroceryAction } from "@/actions";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function GroceriesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const user = await requireUser();
  const params = await searchParams;
  const status = params.status ?? "needed";
  const groceries = await prisma.groceryItem.findMany({
    where: { userId: user.id },
    orderBy: [{ purchased: "asc" }, { category: "asc" }, { createdAt: "desc" }]
  });
  const filtered = groceries.filter((item) => (status === "purchased" ? item.purchased : status === "all" ? true : !item.purchased));

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-zinc-900">Groceries</h1>
        <p className="text-zinc-600">A shared list that remembers what is still needed.</p>
      </div>
      <section className="panel mb-5">
        <h2 className="mb-3 text-xl font-bold">Add grocery item</h2>
        <GroceryForm />
      </section>
      <div className="flex flex-wrap gap-2">
        {["needed", "purchased", "all"].map((option) => (
          <a key={option} href={`/groceries?status=${option}`} className={option === status ? "button" : "button-secondary"}>
            {option}
          </a>
        ))}
      </div>
      <section className="mt-4 grid gap-3 md:grid-cols-2">
        {filtered.length ? (
          filtered.map((item) => (
            <article key={item.id} className="panel">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold">{item.name}</h2>
                    <StatusPill tone={item.purchased ? "good" : "neutral"}>{item.purchased ? "Purchased" : "Needed"}</StatusPill>
                  </div>
                  <p className="text-sm text-zinc-600">{item.category.toLowerCase()}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <form action={toggleGroceryAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <button className="button-secondary" type="submit">
                      {item.purchased ? "Need again" : "Purchased"}
                    </button>
                  </form>
                  <form action={deleteGroceryAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <button className="button-danger" type="submit">
                      Remove
                    </button>
                  </form>
                </div>
              </div>
              <details className="mt-4">
                <summary className="text-sm font-semibold text-teal-800">Edit item</summary>
                <div className="mt-3">
                  <GroceryForm item={item} />
                </div>
              </details>
            </article>
          ))
        ) : (
          <EmptyState>No grocery items match this filter.</EmptyState>
        )}
      </section>
    </AppShell>
  );
}
