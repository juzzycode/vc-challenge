"use client";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-lg rounded-md border border-red-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-red-800">Something needs attention</h1>
        <p className="mt-3 text-sm text-zinc-700">{error.message || "The app could not finish that request."}</p>
        <button className="button mt-5" type="button" onClick={reset}>
          Try again
        </button>
      </section>
    </main>
  );
}
