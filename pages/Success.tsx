import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleCheck, Home, UserPlus } from 'lucide-react';

export const Success: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center px-4">
       <div className="bg-white max-w-md w-full rounded-3xl shadow-xl p-8 text-center border border-emerald-100">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
             <CircleCheck className="w-10 h-10 text-emerald-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-2">PDF Gerado com Sucesso!</h2>
          <p className="text-slate-500 mb-8">
            O plano alimentar foi exportado e o download deve iniciar automaticamente.
          </p>

          <div className="space-y-3">
             <button
               onClick={() => navigate('/')}
               className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
             >
               <Home size={18} />
               Voltar ao Dashboard
             </button>
             <button
               onClick={() => navigate('/student/new')}
               className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
             >
               <UserPlus size={18} />
               Criar Novo Plano
             </button>
          </div>
       </div>
    </div>
  );
};