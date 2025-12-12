import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://dweoxnfkeghrmaiuapvq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3ZW94bmZrZWdocm1haXVhcHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMTY0NDgsImV4cCI6MjA4MDg5MjQ0OH0.bIuV_BB75FSNm12-nIIAqBGpqc-xt2H5dqfZe4LQwNg';

export const supabase = createClient(supabaseUrl, supabaseKey);