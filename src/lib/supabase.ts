import { createClient } from "@supabase/supabase-js";

export const PORTAL_TRIP_SLUG = "philippines-noah";
export const PORTAL_TRIP_NAME = "Philippines with Noah";
export const PORTAL_CURRENCY = "USD";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const usesExamplePlaceholder =
  supabaseUrl?.includes("YOUR_SUPABASE_PROJECT_REF") ||
  supabaseAnonKey?.includes("YOUR_SUPABASE_ANON_KEY");

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && !usesExamplePlaceholder,
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const getPortalRedirectUrl = () => {
  const useHashRouter = import.meta.env.VITE_USE_HASHROUTER === "true";
  return `${window.location.origin}${useHashRouter ? "/#/auth/callback" : "/auth/callback"}`;
};
