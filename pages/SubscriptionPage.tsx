import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { subscriptionService } from '../services/subscriptionService';
import { PlanType } from '../types';
import { CheckCircle, Star, ShieldCheck, ArrowRight, Lock, AlertTriangle, X, Bot, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';

export const SubscriptionPage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState<PlanType>('monthly');
    const [isLoading, setIsLoading] = useState(false);
    const { showNotification } = useNotification();

    // Estado do Cancelamento
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelConfirmation, setCancelConfirmation] = useState('');
    const [isPremium, setIsPremium] = useState(false);

    useEffect(() => {
        const load = async () => {
            const sub = await subscriptionService.initializeSubscription();
            setIsPremium(sub.status === 'premium');
        };
        load();
    }, []);

    const handleSubscribe = () => {
        setIsLoading(true);

        let checkoutUrl = '';
        if (selectedPlan === 'monthly') {
            checkoutUrl = 'https://pay.kiwify.com.br/ZzvoVtk';
        } else {
            checkoutUrl = 'https://pay.kiwify.com.br/MkpaEHM';
        }

        // Abre o checkout em nova aba
        window.open(checkoutUrl, '_blank');

        // Mantém loading por um tempo e avisa
        setTimeout(() => {
            setIsLoading(false);
            showNotification('Direcionando para o pagamento seguro Kiwify...', 'success');
        }, 1000);
    };

    const handleCancelProcess = () => {
        if (cancelConfirmation.toLowerCase() === 'cancelar') {
            subscriptionService.cancelSubscription();
        }
    };

    return (
        <Layout title="Assinatura Premium">
            <div className="max-w-4xl mx-auto text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Escolha o plano ideal para você</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                    Tenha acesso ilimitado a todas as ferramentas, crie planos infinitos e gerencie seus pacientes com total liberdade.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">

                {/* Monthly Plan */}
                <div
                    onClick={() => setSelectedPlan('monthly')}
                    className={`relative p-8 rounded-2xl border-2 cursor-pointer transition-all ${selectedPlan === 'monthly'
                        ? 'border-emerald-500 bg-white dark:bg-slate-900 shadow-xl scale-105 z-10'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-300 dark:hover:border-emerald-700 opacity-80'
                        }`}
                >
                    <div className="text-left">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Mensal</h3>
                        <div className="flex items-baseline gap-1 mt-2 mb-6">
                            <span className="text-4xl font-extrabold text-slate-900 dark:text-white">R$ 29,90</span>
                            <span className="text-slate-500 dark:text-slate-400">/mês</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm">
                                <CheckCircle size={18} className="text-emerald-500" /> Alunos Ilimitados
                            </li>
                            <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm">
                                <CheckCircle size={18} className="text-emerald-500" /> Planos em PDF Personalizados
                            </li>
                            <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm">
                                <Bot size={18} className="text-emerald-500" /> <strong>Chat com IA (Nutri Helper)</strong>
                            </li>
                            <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm">
                                <BarChart3 size={18} className="text-emerald-500" /> <strong>Relatórios Mensais de Evolução</strong>
                            </li>
                            <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm">
                                <CheckCircle size={18} className="text-emerald-500" /> Cancele quando quiser
                            </li>
                        </ul>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 absolute top-8 right-8 flex items-center justify-center ${selectedPlan === 'monthly' ? 'border-emerald-500' : 'border-slate-300 dark:border-slate-600'}`}>
                        {selectedPlan === 'monthly' && <div className="w-3 h-3 rounded-full bg-emerald-500"></div>}
                    </div>
                </div>

                {/* Yearly Plan */}
                <div
                    onClick={() => setSelectedPlan('yearly')}
                    className={`relative p-8 rounded-2xl border-2 cursor-pointer transition-all ${selectedPlan === 'yearly'
                        ? 'border-purple-500 bg-white dark:bg-slate-900 shadow-xl scale-105 z-10'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-purple-300 dark:hover:border-purple-700 opacity-80'
                        }`}
                >
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                        Melhor Valor
                    </div>
                    <div className="text-left">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Anual</h3>
                        <div className="flex items-baseline gap-1 mt-2 mb-6">
                            <span className="text-4xl font-extrabold text-slate-900 dark:text-white">R$ 24,91</span>
                            <span className="text-slate-500 dark:text-slate-400">/mês</span>
                        </div>
                        <p className="text-xs text-purple-600 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-900/30 inline-block px-2 py-1 rounded mb-6">
                            Cobrado R$ 299,00 anualmente (2 meses OFF)
                        </p>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm">
                                <Star size={18} className="text-purple-500 fill-purple-100 dark:fill-purple-900" />
                                <span>Tudo do plano mensal +</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm">
                                <Bot size={14} className="text-purple-500" /> Chat IA & Relatórios Inclusos
                            </li>
                            <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm">
                                <Star size={18} className="text-purple-500 fill-purple-100 dark:fill-purple-900" /> Prioridade no Suporte
                            </li>
                            <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm">
                                <Star size={18} className="text-purple-500 fill-purple-100 dark:fill-purple-900" /> Economia de 2 meses
                            </li>
                        </ul>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 absolute top-8 right-8 flex items-center justify-center ${selectedPlan === 'yearly' ? 'border-purple-500' : 'border-slate-300 dark:border-slate-600'}`}>
                        {selectedPlan === 'yearly' && <div className="w-3 h-3 rounded-full bg-purple-500"></div>}
                    </div>
                </div>
            </div>

            {/* Payment & Security */}
            <div className="max-w-2xl mx-auto bg-slate-50 dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-center gap-8 mb-8 text-slate-400 dark:text-slate-500">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase">
                        <Lock size={14} /> Pagamento Seguro
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase">
                        <ShieldCheck size={14} /> Dados Criptografados
                    </div>
                </div>

                <button
                    onClick={handleSubscribe}
                    disabled={isLoading}
                    className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 ${selectedPlan === 'yearly'
                        ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200 dark:shadow-none'
                        : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 dark:shadow-none'
                        }`}
                >
                    {isLoading ? (
                        "Processando..."
                    ) : (
                        <>
                            Assinar Agora <ArrowRight />
                        </>
                    )}
                </button>
                <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-4">
                    Ao assinar, você concorda com nossos Termos de Uso. Renovação automática.
                </p>
            </div>

            {/* Cancel Button */}
            <div className="mt-16 text-center">
                <button
                    onClick={() => {
                        setCancelConfirmation('');
                        setShowCancelModal(true);
                    }}
                    className="text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400 text-sm font-medium transition-colors border-b border-transparent hover:border-red-200 pb-0.5"
                >
                    Cancelar Assinatura
                </button>
            </div>

            {/* MODAL DE CONFIRMAÇÃO DE CANCELAMENTO */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-md border border-red-100 dark:border-red-900/30">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-xl">
                                    <AlertTriangle className="text-red-600 dark:text-red-400 w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cancelar Assinatura?</h3>
                            </div>
                            <button onClick={() => setShowCancelModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                Você perderá acesso às funcionalidades <strong>Premium</strong> imediatamente. Para confirmar, digite a palavra <strong className="text-red-600 dark:text-red-400 select-all">cancelar</strong> abaixo:
                            </p>

                            <div>
                                <input
                                    type="text"
                                    value={cancelConfirmation}
                                    onChange={(e) => setCancelConfirmation(e.target.value)}
                                    placeholder="Digite 'cancelar'"
                                    className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none font-bold text-slate-700 dark:text-slate-200 placeholder:font-normal placeholder:text-slate-400 transition-all bg-white dark:bg-slate-950"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowCancelModal(false)}
                                    className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Voltar
                                </button>
                                <button
                                    onClick={handleCancelProcess}
                                    disabled={cancelConfirmation.toLowerCase() !== 'cancelar'}
                                    className={`flex-1 font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${cancelConfirmation.toLowerCase() === 'cancelar'
                                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-200 dark:shadow-none cursor-pointer active:scale-95'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                                        }`}
                                >
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};