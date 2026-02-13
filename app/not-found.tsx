import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f7f8] p-6">
      <div className="text-center max-w-sm">
        <p className="text-6xl font-bold text-neutral-200 mb-4">404</p>
        <h1 className="text-xl font-bold text-neutral-900 mb-2">Page not found</h1>
        <p className="text-sm text-neutral-500 mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-5 py-2.5 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/landing"
            className="inline-flex items-center px-5 py-2.5 rounded-xl border border-neutral-200 bg-white text-neutral-700 text-sm font-medium hover:bg-neutral-50 transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
