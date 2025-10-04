import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Ai for Investments",
  description: "AI-powered investment portfolio manager",
  generator: "Simrat",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Helps native controls respect themes */}
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class" // adds 'class' to <html>
          defaultTheme="system" // light | dark | system
          enableSystem
          disableTransitionOnChange // avoids flashes during toggle
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
