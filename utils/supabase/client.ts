import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = "https://vdypyryzlbpkktqticns.supabase.co";

const supabaseKey =
  "sb_publishable_mJOeqC6Kv5Yz1C8dqObQQw_xLqySUQ0";

export const createClient = () =>
  createBrowserClient(
    supabaseUrl,
    supabaseKey
  );
