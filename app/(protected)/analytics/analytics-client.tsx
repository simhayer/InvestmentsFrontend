// app/dashboard/ConnectionsClient.tsx
"use client";
import { Analytics } from "@/components/analytics";
import { User } from "@/types/user";

export default function ConnectionsClient({ user }: { user: User }) {
  return <Analytics user={user} />;
}
