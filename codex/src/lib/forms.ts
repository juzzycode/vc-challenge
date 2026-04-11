import type { GroceryCategory, Recurrence } from "@prisma/client";

export function textValue(formData: FormData, key: string, label = key) {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} is required.`);
  }
  return value.trim();
}

export function optionalTextValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

export function recurrenceValue(formData: FormData): Recurrence {
  const value = formData.get("recurrence");
  if (value === "DAILY" || value === "WEEKLY" || value === "MONTHLY") return value;
  return "NONE";
}

export function categoryValue(formData: FormData): GroceryCategory {
  const value = formData.get("category");
  const allowed: GroceryCategory[] = [
    "PRODUCE",
    "MEAT",
    "DAIRY",
    "BAKERY",
    "FROZEN",
    "PANTRY",
    "HOUSEHOLD",
    "OTHER"
  ];
  return allowed.includes(value as GroceryCategory) ? (value as GroceryCategory) : "OTHER";
}

export function checkboxValue(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

export function amountToCents(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error("Amount is required.");
  }
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Amount must be a positive number.");
  }
  return Math.round(amount * 100);
}

export function positiveInteger(value: FormDataEntryValue | null, label: string) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${label} must be a positive whole number.`);
  }
  return parsed;
}
