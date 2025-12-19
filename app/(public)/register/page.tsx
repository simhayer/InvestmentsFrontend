"use client";

import Image from "next/image";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowUpRight, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";

const futuraSignInFontClasses =
  "font-['Futura_PT_Book',_Futura,_sans-serif] [&_.font-semibold]:font-['Futura_PT_Demi',_Futura,_sans-serif] [&_.font-bold]:font-['Futura_PT_Demi',_Futura,_sans-serif]";

export default function RegisterPage() {
  return (
    <div className="relative isolate overflow-hidden bg-neutral-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(16,185,129,0.10),transparent_38%),radial-gradient(circle_at_82%_6%,rgba(59,130,246,0.08),transparent_34%)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-4.5rem)] items-center px-3 py-8 sm:px-4 sm:py-12 md:px-6 lg:px-8 lg:py-16">
        <div
          className={[
            "grid w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 mx-auto",
            futuraSignInFontClasses,
          ].join(" ")}
        >
          {/* Left column: brand + benefits */}
          <div className="order-1 space-y-8 lg:order-1">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 shadow-[0_16px_45px_-30px_rgba(15,23,42,0.65)] ring-1 ring-neutral-200/80">
                <Image
                  src="/placeholder-logo.svg"
                  alt="AI Investing logo"
                  width={28}
                  height={28}
                  className="h-7 w-7"
                  priority
                />
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-sm">
                AI for investments
                <Sparkles className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-3">
              <h1 className='text-3xl leading-tight text-neutral-900 sm:text-4xl font-["Futura_PT_Demi",_Futura,_sans-serif]'>
                Create your AI investing account.
              </h1>
              <p className="max-w-xl text-base text-neutral-600 sm:text-lg">
                Link your existing brokerages and get AI-powered insights on risk, diversification, and opportunities—all in a calm, read-only experience.
              </p>
            </div>

            <div className="grid max-w-2xl gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-neutral-200/80 bg-white/90 p-4 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.60)] backdrop-blur motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-4 motion-reduce:animate-none">
                <div className="flex items-center justify-between text-sm text-neutral-700">
                  <span className='inline-flex items-center gap-2 font-medium text-neutral-800 font-["Futura_PT_Demi",_Futura,_sans-serif]'>
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Bank-grade security
                  </span>
                  <Badge variant="secondary" className="rounded-full text-[11px]">
                    Read-only
                  </Badge>
                </div>
                <ul className="mt-3 space-y-3 text-sm text-neutral-700">
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-100">
                      <LockKeyhole className="h-4 w-4 text-emerald-600" />
                    </span>
                    <div>
                      <div className="font-medium text-neutral-800">Read-only connections</div>
                      <p className="text-xs text-neutral-600">No trading permissions—just secure data sync.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 ring-1 ring-neutral-200/70">
                      <ShieldCheck className="h-4 w-4 text-neutral-700" />
                    </span>
                    <div>
                      <div className="font-medium text-neutral-800">Bank-grade encryption</div>
                      <p className="text-xs text-neutral-600">Protected credentials with layered controls.</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-neutral-200/80 bg-white/85 p-4 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.60)] backdrop-blur motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-left-6 motion-reduce:animate-none">
                <div className='flex items-center justify-between gap-2 text-sm font-medium text-neutral-800 font-["Futura_PT_Demi",_Futura,_sans-serif]'>
                  <span className="inline-flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    Plain-English insights
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-neutral-400" />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                  Clarity on what matters, delivered with calm visual cues.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-neutral-700">
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Diversification, risk, and concentration at a glance.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-neutral-300" />
                    Signals on what changed since your last login.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-neutral-300" />
                    Transparent language, no jargon.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right column: sign-up card */}
          <div className="order-2 w-full max-w-xl justify-self-center lg:order-2 lg:justify-self-end motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-4 motion-reduce:animate-none">
            <Card className="rounded-2xl border-neutral-200/80 bg-white/95 shadow-[0_28px_80px_-52px_rgba(15,23,42,0.70)]">
              <CardHeader className="space-y-2 pb-2">
                <CardTitle className='text-3xl font-semibold text-neutral-900 font-["Futura_PT_Demi",_Futura,_sans-serif]'>
                  Create account
                </CardTitle>
                <CardDescription className="text-base text-neutral-600">
                  Join your AI portfolio tracker and stay ahead with read-only insights.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <RegisterForm />
                <div className="text-center text-sm text-neutral-600">
                  Already have an account?{" "}
                  <Button
                    asChild
                    variant="link"
                    className='px-1 font-["Futura_PT_Demi",_Futura,_sans-serif]'
                  >
                    <Link href="/login" className="font-semibold">
                      Sign in
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
