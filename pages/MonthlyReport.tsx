import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { reportService, MonthlyStats } from '../services/reportService';
import { storageService } from '../services/storageService';
import { Student, ProfessionalProfile } from '../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
    Users, TrendingUp, UserPlus, UserMinus, RefreshCw, Calendar, 
    Download, ChevronRight, Filter, AlertCircle, X, ArrowUpRight, ArrowDownRight, RotateCcw, Activity
} from 'lucide-react';

// --- COMPONENTES DE GRÁFICO SVG ---
const CustomLineChart = ({ data }: { data: { month: string; active: number }[] }) => {
    if (!data || data.length === 0) return null;
    const maxVal = Math.max(...data.map(d => d.active)) || 10;
    
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((d.active / maxVal) * 100);
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="w-full h-[200px] flex flex-col justify-end relative">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-[150px] overflow-visible">
                 <line x1="0" y1="0" x2="100" y2="0" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2" />
                 <line x1="0" y1="50" x2="100" y2="50" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2" />
                 <line x1="0" y1="100" x2="100" y2="100" stroke="#e2e8f0" strokeWidth="0.5" />
                 
                 <defs>
                    <linearGradient id="gradientActive" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                 </defs>
                 <path d={`M0,100 ${points.split(' ').map(p => `L${p}`).join(' ')} L100,100 Z`} fill="url(#gradientActive)" />
                 <polyline points={points} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                 
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
                            <div style={{ height: `${hIn}%` }} className="w-2 bg-blue-500 rounded-t-sm transition-all group-hover:bg-blue-600 relative"></div>
                            <div style={{ height: `${hOut}%` }} className="w-2 bg-red-400 rounded-t-sm transition-all group-hover:bg-red-500 relative"></div>
                        </div>
                        <span className="text-[10px] text-slate-400">{d.month[0]}</span>
                    </div>
                );
            })}
        </div>
    );
};

// --- CORES DO RELATÓRIO (NEUTRO/PROFISSIONAL) ---
const COLORS = {
    bg: [248, 249, 252],        // #F8F9FC
    white: [255, 255, 255],     // #FFFFFF
    slate900: [15, 23, 42],     // Texto Principal
    slate600: [71, 85, 105],    // Texto Secundário
    slate400: [148, 163, 184],  // Bordas/Labels
    slate200: [226, 232, 240],  // Linhas sutis
    emerald600: [5, 150, 105],  // Acentos da marca
    emerald50: [236, 253, 245], // Fundos leves
};

