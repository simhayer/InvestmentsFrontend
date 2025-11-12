import * as React from "react";

export function ScenariosTab({
  data,
}: {
  data: {
    base: string;
    bear: string;
    bull: string;
    probabilities: { base: number; bear: number; bull: number };
  };
}) {
  if (!data) return <Empty msg="No scenarios available." />;
  return (
    <div className="grid md:grid-cols-3 gap-3">
      {(["base", "bull", "bear"] as const).map((k) => (
        <div key={k} className="rounded-xl border p-3">
          <div className="text-sm font-semibold capitalize mb-1">{k} Case</div>
          <div className="text-xs mb-2 opacity-70">
            Probability: {Math.round((data.probabilities as any)[k] * 100)}%
          </div>
          <p className="text-sm opacity-90 whitespace-pre-wrap">
            {(data as any)[k]}
          </p>
        </div>
      ))}
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="text-sm text-muted-foreground italic">{msg}</div>;
}
