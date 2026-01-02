import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Meal, Student, Assessment, ProfessionalProfile } from '../types';
import { storageService } from '../services/storageService';
import { generatePDF } from '../services/pdfService';
import { FileDown, Edit2, Loader2, User, RefreshCw } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

export const PlanPreview: React.FC = () => {
  const navigate = useNavigate();
  const { studentId, assessmentId } = useParams();

  const [student, setStudent] = useState<Student | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchData = async () => {
      if (studentId && assessmentId) {
        const students = await storageService.getStudents();
        setStudent(students.find(s => s.id === studentId) || null);

        const assessments = await storageService.getAssessments(studentId);
        setAssessment(assessments.find(a => a.id === assessmentId) || null);

        const allMeals = await storageService.getMeals(assessmentId);
        setMeals(allMeals.sort((a, b) => a.time.localeCompare(b.time)));
      }
      const prof = await storageService.getProfile();
      setProfile(prof);
    };
    fetchData();
  }, [studentId, assessmentId]);

  const handleExport = () => {
    // 1. Validação de Perfil (Apenas o nome é obrigatório)
    if (!profile || !profile.name) {
      showNotification("Configure seu nome no Perfil antes de gerar o PDF.", "error");
      navigate('/profile');
      return;
    }

    // 2. Validação de Dados do Aluno e Refeições
    if (!student || !student.name || meals.length === 0) {
      showNotification("Verifique se há refeições cadastradas antes de gerar o PDF.", "error");
      return;
    }

    setIsGenerating(true);

    // Pequeno delay para permitir que o React renderize o estado de loading
    setTimeout(() => {
      try {
        const success = generatePDF(student, assessment!, meals, profile);
        if (success) {
          // Sucesso
          showNotification("PDF gerado com sucesso!", "success");
          navigate(`/student/${studentId}/success`);
        } else {
          // Falha retornada pela função
          showNotification("Erro ao gerar o PDF. Tente novamente.", "error");
        }
      } catch (e) {
        console.error("Critical PDF Error:", e);
        showNotification("Erro ao gerar o PDF. Tente novamente.", "error");
      } finally {
        setIsGenerating(false);
      }
    }, 500);
  };

  if (!student || !assessment) return null;

  const totalCalories = meals.filter(m => m.type === 'normal').reduce((acc, curr) => acc + curr.calories, 0);

  return (
    <Layout title="Prévia do Plano" showBack backPath={`/student/${studentId}/assessment/${assessmentId}/meals`}>
      <div className="flex flex-col lg:flex-row gap-8 pb-20">

        <div className="w-full lg:w-1/3 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Resumo da Avaliação</h3>
            <div className="space-y-4">
              <div className="text-xl font-bold text-slate-900 dark:text-white">{student.name}</div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 uppercase">Peso</div>
                  <div className="font-medium text-slate-900 dark:text-slate-200">{assessment.weight} kg</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 uppercase">Altura</div>
                  <div className="font-medium text-slate-900 dark:text-slate-200">{assessment.height} cm</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 uppercase">Meta</div>
                  <div className="font-medium text-emerald-600 dark:text-emerald-400">{assessment.calorieGoal} kcal</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 uppercase">Planejado</div>
                  <div className={`font-medium ${totalCalories > assessment.calorieGoal ? 'text-red-500 dark:text-red-400' : 'text-slate-900 dark:text-slate-200'}`}>{totalCalories} kcal</div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={isGenerating}
            className="w-full py-4 bg-[#2A7F5F] hover:bg-[#236c50] disabled:bg-slate-400 disabled:cursor-not-allowed text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-emerald-900/10"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" /> Gerando PDF...
              </>
            ) : (
              <>
                <FileDown /> Exportar PDF
              </>
            )}
          </button>
        </div>

        <div className="w-full lg:w-2/3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
          <h3 className="font-bold text-slate-700 dark:text-white mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">Refeições Planejadas</h3>
          <div className="space-y-8">
            {meals.map(meal => (
              <div key={meal.id} className="border-b border-slate-50 dark:border-slate-800 last:border-0 pb-6 last:pb-0">
                {/* Meal Header */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-lg font-bold text-sm">
                      {meal.time}
                    </div>
                    <span className="font-bold text-slate-800 dark:text-white text-lg">{meal.name}</span>
                  </div>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${meal.type === 'free' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'}`}>
                    {meal.type === 'free' ? 'Livre' : `${meal.calories} kcal`}
                  </span>
                </div>

                {/* Food List */}
                <div className="pl-4 md:pl-14">
                  {meal.foods && meal.foods.length > 0 ? (
                    <div className="space-y-4">
                      {meal.foods.map((food, idx) => (
                        <div key={idx} className="flex flex-col">
                          {/* Main Food Item */}
                          <div className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></div>
                            <span>
                              <span className="font-bold text-slate-900 dark:text-white">{food.quantity}</span> {food.name}
                            </span>
                          </div>

                          {/* Substitution */}
                          {food.substitutions && (
                            <div className="pl-5 mt-1.5">
                              <div className="inline-flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400">
                                <RefreshCw size={10} className="text-emerald-500" />
                                <span className="font-bold text-emerald-600 dark:text-emerald-500 uppercase text-[10px]">Ou:</span>
                                <span className="italic">{food.substitutions}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                      {meal.description || "Nenhuma descrição informada."}
                    </div>
                  )}

                  {/* Extra Notes for Meal */}
                  {meal.description && meal.foods && meal.foods.length > 0 && (
                    <div className="mt-4 text-xs text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-800/30 p-3 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
                      <span className="font-bold uppercase mr-1">Obs:</span> {meal.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};