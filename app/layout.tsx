// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { NProgressProvider } from "@/app/nprogress-provider";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "AI for Investments",
  description: "AI-powered investment portfolio manager",
  generator: "Simrat",
  icons: [
    {
      rel: "icon",
      url: "/favicon-dark.png?v=1",
      media: "(prefers-color-scheme: dark)",
    },
    {
      rel: "icon",
      url: "/favicon-light.png?v=1",
      media: "(prefers-color-scheme: light)",
    },
    { rel: "apple-touch-icon", url: "/apple-touch-icon.png" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Suspense fallback={null}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <NProgressProvider />
            {children}
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}
