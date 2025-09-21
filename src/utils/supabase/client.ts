import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_KEY, SUPABASE_URL } from "../constant";

export function createClient() {
    return createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
}
