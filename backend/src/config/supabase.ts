import { createClient } from '@supabase/supabase-js';
import config from '../config';

export const supabaseAdmin = createClient(
    config.supabase.url,
    config.supabase.serviceRoleKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

export const supabaseClient = createClient(
    config.supabase.url,
    config.supabase.anonKey
);

export default supabaseAdmin;
