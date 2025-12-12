import { Student } from '../types';
import { storageService } from './storageService';

export interface TimelineEvent {
    date: Date;
    type: 'new_student' | 'assessment' | 'renewal' | 'churn';
    title: string;
    description: string;
}

export interface MonthlyStats {
    totalActive: number;
    newStudents: number;
    churned: number;
    renewals: number;
    growthRate: number; // Percentual vs mês anterior
    totalAssessments: number; // Novo: Quantidade de avaliações
    totalPlans: number; // Novo: Quantidade de planos (baseado em avaliações ativas ou refeições)
    studentsList: {
        new: Student[];
        churned: Student[];
        renewed: Student[];
        active: Student[];
    };
    chartData: {
        evolution: { month: string; active: number }[];
        movement: { month: string; in: number; out: number }[];
    };
    expiringSoon: Student[];
    timeline: TimelineEvent[]; // Novo: Linha do tempo
}

export const reportService = {
    
    getStats: async (targetMonth: number, targetYear: number): Promise<MonthlyStats> => {
        const allStudents = await storageService.getStudents();
        const allAssessments = await storageService.getAssessments(); // Assume que pega todas de todos os alunos se não passar ID
        
        const stats: MonthlyStats = {
            totalActive: 0,
            newStudents: 0,
            churned: 0,
            renewals: 0,
            growthRate: 0,
            totalAssessments: 0,
            totalPlans: 0,
            studentsList: { new: [], churned: [], renewed: [], active: [] },
            chartData: { evolution: [], movement: [] },
            expiringSoon: [],
            timeline: []
        };

        // Datas de referência do Mês Selecionado
        const startOfMonth = new Date(targetYear, targetMonth, 1);
        startOfMonth.setHours(0, 0, 0, 0);

        const endOfMonth = new Date(targetYear, targetMonth + 1, 0); // Último dia do mês
        endOfMonth.setHours(23, 59, 59, 999);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Helper para checar se um aluno estava ativo em um determinado período
        const isStudentActiveInPeriod = (student: Student, periodStart: Date, periodEnd: Date) => {
            if (!student.planEndDate) return false;
            const pStart = student.planStartDate ? new Date(student.planStartDate) : new Date(student.createdAt);
            pStart.setHours(0, 0, 0, 0);
            const pEnd = new Date(student.planEndDate);
            pEnd.setHours(23, 59, 59, 999);
            return pStart <= periodEnd && pEnd >= periodStart;
        };

        // 1. Processar Alunos (KPIs e Timeline)
        allStudents.forEach(s => {
            const planStart = s.planStartDate ? new Date(s.planStartDate) : new Date(s.createdAt);
            planStart.setHours(0, 0, 0, 0);
            
            const planEnd = s.planEndDate ? new Date(s.planEndDate) : null;
            if (planEnd) planEnd.setHours(23, 59, 59, 999);

            const createdAt = new Date(s.createdAt);
            createdAt.setHours(0, 0, 0, 0);

            // ATIVO
            if (isStudentActiveInPeriod(s, startOfMonth, endOfMonth)) {
                stats.totalActive++;
                stats.studentsList.active.push(s);
            }

            // NOVOS (Timeline Event)
            if (createdAt >= startOfMonth && createdAt <= endOfMonth) {
                stats.newStudents++;
                stats.studentsList.new.push(s);
                stats.timeline.push({
                    date: createdAt,
                    type: 'new_student',
                    title: 'Novo Paciente',
                    description: `${s.name} iniciou o acompanhamento.`
                });
            }
            
            // RENOVAÇÕES (Timeline Event)
            else if (planStart >= startOfMonth && planStart <= endOfMonth && createdAt < startOfMonth) {
                stats.renewals++;
                stats.studentsList.renewed.push(s);
                stats.timeline.push({
                    date: planStart,
                    type: 'renewal',
                    title: 'Renovação de Plano',
                    description: `Plano de ${s.name} renovado.`
                });
            }

            // SAÍDAS
            if (planEnd && planEnd >= startOfMonth && planEnd <= endOfMonth && planEnd < today) {
                stats.churned++;
                stats.studentsList.churned.push(s);
                stats.timeline.push({
                    date: planEnd,
                    type: 'churn',
                    title: 'Encerramento de Plano',
                    description: `Vencimento do plano de ${s.name}.`
                });
            }
        });

        // 2. Processar Avaliações e Planos (KPIs e Timeline)
        // Precisamos filtrar avaliações que ocorreram neste mês
        // Nota: getAssessments() sem argumento deve retornar TODAS as avaliações no storageService atualizado, 
        // ou precisamos iterar alunos. O mock atual em storageService.ts pega todas se não passar ID.
        // Se a implementação real for diferente, precisaria ajustar. Assumindo que retorna todas array.
        
        allAssessments.forEach(a => {
            const aDate = new Date(a.date);
            if (aDate >= startOfMonth && aDate <= endOfMonth) {
                stats.totalAssessments++;
                stats.totalPlans++; // Assumindo 1 plano por avaliação neste modelo simplificado
                
                // Encontrar nome do aluno
                const studentName = allStudents.find(s => s.id === a.studentId)?.name || 'Paciente';

                stats.timeline.push({
                    date: aDate,
                    type: 'assessment',
                    title: 'Avaliação Realizada',
                    description: `Avaliação física de ${studentName}.`
                });
            }
        });

        // Ordenar Timeline
        stats.timeline.sort((a, b) => a.date.getTime() - b.date.getTime());


        // 3. Calcular Crescimento vs Mês Anterior
        const startOfPrevMonth = new Date(targetYear, targetMonth - 1, 1);
        startOfPrevMonth.setHours(0, 0, 0, 0);
        const endOfPrevMonth = new Date(targetYear, targetMonth, 0);
        endOfPrevMonth.setHours(23, 59, 59, 999);

        let prevActive = 0;
        allStudents.forEach(s => {
            if (isStudentActiveInPeriod(s, startOfPrevMonth, endOfPrevMonth)) {
                prevActive++;
            }
        });

        if (prevActive > 0) {
            stats.growthRate = ((stats.totalActive - prevActive) / prevActive) * 100;
        } else if (stats.totalActive > 0) {
            stats.growthRate = 100;
        }

        // 4. Dados para Gráficos (Últimos 12 meses)
        for (let i = 11; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const y = d.getFullYear();
            const m = d.getMonth();
            const monthLabel = d.toLocaleDateString('pt-BR', { month: 'short' });
            
            const mStart = new Date(y, m, 1);
            mStart.setHours(0, 0, 0, 0);
            const mEnd = new Date(y, m + 1, 0);
            mEnd.setHours(23, 59, 59, 999);

            let activeCount = 0;
            let inCount = 0;
            let outCount = 0;
            
            allStudents.forEach(s => {
                const pStart = s.planStartDate ? new Date(s.planStartDate) : new Date(s.createdAt);
                pStart.setHours(0,0,0,0);
                const pEnd = s.planEndDate ? new Date(s.planEndDate) : null;
                if (pEnd) pEnd.setHours(23,59,59,999);

                if (isStudentActiveInPeriod(s, mStart, mEnd)) activeCount++;
                if (pStart >= mStart && pStart <= mEnd) inCount++;
                if (pEnd && pEnd >= mStart && pEnd <= mEnd && pEnd < today) outCount++;
            });

            stats.chartData.evolution.push({ month: monthLabel, active: activeCount });
            stats.chartData.movement.push({ month: monthLabel, in: inCount, out: outCount });
        }

        // 5. Projeção (Vencendo nos próximos 30 dias)
        const next30Days = new Date();
        next30Days.setDate(today.getDate() + 30);
        stats.expiringSoon = allStudents.filter(s => {
            if (!s.planEndDate) return false;
            const end = new Date(s.planEndDate);
            end.setHours(23, 59, 59, 999);
            return end >= today && end <= next30Days;
        }).sort((a,b) => new Date(a.planEndDate!).getTime() - new Date(b.planEndDate!).getTime());

        return stats;
    }
};