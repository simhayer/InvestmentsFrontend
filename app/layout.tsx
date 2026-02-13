// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { NProgressProvider } from "@/app/nprogress-provider";
import { AuthProvider } from "@/lib/auth-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import { Suspense } from "react";
import { inter } from "@/lib/fonts";

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
      <body
        className={`${inter.variable} min-h-screen bg-background text-foreground antialiased`}
      >
        <ErrorBoundary>
          <Suspense fallback={null}>
            <AuthProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="light"
                enableSystem={false}
                disableTransitionOnChange
              >
                <NProgressProvider />
                {children}
              </ThemeProvider>
            </AuthProvider>
          </Suspense>
        </ErrorBoundary>
      </body>
    </html>
  );
}
