// app/(public)/feedback/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Bug, MessageCircle, Sparkles, Send } from "lucide-react";

import { useAuth } from "@/lib/auth-provider";
import {
  submitFeedback,
  FeedbackSubmitError,
  type FeedbackCategory,
} from "@/utils/feedbackService";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

function toSerializableErrorMeta(err: unknown): Record<string, unknown> {
  if (err instanceof Error) {
    const status =
      "status" in err ? (err as Error & { status?: number }).status : null;
    const detail =
      "detail" in err
        ? (err as Error & { detail?: unknown }).detail ?? null
        : null;
    return {
      name: err.name,
      message: err.message,
      stack: err.stack ?? null,
      status: status ?? null,
      detail,
    };
  }

  if (err && typeof err === "object") {
    const obj = err as Record<string, unknown>;
    const propertyNames = Object.getOwnPropertyNames(err);
    const raw: Record<string, unknown> = {};

    for (const key of propertyNames) {
      const value = obj[key];
      if (typeof value !== "function" && value !== undefined) {
        raw[key] = value;
      }
    }

    const msg = obj.message ?? obj.error ?? null;
    let normalizedMessage: string | null = null;
    if (typeof msg === "string") {
      normalizedMessage = msg;
    } else if (msg !== null) {
      try {
        normalizedMessage = JSON.stringify(msg);
      } catch {
        normalizedMessage = String(msg);
      }
    }

    return {
      message: normalizedMessage,
      code: (obj.code as string | undefined) ?? null,
      details: (obj.details as string | undefined) ?? null,
      hint: (obj.hint as string | undefined) ?? null,
      status: (obj.status as number | string | undefined) ?? null,
      keys: propertyNames,
      raw,
    };
  }

  return { message: String(err) };
}

export default function FeedbackPage() {
  const { user } = useAuth();

  const [category, setCategory] = useState<FeedbackCategory>("bug");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email) {
      setEmail((prev) => prev || user.email!);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSuccess(null);
    setErrorMessage(null);

    if (!message.trim()) {
      setErrorMessage("Please share a bit about your feedback.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        message: message.trim(),
        category,
        email: email.trim() || null,
        page_url:
          typeof window !== "undefined" ? window.location.href : null,
      };

      await submitFeedback(payload);

      setSuccess(
        "Thanks for reaching out — we’ve received your feedback."
      );
      setMessage("");
      if (!user?.email) {
        setEmail("");
      }
      setCategory("bug");
    } catch (err) {
      const errMeta = toSerializableErrorMeta(err);
      logger.error("Unexpected error submitting feedback", errMeta);
      const message =
        err instanceof FeedbackSubmitError &&
        err.message === "Feedback service is not configured"
          ? "Feedback is temporarily unavailable. Please try again later or contact support."
          : "Something went wrong sending your feedback. Please try again in a moment.";
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 border border-neutral-200 text-xs font-medium text-neutral-600 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-neutral-400" />
          We’d love to hear from you
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
          Share feedback or report a bug
        </h1>
        <p className="text-sm text-neutral-500 leading-relaxed max-w-xl">
          Tell us what’s working well, what’s confusing, or any issues
          you’re running into. We read every message and use this to
          improve WallStreetAI.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-sm space-y-5"
      >
        {success && (
          <Alert className="border-emerald-200 bg-emerald-50/60">
            <AlertTitle className="flex items-center gap-2 text-emerald-800">
              <MessageCircle className="h-4 w-4" />
              Thank you
            </AlertTitle>
            <AlertDescription className="text-emerald-800/90">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {errorMessage && (
          <Alert variant="destructive">
            <AlertTitle>Unable to send feedback</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="category">Type of feedback</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setCategory("bug")}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm text-left transition-colors ${
                category === "bug"
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700"
              }`}
            >
              <Bug className="h-4 w-4" />
              <span>Bug</span>
            </button>
            <button
              type="button"
              onClick={() => setCategory("idea")}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm text-left transition-colors ${
                category === "idea"
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>Idea</span>
            </button>
            <button
              type="button"
              onClick={() => setCategory("other")}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm text-left transition-colors ${
                category === "other"
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700"
              }`}
            >
              <MessageCircle className="h-4 w-4" />
              <span>Other</span>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Your feedback</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share as much detail as you can — what you were doing, what you expected, and what actually happened."
            rows={6}
            className="resize-none"
          />
          <p className="text-xs text-neutral-400">
            Please avoid sharing sensitive information like full account
            numbers or passwords.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email (optional, so we can reply)
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="flex items-center justify-between gap-4 pt-1">
          <p className="text-xs text-neutral-400 max-w-xs">
            Feedback is stored securely in our Supabase project and may be
            associated with your account so we can follow up if needed.
          </p>
          <Button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl"
          >
            {submitting ? (
              <span>Sending…</span>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Send feedback</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

