import { createClient } from '@supabase/supabase-js';

// Nilai hardcoded untuk pengembangan lokal
// Dalam produksi, nilai-nilai ini harus diambil dari variabel lingkungan
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;


export const supabase = createClient(supabaseUrl, supabaseAnonKey);