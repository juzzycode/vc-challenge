import type { Bill, GroceryItem, MaintenanceItem, Task } from "@prisma/client";
import {
  createBillAction,
  createGroceryAction,
  createMaintenanceAction,
  createTaskAction,
  updateBillAction,
  updateGroceryAction,
  updateMaintenanceAction,
  updateTaskAction
} from "@/actions";
import { formatDateInput } from "@/lib/dates";

const recurrenceOptions = [
  ["NONE", "No recurrence"],
  ["DAILY", "Daily"],
  ["WEEKLY", "Weekly"],
  ["MONTHLY", "Monthly"]
];

const categories = ["PRODUCE", "MEAT", "DAIRY", "BAKERY", "FROZEN", "PANTRY", "HOUSEHOLD", "OTHER"];

export function TaskForm({ task }: { task?: Task }) {
  return (
    <form action={task ? updateTaskAction : createTaskAction} className="grid gap-3 md:grid-cols-2">
      {task ? <input type="hidden" name="id" value={task.id} /> : null}
      <label className="grid gap-1">
        <span className="label">Name</span>
        <input className="field" name="name" defaultValue={task?.name} required />
      </label>
      <label className="grid gap-1">
        <span className="label">Due date</span>
        <input className="field" type="date" name="dueDate" defaultValue={task ? formatDateInput(task.dueDate) : ""} required />
      </label>
      <label className="grid gap-1 md:col-span-2">
        <span className="label">Description</span>
        <textarea className="field min-h-20" name="description" defaultValue={task?.description ?? ""} />
      </label>
      <label className="grid gap-1">
        <span className="label">Recurrence</span>
        <select className="field" name="recurrence" defaultValue={task?.recurrence ?? "NONE"}>
          {recurrenceOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-end">
        <button className="button" type="submit">
          {task ? "Save task" : "Add task"}
        </button>
      </div>
    </form>
  );
}

export function GroceryForm({ item }: { item?: GroceryItem }) {
  return (
    <form action={item ? updateGroceryAction : createGroceryAction} className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <label className="grid gap-1">
        <span className="label">Item</span>
        <input className="field" name="name" defaultValue={item?.name} required />
      </label>
      <label className="grid gap-1">
        <span className="label">Category</span>
        <select className="field" name="category" defaultValue={item?.category ?? "OTHER"}>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category.toLowerCase()}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-end">
        <button className="button" type="submit">
          {item ? "Save" : "Add item"}
        </button>
      </div>
    </form>
  );
}

export function BillForm({ bill }: { bill?: Bill }) {
  return (
    <form action={bill ? updateBillAction : createBillAction} className="grid gap-3 md:grid-cols-4">
      {bill ? <input type="hidden" name="id" value={bill.id} /> : null}
      <label className="grid gap-1">
        <span className="label">Name</span>
        <input className="field" name="name" defaultValue={bill?.name} required />
      </label>
      <label className="grid gap-1">
        <span className="label">Amount</span>
        <input className="field" type="number" min="0" step="0.01" name="amount" defaultValue={bill ? (bill.amountCents / 100).toFixed(2) : ""} required />
      </label>
      <label className="grid gap-1">
        <span className="label">Due date</span>
        <input className="field" type="date" name="dueDate" defaultValue={bill ? formatDateInput(bill.dueDate) : ""} required />
      </label>
      <label className="flex items-end gap-2 text-sm font-semibold text-zinc-700">
        <input type="checkbox" name="recurring" defaultChecked={bill?.recurring ?? false} />
        Monthly
      </label>
      <div className="md:col-span-4">
        <button className="button" type="submit">
          {bill ? "Save bill" : "Add bill"}
        </button>
      </div>
    </form>
  );
}

export function MaintenanceForm({ item }: { item?: MaintenanceItem }) {
  return (
    <form action={item ? updateMaintenanceAction : createMaintenanceAction} className="grid gap-3 md:grid-cols-[1fr_220px_180px_auto]">
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <label className="grid gap-1">
        <span className="label">Task name</span>
        <input className="field" name="name" defaultValue={item?.name} required />
      </label>
      <label className="grid gap-1">
        <span className="label">Last completed</span>
        <input className="field" type="date" name="lastCompletedDate" defaultValue={item ? formatDateInput(item.lastCompletedDate) : ""} required />
      </label>
      <label className="grid gap-1">
        <span className="label">Frequency days</span>
        <input className="field" type="number" min="1" name="frequencyDays" defaultValue={item?.frequencyDays ?? 90} required />
      </label>
      <div className="flex items-end">
        <button className="button" type="submit">
          {item ? "Save" : "Add item"}
        </button>
      </div>
    </form>
  );
}
