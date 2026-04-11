import Link from "next/link";
import { redirect } from "next/navigation";
import { registerAction } from "@/actions";
import { AuthCard } from "@/components/AuthCard";
import { getCurrentUser } from "@/lib/auth";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getCurrentUser()) redirect("/");
  const params = await searchParams;
  return (
    <AuthCard title="Create account" error={params.error}>
      <form action={registerAction} className="grid gap-4">
        <label className="grid gap-1">
          <span className="label">Email</span>
          <input className="field" type="email" name="email" required />
        </label>
        <label className="grid gap-1">
          <span className="label">Password</span>
          <input className="field" type="password" name="password" minLength={8} required />
        </label>
        <button className="button" type="submit">
          Register
        </button>
      </form>
      <p className="mt-4 text-sm text-zinc-600">
        Already have an account?{" "}
        <Link className="font-semibold text-teal-800" href="/login">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
