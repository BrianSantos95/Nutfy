import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { reportService, MonthlyStats } from '../services/reportService';
import { Student } from '../types';
import { jsPDF } from 'jspdf';
import { 
    Users, TrendingUp, UserPlus, UserMinus, RefreshCw, Calendar, 
    Download, ChevronRight, Filter, AlertCircle, X, ArrowUpRight, ArrowDownRight, RotateCcw
} from 'lucide-react';

// --- COMPONENTES DE GRÁFICO SVG (Customizados para leveza) ---

const CustomLineChart = ({ data }: { data: { month: string; active: number }[] }) => {
    if (!data || data.length === 0) return null;
    const maxVal = Math.max(...data.map(d => d.active)) || 10;
    
    // Calcular pontos
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((d.active / maxVal) * 100);
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="w-full h-[200px] flex flex-col justify-end relative">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-[150px] overflow-visible">
                 {/* Grid Lines */}
                 <line x1="0" y1="0" x2="100" y2="0" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2" />
                 <line x1="0" y1="50" x2="100" y2="50" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2" />
                 <line x1="0" y1="100" x2="100" y2="100" stroke="#e2e8f0" strokeWidth="0.5" />
                 
                 {/* Area Gradient */}
                 <defs>
                    <linearGradient id="gradientActive" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                 </defs>
                 <path d={`M0,100 ${points.split(' ').map(p => `L${p}`).join(' ')} L100,100 Z`} fill="url(#gradientActive)" />

                 {/* Line */}
                 <polyline points={points} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                 
                 {/* Dots */}
                 {data.map((d, i) => {
                     const x = (i / (data.length - 1)) * 100;
                     const y = 100 - ((d.active / maxVal) * 100);
                     return (
                         <circle key={i} cx={x} cy={y} r="1.5" className="fill-emerald-600 stroke-white stroke-[0.5]" vectorEffect="non-scaling-stroke">
                             <title>{d.month}: {d.active}</title>
                         </circle>
                     );
                 })}
            </svg>
            <div className="flex justify-between mt-2 px-1">
                {data.map((d, i) => (
                    <span key={i} className="text-[10px] text-slate-400">{d.month[0]}</span>
                ))}
            </div>
        </div>
    );
};

