import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Finance World",
  description:
    "Global finance news and AI-powered market insights that may affect stocks and markets. Stay informed with real-time updates.",
};

export default function FinanceWorldLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
