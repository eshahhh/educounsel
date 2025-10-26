// Supabase client setup
let supabaseClient = null;

function initSupabase() {
    if (typeof window !== 'undefined' && !supabaseClient) {
        // Load Supabase from CDN if not already loaded
        if (!window.supabase) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.onload = () => {
                supabaseClient = window.supabase.createClient(
                    Config.SUPABASE.URL,
                    Config.SUPABASE.ANON_KEY
                );
                console.log('Supabase client initialized');
            };
            document.head.appendChild(script);
        } else {
            supabaseClient = window.supabase.createClient(
                Config.SUPABASE.URL,
                Config.SUPABASE.ANON_KEY
            );
        }
    }
    return supabaseClient;
}

function getSupabaseClient() {
    if (!supabaseClient) {
        return initSupabase();
    }
    return supabaseClient;
}

// Storage utilities
const SupabaseStorage = {
    async uploadFile(file, path, options = {}) {
        const supabase = getSupabaseClient();
        if (!supabase) {
            throw new Error('Supabase client not initialized');
        }

        const { data, error } = await supabase.storage
            .from(Config.SUPABASE.STORAGE_BUCKET)
            .upload(path, file, {
                cacheControl: '3600',
                upsert: false,
                ...options
            });

        if (error) {
            console.error('Upload error:', error);
            throw error;
        }

        return data;
    },

    async getSignedUrl(path, expiresIn = 3600) {
        const supabase = getSupabaseClient();
        if (!supabase) {
            throw new Error('Supabase client not initialized');
        }

        const { data, error } = await supabase.storage
            .from(Config.SUPABASE.STORAGE_BUCKET)
            .createSignedUrl(path, expiresIn);

        if (error) {
            console.error('Signed URL error:', error);
            throw error;
        }

        return data.signedUrl;
    },

    async deleteFile(path) {
        const supabase = getSupabaseClient();
        if (!supabase) {
            throw new Error('Supabase client not initialized');
        }

        const { error } = await supabase.storage
            .from(Config.SUPABASE.STORAGE_BUCKET)
            .remove([path]);

        if (error) {
            console.error('Delete error:', error);
            throw error;
        }
    }
};

// Initialize Supabase when config is loaded
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initSupabase);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initSupabase, getSupabaseClient, SupabaseStorage };
}