export const MonthlyReport: React.FC = () => {
    const [month, setMonth] = useState(new Date().getMonth());
    const [year, setYear] = useState(new Date().getFullYear());
    const [stats, setStats] = useState<MonthlyStats | null>(null);
    const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
    const [modalData, setModalData] = useState<{ title: string; list: Student[], type: string } | null>(null);

    useEffect(() => {
        const load = async () => {
            const data = await reportService.getStats(month, year);
            const prof = await storageService.getProfile();
            setStats(data);
            setProfile(prof);
        };
        load();
    }, [month, year]);

    const handlePrevMonth = () => {
        if (month === 0) { setMonth(11); setYear(prev => prev - 1); } 
        else { setMonth(prev => prev - 1); }
    };

    const handleNextMonth = () => {
        if (month === 11) { setMonth(0); setYear(prev => prev + 1); } 
        else { setMonth(prev => prev + 1); }
    };

    const handleCurrentMonth = () => {
        const now = new Date();
        setMonth(now.getMonth());
        setYear(now.getFullYear());
    };

    const monthNames = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

    const handleExport = () => {
        if (!stats) return;
        const doc = new jsPDF();
        
        // --- HELPER FUNCTIONS ---
        const setFill = (c: number[]) => doc.setFillColor(c[0], c[1], c[2]);
        const setText = (c: number[]) => doc.setTextColor(c[0], c[1], c[2]);
        const setDraw = (c: number[]) => doc.setDrawColor(c[0], c[1], c[2]);
        
        const drawCard = (x: number, y: number, w: number, h: number) => {
            setFill(COLORS.white);
            setDraw(COLORS.slate200);
            doc.setLineWidth(0.1);
            // Simula shadow desenhando um retangulo cinza claro deslocado antes
            doc.setFillColor(241, 245, 249); 
            doc.roundedRect(x + 0.5, y + 0.5, w, h, 3, 3, 'F');
            
            setFill(COLORS.white);
            doc.roundedRect(x, y, w, h, 3, 3, 'FD');
        };

        // --- LAYOUT ---
        // Fundo
        setFill(COLORS.bg);
        doc.rect(0, 0, 210, 297, 'F');

        const margin = 14;
        let currentY = 14;
        const pageWidth = 210;
        const contentWidth = pageWidth - (margin * 2);

        // --- 1. CABEÇALHO (Estilo "Card" Neutro) ---
        const headerH = 36; // Aumentado para caber nome do nutri
        drawCard(margin, currentY, contentWidth, headerH);

        // Logo Nutfy (Simulado Vetorialmente)
        // Circulo Verde
        setFill(COLORS.emerald600);
        doc.circle(margin + 12, currentY + 18, 8, 'F');
        // Letra N
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("N", margin + 12, currentY + 22, { align: 'center' });
        
        // Nome da Marca
        setText(COLORS.slate900);
        doc.setFontSize(16);
        doc.text("Nutfy", margin + 26, currentY + 19);
        
        doc.setFontSize(8);
        setText(COLORS.slate400);
        doc.setFont('helvetica', 'normal');
        doc.text("Gestão Nutricional", margin + 26, currentY + 23);

        // Dados do Nutricionista (No Centro/Direita)
        if (profile?.name) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            setText(COLORS.slate900);
            doc.text(profile.name, pageWidth / 2, currentY + 17, { align: 'center' });

            if (profile.registration) {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                setText(COLORS.slate600);
                doc.text(profile.registration, pageWidth / 2, currentY + 22, { align: 'center' });
            }
        }

        // Titulo do Relatório e Data (Direita)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        setText(COLORS.slate600);
        // Exibir "Relatório - [Mês]/[Ano]"
        const titleText = `RELATÓRIO - ${monthNames[month].toUpperCase()}/${year}`;
        doc.text(titleText, pageWidth - margin - 8, currentY + 15, { align: 'right' });

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        setText(COLORS.slate400);
        doc.text(`Emitido em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth - margin - 8, currentY + 21, { align: 'right' });

        currentY += headerH + 10;

        // --- 2. KPIS (RESUMO) ---
        // Labels
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        setText(COLORS.slate900);
        doc.text("Visão Geral do Mês", margin + 2, currentY);
        currentY += 5;

        // Linha 1: KPIs Principais
        const kpiGap = 6;
        const kpiWidth = (contentWidth - (kpiGap * 3)) / 4;
        const kpiHeight = 28;

        const kpis = [
            { label: "Alunos Ativos", val: stats.totalActive.toString(), change: null },
            { label: "Novas Entradas", val: `+${stats.newStudents}`, change: null },
            { label: "Renovações", val: stats.renewals.toString(), change: null },
            { label: "Crescimento", val: `${stats.growthRate > 0 ? '+' : ''}${stats.growthRate.toFixed(1)}%`, change: true }
        ];

        kpis.forEach((k, i) => {
            const x = margin + (i * (kpiWidth + kpiGap));
            drawCard(x, currentY, kpiWidth, kpiHeight);

            doc.setFontSize(7);
            doc.setFont('helvetica', 'bold');
            setText(COLORS.slate400);
            doc.text(k.label.toUpperCase(), x + 4, currentY + 8);

            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            setText(COLORS.slate900);
            if (k.change) {
                if (stats.growthRate >= 0) setText(COLORS.emerald600);
                else setText([239, 68, 68]);
            }
            doc.text(k.val, x + 4, currentY + 20);
        });

        currentY += kpiHeight + 6;

        // Linha 2: KPIs de Produção (Avaliações e Planos)
        const prodKpiWidth = (contentWidth - kpiGap) / 2;
        const prodKpiHeight = 22;

        const prodKpis = [
            { label: "Avaliações Realizadas", val: stats.totalAssessments.toString() },
            { label: "Planos Alimentares Gerados", val: stats.totalPlans.toString() }
        ];

        prodKpis.forEach((k, i) => {
             const x = margin + (i * (prodKpiWidth + kpiGap));
             drawCard(x, currentY, prodKpiWidth, prodKpiHeight);

             // Icone (Bullet)
             setFill(COLORS.emerald600);
             doc.circle(x + 8, currentY + 11, 2, 'F');

             doc.setFontSize(9);
             doc.setFont('helvetica', 'normal');
             setText(COLORS.slate600);
             doc.text(k.label, x + 14, currentY + 14); // Alinhado verticalmente

             // Valor à direita
             doc.setFontSize(12);
             doc.setFont('helvetica', 'bold');
             setText(COLORS.slate900);
             doc.text(k.val, x + prodKpiWidth - 8, currentY + 14, { align: 'right' });
        });

        currentY += prodKpiHeight + 15;

        // --- 3. TABELAS ---
        const drawTableSection = (title: string, headers: string[], data: any[][], emptyMsg: string) => {
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            setText(COLORS.slate900);
            doc.text(title, margin + 2, currentY);
            currentY += 4;

            if (data.length > 0) {
                autoTable(doc, {
                    startY: currentY,
                    head: [headers],
                    body: data,
                    theme: 'plain',
                    headStyles: { 
                        fillColor: [255, 255, 255], 
                        textColor: COLORS.slate900, 
                        fontStyle: 'bold',
                        lineWidth: { bottom: 0.5 },
                        lineColor: COLORS.slate200
                    },
                    styles: { 
                        fontSize: 9, 
                        cellPadding: 4, 
                        textColor: COLORS.slate600,
                        valign: 'middle'
                    },
                    columnStyles: {
                        0: { fontStyle: 'bold', textColor: COLORS.slate900 }
                    },
                    alternateRowStyles: { 
                        fillColor: [249, 250, 251]
                    },
                    margin: { left: margin, right: margin },
                });
                currentY = (doc as any).lastAutoTable.finalY + 12;
            } else {
                drawCard(margin, currentY, contentWidth, 15);
                doc.setFontSize(9);
                doc.setFont('helvetica', 'italic');
                setText(COLORS.slate400);
                doc.text(emptyMsg, margin + contentWidth/2, currentY + 9, { align: 'center' });
                currentY += 25;
            }
        };

        // Table 1: Entradas
        drawTableSection(
            "Novos Contratos no Mês",
            ['Paciente', 'Contato', 'Início', 'Vencimento'],
            stats.studentsList.new.map(s => [
                s.name, 
                s.contact || '-', 
                s.planStartDate ? new Date(s.planStartDate).toLocaleDateString('pt-BR') : '-',
                s.planEndDate ? new Date(s.planEndDate).toLocaleDateString('pt-BR') : '-'
            ]),
            "Nenhuma nova entrada registrada neste mês."
        );

        // --- 4. LINHA DO TEMPO (Timeline) ---
        // Verificar quebra de página
        if (currentY > 200) { doc.addPage(); setFill(COLORS.bg); doc.rect(0,0,210,297,'F'); currentY = 20; }

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        setText(COLORS.slate900);
        doc.text("Linha do Tempo do Mês", margin + 2, currentY);
        currentY += 8;

        // Card Container para Timeline
        const timelineH = Math.max(40, (stats.timeline.length * 15) + 20);
        // Se timeline for muito grande, limita ou quebra página. Por enquanto desenhamos direto.
        // Fundo Branco da Timeline
        drawCard(margin, currentY, contentWidth, timelineH);

        // Linha Vertical
        const lineX = margin + 35;
        const lineTop = currentY + 15;
        const lineBottom = currentY + timelineH - 15;
        
        setDraw(COLORS.slate200);
        doc.setLineWidth(0.5);
        doc.line(lineX, lineTop, lineX, lineBottom);

        if (stats.timeline.length === 0) {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'italic');
            setText(COLORS.slate400);
            doc.text("Nenhum evento registrado.", margin + contentWidth/2, currentY + timelineH/2, { align: 'center' });
        } else {
            let eventY = lineTop;
            stats.timeline.forEach((evt) => {
                // Dot
                setFill(COLORS.emerald600);
                doc.circle(lineX, eventY, 1.5, 'F');

                // Data (Esquerda)
                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                setText(COLORS.slate600);
                const dayStr = evt.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                doc.text(dayStr, lineX - 6, eventY + 1, { align: 'right' });

                // Titulo (Direita)
                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                setText(COLORS.slate900);
                doc.text(evt.title, lineX + 10, eventY);

                // Descrição (Direita abaixo)
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                setText(COLORS.slate400);
                doc.text(evt.description, lineX + 10, eventY + 4);

                eventY += 14; // Espaçamento entre eventos
            });
        }
        
        currentY += timelineH + 15;

        // --- RODAPÉ ---
        const pageCount = doc.getNumberOfPages();
        for(let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            setText(COLORS.slate400);
            const footerText = `Nutfy App - Relatório Gerado em ${new Date().toLocaleDateString('pt-BR')}`;
            doc.text(footerText, margin, 290);
            doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, 290, { align: 'right' });
        }

        doc.save(`Relatorio-Nutfy-${monthNames[month]}-${year}.pdf`);
    };

    if (!stats) return null;

    return (
        <Layout title="Relatório Mensal">
            
            {/* 1. Filter Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-8 gap-4">
                <div className="flex items-center gap-3">
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

                    <button 
                       onClick={handleCurrentMonth}
                       className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl font-bold transition-colors shadow-sm" title="Mês Atual"
                    >
                        <RotateCcw size={20} />
                    </button>
                </div>

                <div className="flex gap-3">
                    <button 
                       onClick={handleExport}
                       className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-lg shadow-slate-200 dark:shadow-slate-900/50"
                    >
                        <Download size={18} /> Exportar Relatório PDF
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

            {/* Extra Stats Cards (Visualização na Tela também) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                     <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-2xl text-purple-600 dark:text-purple-400">
                         <Activity size={24} />
                     </div>
                     <div>
                         <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.totalAssessments}</h3>
                         <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Avaliações Realizadas</p>
                     </div>
                 </div>
                 <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
                     <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-2xl text-orange-600 dark:text-orange-400">
                         <Download size={24} />
                     </div>
                     <div>
                         <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.totalPlans}</h3>
                         <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Planos Gerados</p>
                     </div>
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
                                    // Adicionada correção de timezone T12:00:00
                                    const end = new Date(student.planEndDate! + 'T12:00:00');
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
                <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center mb-10">
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
                                                {/* Adicionada correção de timezone T12:00:00 */}
                                                {new Date(s.planEndDate! + 'T12:00:00').toLocaleDateString('pt-BR')}
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