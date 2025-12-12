import React, { useEffect, useState } from 'react';
import { subscriptionService } from '../services/subscriptionService';
import { SubscriptionStatus } from '../types';
import { Clock, Crown, AlertTriangle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SubscriptionBadge: React.FC = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState<SubscriptionStatus>('trial');
    const [daysRemaining, setDaysRemaining] = useState(0);

    useEffect(() => {
        const load = async () => {
            const sub = await subscriptionService.initializeSubscription();
            setStatus(sub.status);
            const days = await subscriptionService.getDaysRemaining();
            setDaysRemaining(days);
        };
        load();
    }, []);

    const handleClick = () => {
        navigate('/subscription');
    };

    if (status === 'premium') {
        return (
            <div 
              onClick={handleClick}
              className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all group"
            >
                <div className="flex items-center gap-2 mb-2">
                    <div className="bg-emerald-500 p-1.5 rounded-lg">
                        <Crown size={14} className="text-white" fill="white" />
                    </div>
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Premium Ativo</span>
                </div>
                <div className="text-[10px] text-emerald-600 leading-tight">
                    Você tem acesso ilimitado a todas as ferramentas.
                </div>
            </div>
        );
    }

    if (status === 'expired') {
        return (
            <div 
              onClick={handleClick}
              className="bg-red-50 border border-red-100 rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all group animate-pulse"
            >
                <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={16} className="text-red-500" />
                    <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Expirado</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium text-red-600">Renovar Agora</span>
                    <ChevronRight size={14} className="text-red-400 group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        );
    }

    // Trial
    const isEndingSoon = daysRemaining <= 3;
    return (
        <div 
          onClick={handleClick}
          className={`rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all group border ${
              isEndingSoon ? 'bg-orange-50 border-orange-100' : 'bg-amber-50 border-amber-100'
          }`}
        >
            <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isEndingSoon ? 'text-orange-600' : 'text-amber-600'}`}>
                    Teste Grátis
                </span>
                <Clock size={14} className={isEndingSoon ? 'text-orange-400' : 'text-amber-400'} />
            </div>
            
            <div className="flex items-end gap-1 mb-2">
                <span className={`text-2xl font-bold leading-none ${isEndingSoon ? 'text-orange-700' : 'text-amber-700'}`}>
                    {daysRemaining}
                </span>
                <span className={`text-xs font-medium mb-0.5 ${isEndingSoon ? 'text-orange-500' : 'text-amber-500'}`}>
                    dias rest.
                </span>
            </div>
            
            <div className={`text-[10px] font-bold px-2 py-1.5 rounded-lg text-center transition-colors ${
                isEndingSoon ? 'bg-orange-200 text-orange-800 group-hover:bg-orange-300' : 'bg-amber-200 text-amber-800 group-hover:bg-amber-300'
            }`}>
                Assinar Premium
            </div>
        </div>
    );
};