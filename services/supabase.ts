import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fkwdggojpzocbcmyeyjd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrd2RnZ29qcHpvY2JjbXlleWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMzc2ODUsImV4cCI6MjA4MDgxMzY4NX0.JiBLkJXUh0JK_lCx-DdCiV9QAe7jz4kwUDUSXridLa4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);