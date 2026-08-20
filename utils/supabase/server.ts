import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl =
  "https://vdypyryzlbpkktqticns.supabase.co";

const supabaseKey =
  "sb_publishable_mJOeqC6Kv5Yz1C8dqObQQw_xLqySUQ0";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(
              ({ name, value, options }) => {
                cookieStore.set(name, value, options);
              }
            );
          } catch {
            // Pode ser ignorado em Server Components.
          }
        },
      },
    }
  );
}
