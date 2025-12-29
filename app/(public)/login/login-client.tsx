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
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      {/* Background Polish */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/50 via-white to-white" />

      <div className="mx-auto w-full max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          {/* Left column: Value Proposition */}
          <div className="order-2 space-y-8 lg:order-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg">
              AI for investments
              <Sparkles className="h-3 w-3 text-indigo-400" />
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl lg:leading-[1.1]">
                Welcome back.
              </h1>
              <p className="max-w-md text-lg text-neutral-500 leading-relaxed">
                Access AI-powered insights on your holdings and portfolio
                health—all in one calm, focused dashboard.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Portfolio Health Card */}
              <div className="rounded-3xl border border-neutral-200/60 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-2 text-xs font-bold text-neutral-800 uppercase tracking-wider">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    Health
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-neutral-100 text-[10px] font-bold uppercase"
                  >
                    Live
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-neutral-900 mb-2">
                  78%
                </div>
                <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden mb-3">
                  <div className="h-full w-[78%] bg-emerald-500 rounded-full" />
                </div>
                <p className="text-[11px] leading-relaxed text-neutral-500 font-medium">
                  Reviewing risk and concentration daily.
                </p>
              </div>

              {/* Stats Card */}
              <div className="rounded-3xl border border-neutral-200/60 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-2 text-xs font-bold text-neutral-800 uppercase tracking-wider">
                    <ShieldCheck className="h-4 w-4 text-indigo-500" />
                    Secure
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-neutral-300" />
                </div>
                <div className="flex gap-2">
                  {[
                    { label: "Signals", val: "+3" },
                    { label: "Tickers", val: "45" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="flex-1 bg-neutral-50 rounded-xl p-2 ring-1 ring-neutral-100"
                    >
                      <div className="text-[8px] font-black text-neutral-400 uppercase tracking-tighter">
                        {stat.label}
                      </div>
                      <div className="text-sm font-bold text-neutral-900">
                        {stat.val}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-[11px] text-neutral-400 font-medium">
              By signing in, you agree to read-only access policies and secure
              data handling.
            </p>
          </div>

          {/* Right column: Login Form */}
          <div className="order-1 lg:order-2">
            <Card className="rounded-[2.5rem] border-neutral-200/60 bg-white p-4 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.1)] lg:p-6">
              <CardHeader className="space-y-1 pb-6 text-center lg:text-left">
                <CardTitle className="text-2xl font-bold text-neutral-900">
                  Sign in
                </CardTitle>
                <CardDescription className="text-sm font-medium text-neutral-500">
                  Secure, read-only login to your dashboard.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <LoginForm />
                <div className="mt-8 text-center text-xs font-medium text-neutral-500">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="text-indigo-600 font-bold hover:underline transition-all"
                  >
                    Sign up for free
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
