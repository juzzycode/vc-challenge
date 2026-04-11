import { Nav } from "@/components/Nav";
import { requireUser } from "@/lib/auth";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <>
      <Nav email={user.email} />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </>
  );
}
