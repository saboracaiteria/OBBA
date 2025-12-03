import { createClient } from '@supabase/supabase-js';

// Variáveis de ambiente - configurar no .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validação básica
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('⚠️ ATENÇÃO: Variáveis de ambiente do Supabase não configuradas!');
    console.error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.local');
}

// Cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
    },
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    }
});

// Helper para debug
export const testConnection = async () => {
    try {
        const { data, error } = await supabase.from('settings').select('*').limit(1);
        if (error) {
            console.error('❌ Erro ao conectar com Supabase:', error.message);
            return false;
        }
        console.log('✅ Conexão com Supabase estabelecida!');
        return true;
    } catch (err) {
        console.error('❌ Erro ao testar conexão:', err);
        return false;
    }
};
