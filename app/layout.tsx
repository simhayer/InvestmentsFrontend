// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { NProgressProvider } from "@/app/nprogress-provider";
import { AuthProvider } from "@/lib/auth-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import { PostHogProvider } from "@/lib/posthog-provider";
import { Suspense } from "react";
import { inter } from "@/lib/fonts";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://wallstreetai.io";

export const metadata: Metadata = {
  title: {
    default: "WallStreetAI — AI-Powered Portfolio Intelligence",
    template: "%s | WallStreetAI",
  },
  description:
    "Connect your brokerage, get institutional-grade AI analysis — risk scores, rebalancing paths, and actionable insights for your portfolio.",
  metadataBase: new URL(siteUrl),
  generator: "WallStreetAI",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "WallStreetAI",
    title: "WallStreetAI — AI-Powered Portfolio Intelligence",
    description:
      "Connect your brokerage, get institutional-grade AI analysis — risk scores, rebalancing paths, and actionable insights.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "WallStreetAI" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "WallStreetAI — AI-Powered Portfolio Intelligence",
    description:
      "Connect your brokerage, get institutional-grade AI analysis — risk scores, rebalancing paths, and actionable insights.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
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
                <PostHogProvider />
                {children}
              </ThemeProvider>
            </AuthProvider>
          </Suspense>
        </ErrorBoundary>
      </body>
    </html>
  );
}
