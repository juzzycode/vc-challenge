"use server";

import type { GroceryCategory, Recurrence } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cleanEmail, cleanPassword, createSession, destroySession, hashPassword, requireUser, verifyPassword } from "@/lib/auth";
import { nextRecurringDate, parseDate } from "@/lib/dates";
import { amountToCents, categoryValue, checkboxValue, optionalTextValue, positiveInteger, recurrenceValue, textValue } from "@/lib/forms";
import { prisma } from "@/lib/prisma";

function idValue(formData: FormData) {
  return textValue(formData, "id", "ID");
}

function appRevalidate() {
  revalidatePath("/");
  revalidatePath("/tasks");
  revalidatePath("/groceries");
  revalidatePath("/bills");
  revalidatePath("/maintenance");
  revalidatePath("/search");
  revalidatePath("/import-export");
}

async function ownedTask(id: string, userId: string) {
  return prisma.task.findFirstOrThrow({ where: { id, userId } });
}

async function ownedBill(id: string, userId: string) {
  return prisma.bill.findFirstOrThrow({ where: { id, userId } });
}

export async function registerAction(formData: FormData) {
  const email = cleanEmail(formData.get("email"));
  const password = cleanPassword(formData.get("password"));
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) redirect("/register?error=Email%20is%20already%20registered");

  const user = await prisma.user.create({
    data: { email, passwordHash: hashPassword(password) }
  });
  await createSession(user.id);
  redirect("/");
}

