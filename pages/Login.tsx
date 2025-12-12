import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { Leaf, Mail, Lock, Loader2, ArrowRight, HelpCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMsg('');

    try {
        await signIn(email, password);
        navigate('/');
    } catch (err: any) {
        setError(err.message || 'Erro ao fazer login.');
    } finally {
        setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
      if (!email) {
          setError('Digite seu e-mail para recuperar a senha.');
          return;
      }
      setResetLoading(true);
      setError('');
      setMsg('');
      try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: window.location.origin + '/#/reset-password',
          });
          if (error) throw error;
          setMsg('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
      } catch (err: any) {
          setError(err.message || 'Erro ao enviar e-mail de recuperação.');
      } finally {
          setResetLoading(false);
      }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950">
      
      {/* Left Side - Image/Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#F3F4F8] dark:bg-slate-900 relative overflow-hidden items-center justify-center">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400/20 rounded-full blur-[100px] -mr-20 -mt-20"></div>
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] -ml-20 -mb-20"></div>
         
         <div className="relative z-10 text-center p-12">
            <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-900/10 mx-auto mb-8">
               <Leaf className="w-12 h-12 text-emerald-500" fill="currentColor" />
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">Nutfy</h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Seu assistente nutricional inteligente.
            </p>
         </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
         <div className="max-w-md w-full">
            <div className="text-center lg:text-left mb-10">
               <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Bem-vindo de volta</h2>
               <p className="text-slate-500 dark:text-slate-400">Entre para gerenciar seus pacientes.</p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium border border-red-100 dark:border-red-900/30">
                {error}
              </div>
            )}
            
            {msg && (
              <div className="mb-6 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-4 py-3 rounded-xl text-sm font-medium border border-emerald-100 dark:border-emerald-900/30">
                {msg}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
               <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Email</label>
                  <div className="relative group">
                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors w-5 h-5" />
                     <input 
                       type="email" 
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-slate-900 dark:text-white"
                       placeholder="seu@email.com"
                       required
                     />
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Senha</label>
                  <div className="relative group">
                     <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors w-5 h-5" />
                     <input 
                       type="password" 
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-slate-900 dark:text-white"
                       placeholder="••••••••"
                       required
                     />
                  </div>
               </div>
               
               <div className="flex justify-end">
                   <button 
                     type="button"
                     onClick={handleForgotPassword}
                     disabled={resetLoading}
                     className="text-sm font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400 flex items-center gap-1 transition-colors disabled:opacity-50"
                   >
                       {resetLoading ? <Loader2 size={14} className="animate-spin"/> : <HelpCircle size={14} />}
                       Esqueceu sua senha?
                   </button>
               </div>

               <button 
                 type="submit" 
                 disabled={loading}
                 className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
               >
                  {loading ? <Loader2 className="animate-spin" /> : <>Entrar <ArrowRight size={20} /></>}
               </button>
            </form>

            <p className="mt-8 text-center text-slate-500 dark:text-slate-400 text-sm">
               Não tem uma conta? <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-700">Cadastre-se grátis</Link>
            </p>
         </div>
      </div>
    </div>
  );
};