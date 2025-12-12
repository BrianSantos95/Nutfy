import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Leaf, User, Home, ArrowLeft, Settings, Sun, Moon, BarChart3, MessageCircleQuestion, LogOut } from 'lucide-react';
import { SubscriptionBadge } from './SubscriptionBadge';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  backPath?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, title, showBack = false, backPath }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  const handleLogout = async () => {
      await signOut();
      navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F9FC] dark:bg-slate-950 transition-colors duration-300">
      
      {/* --- SIDEBAR (Desktop) --- */}
      <aside className="hidden md:flex w-[20rem] flex-col p-6 pr-0">
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 flex flex-col p-8 relative overflow-hidden transition-colors duration-300">
           
           {/* Decorative blurred blobs */}
           <div className="absolute top-0 right-0 w-32 h-32 bg-violet-100 dark:bg-violet-900/20 rounded-full blur-3xl opacity-40 pointer-events-none -mr-10 -mt-10"></div>
           <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-50 dark:bg-emerald-900/20 rounded-full blur-3xl opacity-60 pointer-events-none -ml-10 -mb-10"></div>

           {/* Brand */}
           <div className="flex items-center gap-3 mb-10 pl-1 relative z-10 cursor-pointer group" onClick={() => navigate('/')}>
              <div className="bg-slate-900 dark:bg-white p-2.5 rounded-2xl shadow-lg shadow-slate-300 dark:shadow-slate-900 transition-transform group-hover:scale-105">
                 <Leaf className="w-5 h-5 text-emerald-400 dark:text-emerald-600" fill="currentColor" />
              </div>
              <span className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">Nutfy</span>
           </div>

           {/* Navigation */}
           <nav className="space-y-3 relative z-10 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              
              {/* 1. Início */}
              <button 
                onClick={() => navigate('/')}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.2rem] transition-all duration-300 font-bold text-sm group ${
                  isActive('/') 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg shadow-slate-300 dark:shadow-slate-800 translate-x-1' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Home size={22} className={isActive('/') ? 'text-emerald-400 dark:text-emerald-600' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'} />
                Início
              </button>

              {/* 2. Relatório Mensal */}
              <button 
                onClick={() => navigate('/reports')}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.2rem] transition-all duration-300 font-bold text-sm group ${
                  isActive('/reports') 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg shadow-slate-300 dark:shadow-slate-800 translate-x-1' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BarChart3 size={22} className={isActive('/reports') ? 'text-blue-400 dark:text-blue-600' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'} />
                Relatório Mensal
              </button>

              {/* 3. Chat IA */}
              <button 
                onClick={() => navigate('/chat')}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.2rem] transition-all duration-300 font-bold text-sm group ${
                  isActive('/chat') 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg shadow-slate-300 dark:shadow-slate-800 translate-x-1' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <MessageCircleQuestion size={22} className={isActive('/chat') ? 'text-pink-400 dark:text-pink-600' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'} />
                Chat IA
              </button>

              {/* 4. Perfil Profissional */}
              <button 
                onClick={() => navigate('/profile')}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.2rem] transition-all duration-300 font-bold text-sm group ${
                  isActive('/profile') 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg shadow-slate-300 dark:shadow-slate-800 translate-x-1' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <User size={22} className={isActive('/profile') ? 'text-violet-400 dark:text-violet-600' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'} />
                Perfil Profissional
              </button>

              {/* 5. Assinatura */}
               <button 
                onClick={() => navigate('/subscription')}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.2rem] transition-all duration-300 font-bold text-sm group ${
                  isActive('/subscription') 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg shadow-slate-300 dark:shadow-slate-800 translate-x-1' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Settings size={22} className={isActive('/subscription') ? 'text-orange-400 dark:text-orange-600' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'} />
                Assinatura
              </button>

              {/* 6. Modo Escuro (Toggle) */}
              <button 
                onClick={toggleTheme}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-[1.2rem] transition-all duration-300 font-bold text-sm group text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              >
                {theme === 'light' ? (
                   <>
                     <Moon size={22} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                     Modo Escuro
                   </>
                ) : (
                   <>
                     <Sun size={22} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                     Modo Claro
                   </>
                )}
              </button>
           </nav>

           {/* Status Card in Sidebar */}
           <div className="relative z-10 mt-4 space-y-4">
              <SubscriptionBadge />
              
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 font-bold text-xs transition-colors"
              >
                <LogOut size={16} /> Desconectar
              </button>
           </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Mobile Header (Top) */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-2" onClick={() => navigate('/')}>
               <div className="bg-slate-900 dark:bg-white p-2 rounded-xl">
                 <Leaf size={16} className="text-emerald-400 dark:text-emerald-600" />
               </div>
               <span className="font-bold text-slate-800 dark:text-white">Nutfy</span>
            </div>
            
            <div className="flex items-center gap-3">
               <button 
                  onClick={toggleTheme}
                  className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
               >
                  {theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
               </button>
               <button onClick={() => navigate('/profile')} className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <User size={20}/>
               </button>
               <button onClick={handleLogout} className="p-2.5 bg-red-50 dark:bg-red-900/20 rounded-full text-red-500 dark:text-red-400 hover:bg-red-100 transition-colors">
                  <LogOut size={20}/>
               </button>
            </div>
        </div>

        {/* Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 pb-24 md:p-10 md:pb-10 scroll-smooth">
           <div className="max-w-6xl mx-auto w-full">
              
              {/* Top Bar for Desktop Content */}
              <div className="hidden md:flex items-center justify-between mb-8">
                 <div className="flex items-center gap-4">
                    {showBack && (
                      <button 
                        onClick={handleBack}
                        className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 transition-all active:scale-90"
                      >
                         <ArrowLeft size={20} strokeWidth={2.5} />
                      </button>
                    )}
                    {title && (
                       <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">{title}</h2>
                    )}
                 </div>

                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-900 pl-2 pr-5 py-2 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/profile')}>
                       <div className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center border border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400">
                          <User size={16} />
                       </div>
                       <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Minha Conta</span>
                    </div>
                 </div>
              </div>

              {/* Mobile Back Button */}
              {showBack && (
                 <button 
                   onClick={handleBack}
                   className="md:hidden mb-6 flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold"
                 >
                    <ArrowLeft size={20} /> Voltar
                 </button>
              )}

              {/* Page Children */}
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
                 {children}
              </div>
              
              <div className="h-12 hidden md:block"></div> {/* Spacer for Desktop */}
           </div>
        </div>

        {/* --- MOBILE BOTTOM NAVIGATION (MINI MENU) --- */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-2 py-2 z-50 flex items-center justify-around shadow-[0_-4px_10px_rgba(0,0,0,0.03)] pb-safe transition-colors duration-300">
            
            {/* 1. Início */}
            <button 
              onClick={() => navigate('/')} 
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                isActive('/') ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'
              }`}
            >
                <div className={`${isActive('/') ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-transparent'} p-1.5 rounded-lg transition-colors`}>
                  <Home size={22} strokeWidth={isActive('/') ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-bold">Início</span>
            </button>

            {/* 2. Relatório */}
            <button 
              onClick={() => navigate('/reports')} 
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                isActive('/reports') ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'
              }`}
            >
                <div className={`${isActive('/reports') ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-transparent'} p-1.5 rounded-lg transition-colors`}>
                  <BarChart3 size={22} strokeWidth={isActive('/reports') ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-bold">Relatório</span>
            </button>

            {/* 3. Chat IA */}
            <button 
              onClick={() => navigate('/chat')} 
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                isActive('/chat') ? 'text-pink-600 dark:text-pink-400' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'
              }`}
            >
                <div className={`${isActive('/chat') ? 'bg-pink-50 dark:bg-pink-900/30' : 'bg-transparent'} p-1.5 rounded-lg transition-colors`}>
                  <MessageCircleQuestion size={22} strokeWidth={isActive('/chat') ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-bold">Chat IA</span>
            </button>
            
            {/* 4. Perfil */}
            <button 
              onClick={() => navigate('/profile')} 
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                isActive('/profile') ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'
              }`}
            >
                <div className={`${isActive('/profile') ? 'bg-violet-50 dark:bg-violet-900/30' : 'bg-transparent'} p-1.5 rounded-lg transition-colors`}>
                  <User size={22} strokeWidth={isActive('/profile') ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-bold">Perfil</span>
            </button>

            {/* 5. Planos (Assinatura) */}
            <button 
              onClick={() => navigate('/subscription')} 
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                isActive('/subscription') ? 'text-orange-500 dark:text-orange-400' : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'
              }`}
            >
                <div className={`${isActive('/subscription') ? 'bg-orange-50 dark:bg-orange-900/30' : 'bg-transparent'} p-1.5 rounded-lg transition-colors`}>
                  <Settings size={22} strokeWidth={isActive('/subscription') ? 2.5 : 2} />
                </div>
                <span className="text-[10px] font-bold">Planos</span>
            </button>
        </div>

      </main>

    </div>
  );
};