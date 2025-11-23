"use client";

import * as React from "react";

export interface MarketOutlookData {
  key_risks: string[];
  short_term: string;
  medium_term: string;
  key_opportunities: string[];
}

export function MarketOutlookTab({ data }: { data: MarketOutlookData }) {
  if (!data) return <Empty msg="No outlook available." />;

  return (
    <div className="grid gap-3">
      <CardBlock title="Short-term Outlook" body={data.short_term} />
      <CardBlock title="Medium-term Outlook" body={data.medium_term} />
      <ListBlock title="Key Risks" items={data.key_risks} />
      <ListBlock title="Key Opportunities" items={data.key_opportunities} />
    </div>
  );
}

function CardBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold text-slate-900 mb-1">{title}</div>
      <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
        {body}
      </p>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold text-slate-900 mb-1">{title}</div>
      <ul className="list-disc list-inside text-sm text-slate-800 space-y-1">
        {items.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
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