const CustomBarChart = ({ data }: { data: { month: string; in: number; out: number }[] }) => {
    if (!data || data.length === 0) return null;
    const maxVal = Math.max(...data.map(d => Math.max(d.in, d.out))) || 5;

    return (
        <div className="w-full h-[200px] flex items-end justify-between gap-1 pt-6">
            {data.map((d, i) => {
                const hIn = (d.in / maxVal) * 100;
                const hOut = (d.out / maxVal) * 100;
                return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                        <div className="w-full flex gap-0.5 items-end justify-center h-[150px]">
                            {/* Bar IN */}
                            <div 
                                style={{ height: `${hIn}%` }} 
                                className="w-2 bg-blue-500 rounded-t-sm transition-all group-hover:bg-blue-600 relative"
                            ></div>
                            {/* Bar OUT */}
                            <div 
                                style={{ height: `${hOut}%` }} 
                                className="w-2 bg-red-400 rounded-t-sm transition-all group-hover:bg-red-500 relative"
                            ></div>
                        </div>
                        <span className="text-[10px] text-slate-400">{d.month[0]}</span>
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 bg-slate-800 text-white text-[10px] p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                            {d.month}: +{d.in} / -{d.out}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// --- PÁGINA PRINCIPAL ---

export const MonthlyReport: React.FC = () => {
    const [month, setMonth] = useState(new Date().getMonth());
    const [year, setYear] = useState(new Date().getFullYear());
    const [stats, setStats] = useState<MonthlyStats | null>(null);
    const [modalData, setModalData] = useState<{ title: string; list: Student[], type: string } | null>(null);

    useEffect(() => {
        const data = reportService.getStats(month, year);
        setStats(data);
    }, [month, year]);

    const handlePrevMonth = () => {
        if (month === 0) {
            setMonth(11);
            setYear(prev => prev - 1);
        } else {
            setMonth(prev => prev - 1);
        }
    };

    const handleNextMonth = () => {
        if (month === 11) {
            setMonth(0);
            setYear(prev => prev + 1);
        } else {
            setMonth(prev => prev + 1);
        }
    };

    const handleCurrentMonth = () => {
        const now = new Date();
        setMonth(now.getMonth());
        setYear(now.getFullYear());
    };

    const handleExport = () => {
        if (!stats) return;
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text(`Relatório Mensal - Nutfy`, 14, 20);
        
        doc.setFontSize(12);
        doc.text(`Período: ${month + 1}/${year}`, 14, 30);
        
        doc.setFillColor(240, 240, 240);
        doc.rect(14, 40, 180, 40, 'F');
        
        doc.setFontSize(10);
        doc.text(`Alunos Ativos: ${stats.totalActive}`, 20, 50);
        doc.text(`Novos Alunos: ${stats.newStudents}`, 20, 60);
        doc.text(`Renovações: ${stats.renewals}`, 20, 70);
        doc.text(`Saídas: ${stats.churned}`, 100, 50);
        doc.text(`Crescimento: ${stats.growthRate.toFixed(1)}%`, 100, 60);

        doc.save(`Relatorio-Nutfy-${month+1}-${year}.pdf`);
    };

    const monthNames = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

    if (!stats) return null;

    return (
        <Layout title="Relatório Mensal">
            
            {/* 1. Filter Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-8 gap-4">
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500 dark:text-slate-400">
                        <ChevronRight className="rotate-180" size={20} />
                    </button>
                    <div className="flex items-center gap-2 px-4 min-w-[180px] justify-center font-bold text-slate-700 dark:text-slate-200 capitalize">
                        <Calendar size={18} className="text-emerald-500" />
                        {monthNames[month]} de {year}
                    </div>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500 dark:text-slate-400">
                        <ChevronRight size={20} />
                    </button>
                </div>

                <div className="flex gap-3">
                    <button 
                       onClick={handleCurrentMonth}
                       className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl font-bold transition-colors" title="Mês Atual"
                    >
                        <RotateCcw size={20} />
                    </button>
                    <button 
                       onClick={handleExport}
                       className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-lg shadow-slate-200 dark:shadow-slate-900/50"
                    >
                        <Download size={18} /> Exportar Relatório
                    </button>
                </div>
            </div>

            {/* 2. KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                
                {/* Active Students */}
                <div 
                   onClick={() => setModalData({ title: 'Alunos Ativos', list: stats.studentsList.active, type: 'active' })}
                   className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-2xl text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                            <Users size={24} />
                        </div>
                        <div className={`text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 ${stats.growthRate >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {stats.growthRate >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            {Math.abs(stats.growthRate).toFixed(1)}%
                        </div>
                    </div>
                    <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">{stats.totalActive}</h3>
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Alunos Ativos</p>
                </div>

                {/* New Students */}
                <div 
                   onClick={() => setModalData({ title: 'Novos Alunos', list: stats.studentsList.new, type: 'new' })}
                   className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-2xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                            <UserPlus size={24} />
                        </div>
                    </div>
                    <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">+{stats.newStudents}</h3>
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Entradas no Mês</p>
                </div>

                {/* Renewals */}
                <div 
                   onClick={() => setModalData({ title: 'Renovações', list: stats.studentsList.renewed, type: 'renewed' })}
                   className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-2xl text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                            <RefreshCw size={24} />
                        </div>
                    </div>
                    <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">{stats.renewals}</h3>
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Renovações</p>
                </div>

                {/* Churned */}
                <div 
                   onClick={() => setModalData({ title: 'Saídas / Não Renovados', list: stats.studentsList.churned, type: 'churned' })}
                   className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-2xl text-red-500 dark:text-red-400 group-hover:scale-110 transition-transform">
                            <UserMinus size={24} />
                        </div>
                    </div>
                    <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">{stats.churned}</h3>
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Saídas / Não Renovados</p>
                </div>
            </div>

            {/* 3. Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                
                {/* Evolution Chart */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                     <div className="flex items-center gap-3 mb-6">
                        <TrendingUp className="text-emerald-500" size={20} />
                        <h3 className="font-bold text-slate-800 dark:text-white">Evolução da Base (12 Meses)</h3>
                     </div>
                     <CustomLineChart data={stats.chartData.evolution} />
                </div>

                {/* Movement Chart */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                     <div className="flex items-center gap-3 mb-6">
                        <Filter className="text-blue-500" size={20} />
                        <h3 className="font-bold text-slate-800 dark:text-white">Entradas vs Saídas</h3>
                     </div>
                     <CustomBarChart data={stats.chartData.movement} />
                </div>
            </div>

            {/* 4. Expiring Soon List */}
            {stats.expiringSoon.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 mb-20">
                     <div className="flex items-center gap-3 mb-6">
                        <AlertCircle className="text-orange-500" size={20} />
                        <h3 className="font-bold text-slate-800 dark:text-white">Atenção: Vencendo em 30 Dias</h3>
                     </div>
                     
                     <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs uppercase text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                    <th className="pb-4 font-bold pl-4">Paciente</th>
                                    <th className="pb-4 font-bold">Contato</th>
                                    <th className="pb-4 font-bold">Vencimento</th>
                                    <th className="pb-4 font-bold text-right pr-4">Dias Restantes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                {stats.expiringSoon.map(student => {
                                    const end = new Date(student.planEndDate!);
                                    const now = new Date();
                                    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                                    
                                    return (
                                        <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="py-4 pl-4 font-bold text-slate-700 dark:text-slate-200">{student.name}</td>
                                            <td className="py-4 text-slate-500 text-sm">{student.contact || '-'}</td>
                                            <td className="py-4 text-slate-500 text-sm">{end.toLocaleDateString('pt-BR')}</td>
                                            <td className="py-4 pr-4 text-right">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${diff <= 7 ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                                                    {diff} dias
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                     </div>
                </div>
            )}
            
            {!stats.expiringSoon.length && (
                <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center">
                    <p className="text-slate-400 font-medium">Nenhum plano vencendo no próximo mês.</p>
                </div>
            )}

            {/* Modal de Detalhes */}
            {modalData && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-lg border border-slate-100 dark:border-slate-800 max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-6 shrink-0">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{modalData.title}</h3>
                            <button onClick={() => setModalData(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <X size={20}/>
                            </button>
                        </div>
                        
                        <div className="overflow-y-auto pr-2 custom-scrollbar">
                            {modalData.list.length === 0 ? (
                                <p className="text-slate-400 text-center py-8">Nenhum aluno nesta categoria.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {modalData.list.map(s => (
                                        <li key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
                                                    {s.name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{s.name}</p>
                                                    <p className="text-xs text-slate-500">{s.contact || 'Sem contato'}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs text-slate-400 font-mono">
                                                {new Date(s.planEndDate!).toLocaleDateString('pt-BR')}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};