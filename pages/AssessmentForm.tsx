import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Assessment } from '../types';
import { storageService } from '../services/storageService';
import { Scale, Ruler, Flame, Save, Activity, Target } from 'lucide-react';

export const AssessmentForm: React.FC = () => {
    const navigate = useNavigate();
    const { studentId, assessmentId } = useParams();
    const isEditing = !!assessmentId && assessmentId !== 'new';

    const [formData, setFormData] = useState<Partial<Assessment>>({
        weight: undefined,
        height: undefined,
        bodyFat: undefined,
        calorieGoal: undefined,
        objective: '',
        notes: '',
        date: new Date().toISOString().split('T')[0]
    });

    const [isOtherObjective, setIsOtherObjective] = useState(false);
    
    const standardObjectives = [
        "Emagrecimento",
        "Hipertrofia",
        "Reeducação Alimentar",
        "Saúde Geral",
        "Ganho de Energia"
    ];

    useEffect(() => {
        const load = async () => {
            if (isEditing && assessmentId) {
                const all = await storageService.getAssessments(studentId);
                const found = all.find(a => a.id === assessmentId);
                if (found) {
                    setFormData({
                        ...found,
                        date: new Date(found.date).toISOString().split('T')[0] // Formata para input date
                    });
                    
                    // Verifica se o objetivo é padrão ou personalizado
                    if (found.objective && !standardObjectives.includes(found.objective)) {
                        setIsOtherObjective(true);
                    }
                }
            }
        };
        load();
    }, [assessmentId, studentId, isEditing]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.weight || !formData.height || !formData.calorieGoal) {
            alert("Peso, Altura e Meta Calórica são obrigatórios.");
            return;
        }

        const payload: Assessment = {
            id: isEditing && assessmentId ? assessmentId : crypto.randomUUID(),
            studentId: studentId!,
            date: formData.date || new Date().toISOString(),
            weight: Number(formData.weight),
            height: Number(formData.height),
            bodyFat: formData.bodyFat ? Number(formData.bodyFat) : undefined,
            calorieGoal: Number(formData.calorieGoal),
            objective: formData.objective,
            notes: formData.notes,
            status: 'active' // A nova avaliação se torna a ativa
        };

        await storageService.saveAssessment(payload);
        
        // Se for nova avaliação, redireciona para criar o plano (Refeições)
        // Se for edição, volta para o dashboard do aluno
        if (!isEditing) {
            if(confirm("Avaliação registrada! Deseja montar o plano alimentar agora?")) {
                navigate(`/student/${studentId}/assessment/${payload.id}/meals`);
            } else {
                navigate(`/student/${studentId}/progress`);
            }
        } else {
            navigate(`/student/${studentId}/progress`);
        }
    };

    return (
        <Layout title={isEditing ? "Editar Avaliação" : "Nova Avaliação"} showBack backPath={`/student/${studentId}/progress`}>
            <div className="max-w-2xl mx-auto pb-20">
                <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 space-y-8">
                    
                    <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                        <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-xl">
                            <Activity className="text-purple-600 dark:text-purple-400 w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Dados da Avaliação</h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Registre as medidas atuais para calcular a dieta.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Data da Avaliação</label>
                            <input 
                                type="date" 
                                value={formData.date}
                                onChange={e => setFormData({...formData, date: e.target.value})}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                                required 
                            />
                        </div>
                        <div></div> {/* Spacer */}

                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Peso (kg) *</label>
                            <div className="relative">
                                <Scale className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input 
                                    type="number" step="0.1"
                                    value={formData.weight || ''}
                                    onChange={e => setFormData({...formData, weight: parseFloat(e.target.value)})}
                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-white"
                                    placeholder="0.0" required 
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Altura (cm) *</label>
                            <div className="relative">
                                <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input 
                                    type="number"
                                    value={formData.height || ''}
                                    onChange={e => setFormData({...formData, height: parseFloat(e.target.value)})}
                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-white"
                                    placeholder="000" required 
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">% Gordura (Opcional)</label>
                            <input 
                                type="number" step="0.1"
                                value={formData.bodyFat || ''}
                                onChange={e => setFormData({...formData, bodyFat: parseFloat(e.target.value)})}
                                className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-white"
                                placeholder="0.0%" 
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Meta Calórica (kcal) *</label>
                            <div className="relative">
                                <Flame className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 w-5 h-5" />
                                <input 
                                    type="number"
                                    value={formData.calorieGoal || ''}
                                    onChange={e => setFormData({...formData, calorieGoal: parseFloat(e.target.value)})}
                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-slate-900 dark:text-white"
                                    placeholder="2000" required 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                         <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Objetivo da Dieta</label>
                            <div className="relative">
                                <Target className="absolute left-3 top-3.5 text-slate-400 w-5 h-5 z-10" />
                                <select 
                                    value={isOtherObjective ? 'Outro' : formData.objective || ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === 'Outro') {
                                            setIsOtherObjective(true);
                                            setFormData({...formData, objective: ''});
                                        } else {
                                            setIsOtherObjective(false);
                                            setFormData({...formData, objective: val});
                                        }
                                    }}
                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-white appearance-none cursor-pointer"
                                >
                                    <option value="">Selecione...</option>
                                    {standardObjectives.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                    <option value="Outro">Outro</option>
                                </select>
                                <div className="absolute right-4 top-4 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-400"></div>
                            </div>

                            {/* Campo de texto condicional se 'Outro' for selecionado */}
                            {isOtherObjective && (
                                <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                                    <input 
                                        type="text"
                                        value={formData.objective || ''}
                                        onChange={e => setFormData({...formData, objective: e.target.value})}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-white"
                                        placeholder="Especifique o objetivo..."
                                        autoFocus
                                    />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Observações da Avaliação</label>
                            <textarea
                                rows={3}
                                value={formData.notes || ''}
                                onChange={e => setFormData({...formData, notes: e.target.value})}
                                className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none resize-none text-slate-900 dark:text-white"
                                placeholder="Detalhes sobre a condição física atual..."
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-purple-200 dark:shadow-none transition-all active:scale-95 flex items-center gap-2">
                            <Save size={20} />
                            Salvar Avaliação
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};