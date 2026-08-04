import { FormEvent, useState } from "react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/common/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getPortalRedirectUrl,
  isSupabaseConfigured,
  PORTAL_TRIP_NAME,
  PORTAL_TRIP_SLUG,
  supabase,
} from "@/lib/supabase";

const debugLogin = (message: string, details?: Record<string, unknown>) => {
  if (!import.meta.env.DEV) return;
  console.info(`[portal-login] ${message}`, details ?? "");
};

const getSupabaseHostForDebug = () => {
  try {
    return new URL(import.meta.env.VITE_SUPABASE_URL).host;
  } catch {
    return "not configured";
  }
};

const neutralMessage =
  "If this email is linked to a booking, you'll receive a secure login link shortly.";

type LoginMode = "guest" | "admin";

type GuestLoginProps = {
  mode?: LoginMode;
};

const loginCopy: Record<LoginMode, { title: string; description: string; message: string; buttonLabel: string }> = {
  guest: {
    title: `${PORTAL_TRIP_NAME} guest payment portal`,
    description:
      `Enter the email address used for your ${PORTAL_TRIP_NAME} booking and we'll send you a secure login link. No password needed.`,
    message: neutralMessage,
    buttonLabel: "Send secure login link",
  },
  admin: {
    title: `${PORTAL_TRIP_NAME} admin payments login`,
    description: "Enter your admin email address and we'll send you a secure login link. No password needed.",
    message: "If this email has admin access, you'll receive a secure login link shortly.",
    buttonLabel: "Send admin login link",
  },
};

export default function GuestLogin({ mode = "guest" }: GuestLoginProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const copy = loginCopy[mode];

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!isSupabaseConfigured || !supabase) {
      setError("Supabase is not configured yet.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;

    setIsSubmitting(true);
    debugLogin("login form submitted");
    debugLogin("normalized email", { email: normalizedEmail });
    debugLogin("Supabase URL host", { host: getSupabaseHostForDebug() });

    try {
      const { data: canRequest, error: rpcError } = await supabase.rpc("can_request_portal_login", {
        input_email: normalizedEmail,
        input_trip_slug: PORTAL_TRIP_SLUG,
      });

      if (rpcError) {
        debugLogin("can_request_portal_login returned an error", {
          message: rpcError.message,
          code: rpcError.code,
        });
        setError("We could not process this request. Please try again.");
        return;
      }

      debugLogin("can_request_portal_login result", { canRequest });

      if (canRequest === true) {
        const emailRedirectTo = getPortalRedirectUrl();
        debugLogin("calling supabase.auth.signInWithOtp", { emailRedirectTo });

        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: normalizedEmail,
          options: {
            emailRedirectTo,
          },
        });

        if (otpError) {
          debugLogin("signInWithOtp returned an error", {
            message: otpError.message,
            status: otpError.status,
          });
          setError(otpError.message);
          return;
        }

        debugLogin("signInWithOtp succeeded");
      } else {
        debugLogin("email is not eligible; signInWithOtp will not be called");
      }

      setMessage(copy.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto flex min-h-[70vh] max-w-xl items-center px-4 py-24">
        <section className="w-full rounded-xl border bg-card p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-primary">{copy.title}</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{copy.description}</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-foreground" htmlFor="portal-email">
              Email address
              <Input
                id="portal-email"
                className="mt-2"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>

            <Button className="w-full" type="submit" disabled={isSubmitting || !isSupabaseConfigured}>
              {isSubmitting ? "Sending..." : copy.buttonLabel}
            </Button>
          </form>

          {message ? (
            <div className="mt-5 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
              {message}
            </div>
          ) : null}

          {error ? (
            <div className="mt-5 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          {!isSupabaseConfigured ? (
            <p className="mt-4 text-xs text-muted-foreground">
              Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to enable login.
            </p>
          ) : null}
        </section>
      </main>
      <Footer />
    </div>
  );
}
