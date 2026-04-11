export function AuthCard({ title, error, children }: { title: string; error?: string; children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-md border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-teal-800">{title}</h1>
        {error ? <p className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
        <div className="mt-5">{children}</div>
      </section>
    </main>
  );
}
