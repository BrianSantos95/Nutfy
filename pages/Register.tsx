import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Leaf, Mail, Lock, Loader2, CheckCircle } from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
        await signUp(email, password);
        
        alert('Conta criada com sucesso! Você já pode entrar.');
        navigate('/'); // O Supabase pode fazer login automático dependendo da config, ou pedir confirmação de email.
    } catch (err: any) {
        setError(err.message || 'Erro ao criar conta.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950">
      
      {/* Left Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-emerald-900 relative overflow-hidden items-center justify-center">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2053&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
         
         <div className="relative z-10 p-12 max-w-lg">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl mb-6">
               <Leaf className="w-8 h-8 text-white" fill="currentColor" />
            </div>
            <h1 className="text-4xl font-extrabold text-white mb-6 tracking-tight leading-tight">
               Comece a organizar seus atendimentos hoje.
            </h1>
            <ul className="space-y-4 text-emerald-100">
               <li className="flex items-center gap-3"><CheckCircle className="text-emerald-400" size={20} /> Banco de dados seguro</li>
               <li className="flex items-center gap-3"><CheckCircle className="text-emerald-400" size={20} /> Sincronização em nuvem</li>
               <li className="flex items-center gap-3"><CheckCircle className="text-emerald-400" size={20} /> Acesso de qualquer lugar</li>
            </ul>
         </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
         <div className="max-w-md w-full">
            <div className="text-center lg:text-left mb-10">
               <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Crie sua conta</h2>
               <p className="text-slate-500 dark:text-slate-400">Junte-se a milhares de nutricionistas no Nutfy.</p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium border border-red-100 dark:border-red-900/30">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5">
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
                       placeholder="Mínimo 6 caracteres"
                       required
                     />
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Confirmar Senha</label>
                  <div className="relative group">
                     <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors w-5 h-5" />
                     <input 
                       type="password" 
                       value={confirmPassword}
                       onChange={(e) => setConfirmPassword(e.target.value)}
                       className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-slate-900 dark:text-white"
                       placeholder="Repita a senha"
                       required
                     />
                  </div>
               </div>

               <button 
                 type="submit" 
                 disabled={loading}
                 className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-slate-200 dark:shadow-slate-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
               >
                  {loading ? <Loader2 className="animate-spin" /> : 'Criar Conta'}
               </button>
            </form>

            <p className="mt-8 text-center text-slate-500 dark:text-slate-400 text-sm">
               Já tem uma conta? <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700">Fazer Login</Link>
            </p>
         </div>
      </div>
    </div>
  );
};