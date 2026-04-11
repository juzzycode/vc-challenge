import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [tasks, groceries, bills, maintenance] = await Promise.all([
    prisma.task.findMany({ where: { userId: user.id }, orderBy: { dueDate: "asc" } }),
    prisma.groceryItem.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
    prisma.bill.findMany({ where: { userId: user.id }, orderBy: { dueDate: "asc" } }),
    prisma.maintenanceItem.findMany({ where: { userId: user.id }, orderBy: { name: "asc" } })
  ]);

  const data = {
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

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "content-type": "application/json",
      "content-disposition": `attachment; filename="household-command-center-${new Date().toISOString().slice(0, 10)}.json"`
    }
  });
}
