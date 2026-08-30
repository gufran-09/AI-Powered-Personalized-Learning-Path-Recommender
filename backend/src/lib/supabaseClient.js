import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase credentials missing in backend environment.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
