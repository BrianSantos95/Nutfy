-- ==========================================
-- CORREÇÃO COMPLETA: TABELA + FUNÇÃO
-- ==========================================

-- 1. Garante que a coluna 'phone' existe na tabela 'profiles'
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN 
        ALTER TABLE public.profiles ADD COLUMN phone TEXT; 
    END IF; 
END $$;

-- 2. Drop preventivo da função antiga
DROP FUNCTION IF EXISTS get_admin_dashboard_data();

-- 3. Recria a função completa com todas as correções (Telefone + Stats + Data Segura)
CREATE OR REPLACE FUNCTION get_admin_dashboard_data()
RETURNS TABLE (
    user_id UUID,
    email VARCHAR,
    name TEXT,
    phone TEXT,
    logo_url TEXT,
    subscription_status TEXT,
    plan_type TEXT,
    start_date TIMESTAMPTZ,
    plan_expiration_date TIMESTAMPTZ,
    last_renewal TIMESTAMPTZ,
    total_students BIGINT,
    active_students BIGINT
) 
SECURITY DEFINER
AS $$
BEGIN
    -- Verificação de Segurança
    IF auth.jwt() IS NULL OR (auth.jwt() ->> 'email') <> 'othonbrian@gmail.com' THEN
        RAISE EXCEPTION 'Acesso negado: Apenas administradores.';
    END IF;

    RETURN QUERY
    SELECT 
        u.id as user_id,
        (u.email)::VARCHAR as email,
        p.name,
        -- Busca telefone do perfil. Se nulo, tenta metadados antigos.
        COALESCE(p.phone, (u.raw_user_meta_data ->> 'phone')::TEXT) as phone,
        p.logo_url,
        s.status::TEXT as subscription_status,
        s.plan_type::TEXT,
        s.start_date,
        s.plan_expiration_date,
        s.start_date as last_renewal,
        -- Contagem Total
        (SELECT COUNT(*) FROM public.students st WHERE st.user_id = u.id) as total_students,
        -- Contagem Ativos (com cast seguro de data)
        (SELECT COUNT(*) 
         FROM public.students st 
         WHERE st.user_id = u.id 
         AND st.plan_end_date IS NOT NULL 
         AND st.plan_end_date::DATE >= CURRENT_DATE) as active_students
    FROM 
        auth.users u
    LEFT JOIN 
        public.profiles p ON u.id = p.user_id
    LEFT JOIN 
        public.subscriptions s ON u.id = s.user_id
    ORDER BY 
        s.start_date DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql;
