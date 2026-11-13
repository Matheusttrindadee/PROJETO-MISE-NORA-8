import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://nzmlmluzgroctbgpcttg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_070yySFLuHXlxK08IDlQw_nLun7gIY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);