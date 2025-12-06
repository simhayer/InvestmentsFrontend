// app/login/login-client.tsx
"use client";

import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowUpRight, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";

export default function LoginClient() {
  return (
    <div className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(16,185,129,0.10),transparent_38%),radial-gradient(circle_at_82%_6%,rgba(59,130,246,0.08),transparent_34%)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-4.5rem)] items-center px-3 py-8 sm:px-4 sm:py-12 md:px-6 lg:px-8 lg:py-16">
        <div className='grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 font-["Futura_PT_Book",_Futura,_sans-serif] mx-auto'>
          {/* Right column on desktop, first on mobile */}
          <div className="order-1 w-full max-w-xl justify-self-center lg:order-2 lg:justify-self-end">
            <Card className="rounded-2xl border-neutral-200/80 bg-white/95 shadow-[0_28px_80px_-52px_rgba(15,23,42,0.70)]">
              <CardHeader className="space-y-2 pb-2">
                <CardTitle className='text-3xl font-semibold text-neutral-900 font-["Futura_PT_Demi",_Futura,_sans-serif]'>
                  Sign in
                </CardTitle>
                <CardDescription className="text-base text-neutral-600">
                  Access your investment dashboard with secure, read-only login.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <LoginForm />
                <div className="text-center text-sm text-neutral-600">
                  Don&apos;t have an account?{" "}
                  <Button
                    asChild
                    variant="link"
                    className='px-1 font-["Futura_PT_Demi",_Futura,_sans-serif]'
                  >
                    <Link href="/register" className="font-semibold">
                      Sign up
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Left column on desktop, second on mobile */}
          <div className="order-2 space-y-6 lg:order-1">
            <div className='inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-sm font-["Futura_PT_Demi",_Futura,_sans-serif]'>
              AI for investments
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="space-y-3">
              <h1 className='text-3xl leading-tight text-neutral-900 sm:text-4xl font-["Futura_PT_Demi",_Futura,_sans-serif]'>
                Welcome back.
              </h1>
              <p className="max-w-xl text-base text-neutral-600 sm:text-lg">
                Access AI-powered insights on your holdings, risk, and portfolio health—all in one calm, focused dashboard.
              </p>
            </div>

            <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-neutral-200/80 bg-white/90 p-4 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.60)] backdrop-blur">
                <div className="flex items-center justify-between text-sm">
                  <span className='inline-flex items-center gap-2 font-medium text-neutral-800 font-["Futura_PT_Demi",_Futura,_sans-serif]'>
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    Portfolio health
                  </span>
                  <Badge variant="secondary" className="rounded-full text-[11px]">
                    Live sync
                  </Badge>
                </div>
                <div className='mt-2 text-3xl font-semibold text-neutral-900 font-["Futura_PT_Demi",_Futura,_sans-serif]'>
                  78%
                </div>
                <div className="mt-3 h-2 rounded-full bg-neutral-100 ring-1 ring-neutral-200/80">
                  <div className="h-full w-[78%] rounded-full bg-emerald-500" />
                </div>
                <p className="mt-2 text-xs text-neutral-600">
                  Diversification, risk, and concentration reviewed each time you log in.
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200/80 bg-white/85 p-4 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.60)] backdrop-blur">
                <div className='flex items-center justify-between gap-2 text-sm font-medium text-neutral-800 font-["Futura_PT_Demi",_Futura,_sans-serif]'>
                  <span className="inline-flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Calm, secure access
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-neutral-400" />
                </div>
                <div className="mt-3 space-y-4">
                  <p className="text-sm leading-relaxed text-neutral-600">
                    Read-only connections with AI summaries for what changed in your portfolio.
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-xs text-neutral-600">
                    <div className="rounded-lg bg-neutral-100/90 px-3 py-2.5 ring-1 ring-neutral-200/70 h-[72px] flex flex-col justify-between text-left">
                      <div className="text-[10px] uppercase tracking-[0.08em] text-neutral-500 leading-[1.1] whitespace-nowrap">
                        Signals
                      </div>
                      <div className='text-sm font-semibold text-neutral-900 font-["Futura_PT_Demi",_Futura,_sans-serif] leading-tight'>
                        +3 today
                      </div>
                    </div>
                    <div className="rounded-lg bg-neutral-100/90 px-3 py-2.5 ring-1 ring-neutral-200/70 h-[72px] flex flex-col justify-between text-left">
                      <div className="text-[10px] uppercase tracking-[0.08em] text-neutral-500 leading-[1.1] whitespace-nowrap">
                        Insights
                      </div>
                      <div className='text-sm font-semibold text-neutral-900 font-["Futura_PT_Demi",_Futura,_sans-serif] leading-tight'>
                        Fresh
                      </div>
                    </div>
                    <div className="rounded-lg bg-neutral-100/90 px-3 py-2.5 ring-1 ring-neutral-200/70 h-[72px] flex flex-col justify-between text-left">
                      <div className="text-[10px] uppercase tracking-[0.08em] text-neutral-500 leading-[1.1] whitespace-nowrap">
                        Coverage
                      </div>
                      <div className='text-sm font-semibold text-neutral-900 font-["Futura_PT_Demi",_Futura,_sans-serif] leading-tight'>
                        45 tickers
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
