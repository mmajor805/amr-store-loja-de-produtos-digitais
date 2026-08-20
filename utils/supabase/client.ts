import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://vdypyryzlbpkktqticns.supabase.co";

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_ksdutK44h8AFSwcdFHg4TA_3kR15zZY";

export const createClient = () =>
  createBrowserClient(
    supabaseUrl,
    supabaseKey
  );
