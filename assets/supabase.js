// Add your Supabase project URL and anon/public key in this file.
// Never put a Supabase service_role key in browser code.
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
export const SUPABASE_URL = "https://ogmmoxsioqoskqofqwfe.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_7OtaSQyBrFvHv2xZFjknKQ_IU8x8vgx";
export const isConfigured = !SUPABASE_URL.startsWith("YOUR_") && !SUPABASE_ANON_KEY.startsWith("YOUR_");
export const supabase = isConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
