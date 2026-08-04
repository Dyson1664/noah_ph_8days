import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "@/components/Navbar";
import Footer from "@/components/common/Footer";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured, PORTAL_TRIP_SLUG, supabase } from "@/lib/supabase";

const recoverHashRouterSession = async () => {
  if (!supabase) return;

  const tokenIndex = window.location.hash.indexOf("access_token=");
  if (tokenIndex === -1) return;

  const tokenParams = new URLSearchParams(window.location.hash.slice(tokenIndex));
  const accessToken = tokenParams.get("access_token");
  const refreshToken = tokenParams.get("refresh_token");

  if (accessToken && refreshToken) {
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }
};

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const completeLogin = async () => {
      if (!isSupabaseConfigured || !supabase) {
        setError("Supabase is not configured yet.");
        return;
      }

      await recoverHashRouterSession();
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !data.session) {
        setError("We could not complete your login. Please request a new secure link.");
        return;
      }

      const email = data.session.user.email?.trim().toLowerCase();
      if (!email) {
        setError("This login session does not include an email address.");
        return;
      }

      const { data: hasAdminAccess } = await supabase.rpc("is_portal_admin_for_trip", {
        input_trip_slug: PORTAL_TRIP_SLUG,
      });

      navigate(hasAdminAccess === true ? "/admin/payments" : "/portal/dashboard", { replace: true });
    };

    completeLogin();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="px-4 pb-16 pt-24">
        <section className="mx-auto max-w-md rounded-lg border border-border bg-card p-6 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-foreground">Signing you in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Please wait while we open your payment portal.
          </p>
          {error && (
            <div className="mt-5 space-y-4">
              <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </p>
              <Button onClick={() => navigate("/guest-login")}>Back to login</Button>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
