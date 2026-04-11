import Link from "next/link";
import { logoutAction } from "@/actions";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/tasks", label: "Tasks" },
  { href: "/groceries", label: "Groceries" },
  { href: "/bills", label: "Bills" },
  { href: "/maintenance", label: "Maintenance" },
  { href: "/search", label: "Search" },
  { href: "/import-export", label: "Import/Export" }
];

export function Nav({ email }: { email: string }) {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/" className="text-lg font-bold text-teal-800">
            Household Command Center
          </Link>
          <p className="text-sm text-zinc-600">{email}</p>
        </div>
        <nav className="flex flex-wrap items-center gap-2">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-md px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100">
              {link.label}
            </Link>
          ))}
          <form action={logoutAction}>
            <button className="button-secondary" type="submit">
              Log out
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
