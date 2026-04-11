import type { Recurrence } from "@prisma/client";

export function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export function endOfToday() {
  const date = startOfToday();
  date.setHours(23, 59, 59, 999);
  return date;
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function nextRecurringDate(date: Date, recurrence: Recurrence) {
  const next = new Date(date);
  if (recurrence === "DAILY") next.setDate(next.getDate() + 1);
  if (recurrence === "WEEKLY") next.setDate(next.getDate() + 7);
  if (recurrence === "MONTHLY") next.setMonth(next.getMonth() + 1);
  return next;
}

export function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function formatDisplayDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

export function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(cents / 100);
}

export function parseDate(value: FormDataEntryValue | null, field: string) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${field} is required.`);
  }
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${field} must be a valid date.`);
  }
  return date;
}

export function maintenanceNextDue(lastCompletedDate: Date, frequencyDays: number) {
  return addDays(lastCompletedDate, frequencyDays);
}
