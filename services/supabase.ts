import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://qlbcyhsyzgneovjzoqys.supabase.co';
const supabaseKey = 'sb_publishable_NXv-5PmQsqNl_EWVtR0P8A_UKXpEK_k';

export const supabase = createClient(supabaseUrl, supabaseKey);