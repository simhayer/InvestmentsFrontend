"use client";

import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3, Shield, Sparkles } from "lucide-react";

export default function LoginClient() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-4">
      <div className="mx-auto w-full max-w-5xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left column */}
          <div className="hidden lg:block space-y-8">
            <div className="space-y-4">
              <span className="text-sm font-bold text-neutral-900 tracking-tight">
                WallStreetAI
              </span>
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900 leading-snug">
                Welcome back.
              </h1>
              <p className="text-neutral-500 leading-relaxed max-w-sm">
                AI-powered insights on your holdings, portfolio health, and market
                opportunities — all in one place.
              </p>
            </div>

            <div className="space-y-3">
              <FeatureRow icon={BarChart3} text="Portfolio analysis & risk scoring" />
              <FeatureRow icon={Sparkles} text="AI-driven insights tailored to you" />
              <FeatureRow icon={Shield} text="Read-only, bank-grade security" />
            </div>
          </div>

          {/* Right column */}
          <div>
            <Card className="rounded-2xl border-neutral-200 bg-white shadow-sm p-2">
              <CardHeader className="space-y-1 pb-4 text-center lg:text-left">
                <div className="lg:hidden mb-4">
                  <span className="text-sm font-bold text-neutral-900 tracking-tight">
                    WallStreetAI
                  </span>
                </div>
                <CardTitle className="text-xl font-bold text-neutral-900">
                  Sign in
                </CardTitle>
                <CardDescription className="text-sm text-neutral-500">
                  Enter your credentials to access your dashboard.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <LoginForm />
                <div className="mt-6 text-center text-sm text-neutral-500">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="text-neutral-900 font-semibold hover:underline"
                  >
                    Sign up free
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

function FeatureRow({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-9 w-9 rounded-lg bg-white border border-neutral-200 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-neutral-600" />
      </div>
      <span className="text-sm text-neutral-600 font-medium">{text}</span>
    </div>
  );
}
