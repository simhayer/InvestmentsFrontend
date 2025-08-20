// app/page.tsx  (SERVER component — no "use client")
import Link from "next/link";
import { cookies } from "next/headers";

export default async function LandingPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  // Optional: verify token so an expired cookie doesn’t show “Go to Dashboard”
  let isAuthed = false;
  if (token) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      isAuthed = res.ok;
    } catch {
      isAuthed = false;
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-3xl text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold">AI for Investments</h1>
        <p className="text-base md:text-lg text-gray-600">
          Personalized insights on your holdings, risk, diversification, and
          news—powered by AI.
        </p>

        <div className="flex items-center justify-center gap-3">
          {isAuthed ? (
            <Link
              href="/dashboard"
              className="rounded-xl px-5 py-3 bg-black text-white"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-xl px-5 py-3 bg-black text-white"
              >
                Log in
              </Link>
              <Link href="/register" className="rounded-xl px-5 py-3 border">
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Placeholder section for a bit of marketing copy/features */}
        <div className="mt-10 grid gap-4 md:grid-cols-3 text-left">
          <Feature
            title="Holdings Analysis"
            desc="Clear, plain-English insights per asset."
          />
          <Feature
            title="Portfolio Health"
            desc="Diversification, risk, and concentration checks."
          />
          <Feature
            title="Signals & News"
            desc="Contextual updates that actually matter."
          />
        </div>
      </div>
    </main>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="p-4 rounded-2xl border">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-gray-600 mt-1">{desc}</p>
    </div>
  );
}
