import Link from "next/link";
import { loginAction } from "@/actions";
import { AuthCard } from "@/components/AuthCard";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getCurrentUser()) redirect("/");
  const params = await searchParams;
  return (
    <AuthCard title="Log in" error={params.error}>
      <form action={loginAction} className="grid gap-4">
        <label className="grid gap-1">
          <span className="label">Email</span>
          <input className="field" type="email" name="email" required />
        </label>
        <label className="grid gap-1">
          <span className="label">Password</span>
          <input className="field" type="password" name="password" minLength={8} required />
        </label>
        <button className="button" type="submit">
          Log in
        </button>
      </form>
      <p className="mt-4 text-sm text-zinc-600">
        New here?{" "}
        <Link className="font-semibold text-teal-800" href="/register">
          Create an account
        </Link>
      </p>
    </AuthCard>
  );
}
