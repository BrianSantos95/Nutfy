import { Student } from '../types';
import { storageService } from './storageService';

export interface MonthlyStats {
    totalActive: number;
    newStudents: number;
    churned: number;
    renewals: number;
    growthRate: number; // Percentual vs mês anterior
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
}

export const reportService = {
    
    getStats: (targetMonth: number, targetYear: number): MonthlyStats => {
        const allStudents = storageService.getStudents();
        const stats: MonthlyStats = {
            totalActive: 0,
            newStudents: 0,
            churned: 0,
            renewals: 0,
            growthRate: 0,
            studentsList: { new: [], churned: [], renewed: [], active: [] },
            chartData: { evolution: [], movement: [] },
            expiringSoon: []
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

            // Se não tiver data de início explícita, usa a data de criação
            const pStart = student.planStartDate ? new Date(student.planStartDate) : new Date(student.createdAt);
            pStart.setHours(0, 0, 0, 0);

            const pEnd = new Date(student.planEndDate);
            pEnd.setHours(23, 59, 59, 999);

            // LÓGICA DE INTERSEÇÃO DE DATAS:
            // O plano é ativo se:
            // 1. O início do plano é anterior ou igual ao fim do mês.
            // 2. O fim do plano é posterior ou igual ao início do mês.
            return pStart <= periodEnd && pEnd >= periodStart;
        };

        // 1. Processar Mês Atual (KPIs Principais)
        allStudents.forEach(s => {
            const planStart = s.planStartDate ? new Date(s.planStartDate) : new Date(s.createdAt);
            planStart.setHours(0, 0, 0, 0);
            
            const planEnd = s.planEndDate ? new Date(s.planEndDate) : null;
            if (planEnd) planEnd.setHours(23, 59, 59, 999);

            const createdAt = new Date(s.createdAt);
            createdAt.setHours(0, 0, 0, 0);

            // ATIVO: Usa a lógica rigorosa de interseção de datas
            if (isStudentActiveInPeriod(s, startOfMonth, endOfMonth)) {
                stats.totalActive++;
                stats.studentsList.active.push(s);
            }

            // NOVOS: Criados dentro do mês selecionado
            if (createdAt >= startOfMonth && createdAt <= endOfMonth) {
                stats.newStudents++;
                stats.studentsList.new.push(s);
            }
            
            // RENOVAÇÕES: O plano começou neste mês, mas o aluno é antigo (criado antes deste mês)
            else if (planStart >= startOfMonth && planStart <= endOfMonth && createdAt < startOfMonth) {
                stats.renewals++;
                stats.studentsList.renewed.push(s);
            }

            // SAÍDAS (Churn): O plano termina DENTRO deste mês E já passou da data de hoje (venceu e não foi renovado/alterado)
            if (planEnd && planEnd >= startOfMonth && planEnd <= endOfMonth && planEnd < today) {
                stats.churned++;
                stats.studentsList.churned.push(s);
            }
        });

        // 2. Calcular Crescimento vs Mês Anterior
        // Recalcular ativos do mês anterior usando a mesma lógica rigorosa
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

        // 3. Dados para Gráficos (Últimos 12 meses)
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

                // Gráfico Evolução: Ativos no mês histórico
                if (isStudentActiveInPeriod(s, mStart, mEnd)) {
                    activeCount++;
                }

                // Gráfico Movimento: Entradas (Início do plano cai no mês)
                if (pStart >= mStart && pStart <= mEnd) {
                    inCount++;
                }

                // Gráfico Movimento: Saídas (Fim do plano cai no mês e já passou)
                if (pEnd && pEnd >= mStart && pEnd <= mEnd && pEnd < today) {
                    outCount++;
                }
            });

            stats.chartData.evolution.push({ month: monthLabel, active: activeCount });
            stats.chartData.movement.push({ month: monthLabel, in: inCount, out: outCount });
        }

        // 4. Projeção (Vencendo nos próximos 30 dias a partir de HOJE)
        const next30Days = new Date();
        next30Days.setDate(today.getDate() + 30);
        
        stats.expiringSoon = allStudents.filter(s => {
            if (!s.planEndDate) return false;
            const end = new Date(s.planEndDate);
            end.setHours(23, 59, 59, 999);
            // Vence entre hoje e daqui 30 dias
            return end >= today && end <= next30Days;
        }).sort((a,b) => new Date(a.planEndDate!).getTime() - new Date(b.planEndDate!).getTime());

        return stats;
    }
};