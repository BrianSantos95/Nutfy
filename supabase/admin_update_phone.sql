-- ==========================================
-- UPDATE: ADICIONAR TELEFONE AO PERFIL E ADMIN
-- ==========================================

-- 1. Cria a coluna 'phone' na tabela de perfis (se não existir)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN 
        ALTER TABLE public.profiles ADD COLUMN phone TEXT; 
    END IF; 
END $$;

-- 2. Atualiza a função do Dashboard Admin para priorizar o telefone do Perfil
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
    last_renewal TIMESTAMPTZ
) 
SECURITY DEFINER
AS $$
BEGIN
    -- Verificação de Segurança
    IF auth.jwt() ->> 'email' <> 'othonbrian@gmail.com' THEN
        RAISE EXCEPTION 'Acesso negado: Apenas administradores.';
    END IF;

    RETURN QUERY
    SELECT 
        u.id as user_id,
        (u.email)::VARCHAR as email,
        p.name,
        -- Pega o telefone do perfil (prioridade) ou do cadastro (fallback)
        COALESCE(p.phone, (u.raw_user_meta_data ->> 'phone')::TEXT) as phone,
        p.logo_url,
        s.status::TEXT as subscription_status,
        s.plan_type::TEXT,
        s.start_date,
        s.plan_expiration_date,
        s.start_date as last_renewal
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
