import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// ✅ single base client — created once
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const supabaseClient = (token) => {
  // ✅ just update the auth header, don't recreate the client
  supabase.realtime.setAuth(token);
  supabase.functions.setAuth(token);

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      persistSession: false, // ✅ prevents multiple GoTrueClient instances
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
};

export default supabaseClient;