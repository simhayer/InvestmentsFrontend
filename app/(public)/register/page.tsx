"use client";

import Image from "next/image";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowUpRight, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      {/* Background Polish - Matches Login */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/50 via-white to-white" />

      <div className="mx-auto w-full max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          {/* Left column: brand + benefits */}
          <div className="order-1 space-y-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200">
                <Image
                  src="/placeholder-logo.svg"
                  alt="Logo"
                  width={28}
                  height={28}
                  className="h-7 w-7"
                />
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg">
                AI for investments
                <Sparkles className="h-3 w-3 text-indigo-400" />
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl lg:leading-[1.1]">
                Smart tracking. <br />
                <span className="text-indigo-600">Pure clarity.</span>
              </h1>
              <p className="max-w-md text-lg text-neutral-500 leading-relaxed">
                Connect your brokerages for an AI-powered view of your risk and
                opportunities. Read-only, secure, and calm.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Security Benefit Card */}
              <div className="rounded-3xl border border-neutral-200/60 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-2 text-xs font-bold text-neutral-800 uppercase tracking-wider">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    Security
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-neutral-100 text-[10px] font-bold uppercase italic"
                  >
                    Read Only
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="h-8 w-8 shrink-0 rounded-full bg-emerald-50 flex items-center justify-center ring-1 ring-emerald-100">
                      <LockKeyhole className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-neutral-900">
                        Encrypted Sync
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        Bank-grade data protection.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insights Benefit Card */}
              <div className="rounded-3xl border border-neutral-200/60 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-2 text-xs font-bold text-neutral-800 uppercase tracking-wider">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    Insights
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-neutral-300" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-neutral-600">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Risk Analysis
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-neutral-600">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                    Portfolio Health
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-neutral-600">
                    <div className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
                    Sector Diversification
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: Form */}
          <div className="order-2 lg:order-2">
            <Card className="rounded-[2.5rem] border-neutral-200/60 bg-white p-4 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.1)] lg:p-6">
              <CardHeader className="space-y-1 pb-6 text-center lg:text-left">
                <CardTitle className="text-2xl font-bold text-neutral-900">
                  Create account
                </CardTitle>
                <CardDescription className="text-sm font-medium text-neutral-500">
                  Join 10,000+ investors using AI clarity.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <RegisterForm />
                <div className="mt-8 text-center text-xs font-medium text-neutral-500">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-indigo-600 font-bold hover:underline transition-all"
                  >
                    Sign in here
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