export async function loginAction(formData: FormData) {
  const email = cleanEmail(formData.get("email"));
  const password = cleanPassword(formData.get("password"));
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    redirect("/login?error=Invalid%20email%20or%20password");
  }
  await createSession(user.id);
  redirect("/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

export async function createTaskAction(formData: FormData) {
  const user = await requireUser();
  await prisma.task.create({
    data: {
      userId: user.id,
      name: textValue(formData, "name", "Task name"),
      description: optionalTextValue(formData, "description"),
      dueDate: parseDate(formData.get("dueDate"), "Due date"),
      recurrence: recurrenceValue(formData)
    }
  });
  appRevalidate();
}

export async function updateTaskAction(formData: FormData) {
  const user = await requireUser();
  const id = idValue(formData);
  await ownedTask(id, user.id);
  await prisma.task.update({
    where: { id },
    data: {
      name: textValue(formData, "name", "Task name"),
      description: optionalTextValue(formData, "description"),
      dueDate: parseDate(formData.get("dueDate"), "Due date"),
      recurrence: recurrenceValue(formData)
    }
  });
  appRevalidate();
}

export async function deleteTaskAction(formData: FormData) {
  const user = await requireUser();
  const id = idValue(formData);
  await prisma.task.deleteMany({ where: { id, userId: user.id } });
  appRevalidate();
}

export async function completeTaskAction(formData: FormData) {
  const user = await requireUser();
  const task = await ownedTask(idValue(formData), user.id);
  if (!task.completed) {
    await prisma.$transaction(async (tx) => {
      await tx.task.update({
        where: { id: task.id },
        data: { completed: true, completedAt: new Date() }
      });
      if (task.recurrence !== "NONE") {
        await tx.task.create({
          data: {
            userId: user.id,
            name: task.name,
            description: task.description,
            dueDate: nextRecurringDate(task.dueDate, task.recurrence),
            recurrence: task.recurrence
          }
        });
      }
    });
  }
  appRevalidate();
}

export async function createGroceryAction(formData: FormData) {
  const user = await requireUser();
  await prisma.groceryItem.create({
    data: {
      userId: user.id,
      name: textValue(formData, "name", "Item name"),
      category: categoryValue(formData)
    }
  });
  appRevalidate();
}

export async function updateGroceryAction(formData: FormData) {
  const user = await requireUser();
  const id = idValue(formData);
  await prisma.groceryItem.updateMany({
    where: { id, userId: user.id },
    data: {
      name: textValue(formData, "name", "Item name"),
      category: categoryValue(formData)
    }
  });
  appRevalidate();
}

export async function toggleGroceryAction(formData: FormData) {
  const user = await requireUser();
  const item = await prisma.groceryItem.findFirstOrThrow({ where: { id: idValue(formData), userId: user.id } });
  await prisma.groceryItem.update({
    where: { id: item.id },
    data: { purchased: !item.purchased, purchasedAt: item.purchased ? null : new Date() }
  });
  appRevalidate();
}

export async function deleteGroceryAction(formData: FormData) {
  const user = await requireUser();
  await prisma.groceryItem.deleteMany({ where: { id: idValue(formData), userId: user.id } });
  appRevalidate();
}

export async function createBillAction(formData: FormData) {
  const user = await requireUser();
  await prisma.bill.create({
    data: {
      userId: user.id,
      name: textValue(formData, "name", "Bill name"),
      amountCents: amountToCents(formData.get("amount")),
      dueDate: parseDate(formData.get("dueDate"), "Due date"),
      recurring: checkboxValue(formData, "recurring")
    }
  });
  appRevalidate();
}

export async function updateBillAction(formData: FormData) {
  const user = await requireUser();
  const id = idValue(formData);
  await ownedBill(id, user.id);
  await prisma.bill.update({
    where: { id },
    data: {
      name: textValue(formData, "name", "Bill name"),
      amountCents: amountToCents(formData.get("amount")),
      dueDate: parseDate(formData.get("dueDate"), "Due date"),
      recurring: checkboxValue(formData, "recurring")
    }
  });
  appRevalidate();
}

export async function payBillAction(formData: FormData) {
  const user = await requireUser();
  const bill = await ownedBill(idValue(formData), user.id);
  if (!bill.paid) {
    await prisma.$transaction(async (tx) => {
      await tx.bill.update({
        where: { id: bill.id },
        data: { paid: true, paidAt: new Date() }
      });
      if (bill.recurring) {
        const nextDueDate = new Date(bill.dueDate);
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        await tx.bill.create({
          data: {
            userId: user.id,
            name: bill.name,
            amountCents: bill.amountCents,
            dueDate: nextDueDate,
            recurring: true
          }
        });
      }
    });
  }
  appRevalidate();
}

export async function deleteBillAction(formData: FormData) {
  const user = await requireUser();
  await prisma.bill.deleteMany({ where: { id: idValue(formData), userId: user.id } });
  appRevalidate();
}

export async function createMaintenanceAction(formData: FormData) {
  const user = await requireUser();
  await prisma.maintenanceItem.create({
    data: {
      userId: user.id,
      name: textValue(formData, "name", "Task name"),
      lastCompletedDate: parseDate(formData.get("lastCompletedDate"), "Last completed date"),
      frequencyDays: positiveInteger(formData.get("frequencyDays"), "Frequency")
    }
  });
  appRevalidate();
}

export async function updateMaintenanceAction(formData: FormData) {
  const user = await requireUser();
  const id = idValue(formData);
  await prisma.maintenanceItem.updateMany({
    where: { id, userId: user.id },
    data: {
      name: textValue(formData, "name", "Task name"),
      lastCompletedDate: parseDate(formData.get("lastCompletedDate"), "Last completed date"),
      frequencyDays: positiveInteger(formData.get("frequencyDays"), "Frequency")
    }
  });
  appRevalidate();
}

export async function completeMaintenanceAction(formData: FormData) {
  const user = await requireUser();
  await prisma.maintenanceItem.updateMany({
    where: { id: idValue(formData), userId: user.id },
    data: { lastCompletedDate: new Date() }
  });
  appRevalidate();
}

export async function deleteMaintenanceAction(formData: FormData) {
  const user = await requireUser();
  await prisma.maintenanceItem.deleteMany({ where: { id: idValue(formData), userId: user.id } });
  appRevalidate();
}

export async function importDataAction(formData: FormData) {
  const user = await requireUser();
  const raw = textValue(formData, "json", "JSON data");
  const parsed = JSON.parse(raw) as {
    tasks?: Array<{ name: string; description?: string | null; dueDate: string; recurrence?: Recurrence; completed?: boolean; completedAt?: string | null }>;
    groceries?: Array<{ name: string; category?: GroceryCategory; purchased?: boolean; purchasedAt?: string | null }>;
    bills?: Array<{ name: string; amountCents: number; dueDate: string; recurring?: boolean; paid?: boolean; paidAt?: string | null }>;
    maintenance?: Array<{ name: string; lastCompletedDate: string; frequencyDays: number }>;
  };

  await prisma.$transaction(async (tx) => {
    await tx.task.deleteMany({ where: { userId: user.id } });
    await tx.groceryItem.deleteMany({ where: { userId: user.id } });
    await tx.bill.deleteMany({ where: { userId: user.id } });
    await tx.maintenanceItem.deleteMany({ where: { userId: user.id } });

    for (const task of parsed.tasks ?? []) {
      if (!task.name || !task.dueDate) continue;
      await tx.task.create({
        data: {
          userId: user.id,
          name: task.name,
          description: task.description ?? null,
          dueDate: new Date(task.dueDate),
          recurrence: task.recurrence ?? "NONE",
          completed: Boolean(task.completed),
          completedAt: task.completedAt ? new Date(task.completedAt) : null
        }
      });
    }

    for (const item of parsed.groceries ?? []) {
      if (!item.name) continue;
      await tx.groceryItem.create({
        data: {
          userId: user.id,
          name: item.name,
          category: item.category ?? "OTHER",
          purchased: Boolean(item.purchased),
          purchasedAt: item.purchasedAt ? new Date(item.purchasedAt) : null
        }
      });
    }

    for (const bill of parsed.bills ?? []) {
      if (!bill.name || !bill.dueDate || !Number.isInteger(bill.amountCents)) continue;
      await tx.bill.create({
        data: {
          userId: user.id,
          name: bill.name,
          amountCents: bill.amountCents,
          dueDate: new Date(bill.dueDate),
          recurring: Boolean(bill.recurring),
          paid: Boolean(bill.paid),
          paidAt: bill.paidAt ? new Date(bill.paidAt) : null
        }
      });
    }

    for (const item of parsed.maintenance ?? []) {
      if (!item.name || !item.lastCompletedDate || !Number.isInteger(item.frequencyDays) || item.frequencyDays <= 0) continue;
      await tx.maintenanceItem.create({
        data: {
          userId: user.id,
          name: item.name,
          lastCompletedDate: new Date(item.lastCompletedDate),
          frequencyDays: item.frequencyDays
        }
      });
    }
  });

  appRevalidate();
  redirect("/import-export?imported=1");
}
