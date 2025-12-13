import * as React from "react";

export function ScenariosTab({
  data,
}: {
  data: {
    base: string;
    bear: string;
    bull: string;
    probabilities?: { base: number; bear: number; bull: number };
  };
}) {
  if (!data) return <Empty msg="No scenarios available." />;
  const probs = data.probabilities || { base: 0, bear: 0, bull: 0 };
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {(["base", "bull", "bear"] as const).map((k) => {
        const prob = Math.round((probs as any)[k] * 100);
        const tone =
          k === "bull" ? "bg-emerald-500" : k === "bear" ? "bg-rose-500" : "bg-slate-600";
        return (
          <div
            key={k}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-semibold capitalize text-slate-900">
                {k} Case
              </div>
              <span className="text-xs rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">
                {prob}%
              </span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-slate-100">
              <div
                className={`h-2 rounded-full ${tone}`}
                style={{ width: `${Math.min(100, Math.max(0, prob))}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {(data as any)[k]}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
      {msg}
    </div>
  );
}
