export default function ProtectedLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 border-2 border-neutral-200 border-t-neutral-600 rounded-full animate-spin" />
        <p className="text-sm text-neutral-400">Loading...</p>
      </div>
    </div>
  );
}
