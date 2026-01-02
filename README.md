# Nutfy - Assistente Nutricional Inteligente

Nutfy é um aplicativo moderno para nutricionistas, oferecendo ferramentas de gestão de pacientes, avaliações antropométricas, planos alimentares e um assistente de IA especializado em nutrição clínica.

## Tecnologias

- **Frontend**: React + Vite + TypeScript
- **Estilização**: CSS Moderno
- **Banco de Dados**: Supabase (PostgreSQL)
- **IA**: Google Gemini 2.0 Flash
- **Ícones**: Lucide React

## Como Executar Localmente

1. Clone o repositório:
   ```bash
   git clone https://github.com/BrianSantos95/nutfy.git
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente:
   Crie um arquivo `.env` na raiz do projeto com as seguintes chaves:
   ```env
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
   VITE_GEMINI_API_KEY=sua_chave_da_google_ai_studio
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Funcionalidades Principais

- **Dashboard**: Visão geral dos atendimentos e métricas.
- **Gestão de Alunos/Pacientes**: Cadastro completo e histórico.
- **Avaliações**: Cálculo de IMC, protocolos de dobras cutâneas e bioimpedância.
- **Planos Alimentares**: Criação de dietas personalizadas com exportação em PDF.
- **Chat IA**: Suporte técnico em tempo real para dúvidas clínicas e substituições.

---
Desenvolvido por Brian Santos.
