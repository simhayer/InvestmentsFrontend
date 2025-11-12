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
    <div className="rounded-xl border p-3">
      <div className="text-sm font-semibold mb-1">{title}</div>
      <p className="text-sm opacity-90 whitespace-pre-wrap">{body}</p>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="rounded-xl border p-3">
      <div className="text-sm font-semibold mb-1">{title}</div>
      <ul className="list-disc list-inside text-sm opacity-90 space-y-1">
        {items.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="text-sm text-muted-foreground italic">{msg}</div>;
}
