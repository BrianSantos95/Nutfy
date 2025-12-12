import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Student, Assessment } from '../types';
import { storageService } from '../services/storageService';
import { Activity, Calendar, Plus, ChevronRight, TrendingUp, Scale, Trash2, Clock, RotateCw, X, Edit2, Loader2, AlertTriangle } from 'lucide-react';

export const PatientProgress: React.FC = () => {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  
  // Modal de Renovação
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [renewDate, setRenewDate] = useState('');
  const [isRenewing, setIsRenewing] = useState(false);

  // Modal de Exclusão
  const [assessmentToDelete, setAssessmentToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
        if (studentId) {
            const students = await storageService.getStudents();
            const s = students.find(st => st.id === studentId);
            if (s) {
                setStudent(s);
                const assessmentList = await storageService.getAssessments(studentId);
                setAssessments(assessmentList);
                // Default renew date: today + 30 days
                const nextMonth = new Date();
                nextMonth.setDate(nextMonth.getDate() + 30);
                setRenewDate(nextMonth.toISOString().split('T')[0]);
            } else {
                navigate('/');
            }
        }
    };
    load();
  }, [studentId, navigate]);

  const requestDeleteAssessment = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setAssessmentToDelete(id);
  };

  const confirmDeleteAssessment = async () => {
      if (!assessmentToDelete || !studentId) return;
      
      setIsDeleting(true);
      try {
          await storageService.deleteAssessment(assessmentToDelete);
          const updated = await storageService.getAssessments(studentId);
          setAssessments(updated);
          setAssessmentToDelete(null);
      } catch (error) {
          alert("Erro ao excluir avaliação.");
      } finally {
          setIsDeleting(false);
      }
  };

  const handleRenewPlan = async () => {
      if (!student || !renewDate) return;
      
      setIsRenewing(true);
      try {
          const newStartDate = new Date().toISOString().split('T')[0];
          const updatedStudent: Student = {
              ...student,
              planStartDate: newStartDate,
              planEndDate: renewDate
          };

          await storageService.saveStudent(updatedStudent);
          
          setStudent(updatedStudent);
          setShowRenewModal(false);
          alert('Plano renovado com sucesso!');
      } catch (e: any) {
          alert('Erro ao renovar: ' + e.message);
      } finally {
          setIsRenewing(false);
      }
  };

  if (!student) return null;

  // Lógica de Status para Badge
  const getDaysRemaining = (endDateStr?: string) => {
    if (!endDateStr) return null;
    // Adiciona T12:00:00 para garantir que o fuso horário não volte o dia
    const end = new Date(endDateStr + 'T12:00:00');
    const now = new Date();
    end.setHours(0,0,0,0);
    now.setHours(0,0,0,0);
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  const daysRemaining = getDaysRemaining(student.planEndDate);
  let statusColor = 'bg-emerald-100 text-emerald-700';
  let statusText = 'Ativo';

  if (daysRemaining !== null) {
      if (daysRemaining < 0) { statusColor = 'bg-red-100 text-red-700'; statusText = 'Vencido'; }
      else if (daysRemaining === 0) { statusColor = 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-400'; statusText = 'Vence Hoje'; }
      else if (daysRemaining <= 3) { statusColor = 'bg-amber-100 text-amber-700'; statusText = 'Crítico'; }
      else if (daysRemaining <= 7) { statusColor = 'bg-yellow-100 text-yellow-700'; statusText = 'Atenção'; }
  }

  return (
    <Layout title={`Painel do Paciente: ${student.name}`} showBack backPath="/">
      
      {/* Header Info */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 mb-8 flex flex-col lg:flex-row items-center gap-6 relative overflow-hidden">
          {/* Status Stripe */}
          <div className={`absolute top-0 left-0 w-full h-1.5 ${daysRemaining !== null && daysRemaining < 0 ? 'bg-red-500' : 'bg-emerald-500'}`}></div>

          <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
             {student.logoUrl ? <img src={student.logoUrl} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-2xl">{student.name[0]}</div>}
          </div>
          
          <div className="text-center lg:text-left flex-1">
             <div className="flex items-center justify-center lg:justify-start gap-3 mb-1">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{student.name}</h2>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${statusColor}`}>{statusText}</span>
             </div>
             
             <div className="flex flex-wrap gap-4 mt-2 justify-center lg:justify-start text-sm text-slate-500 dark:text-slate-400">
                {student.planEndDate && (
                    <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
                        <Clock size={14} className={daysRemaining !== null && daysRemaining <= 3 ? 'text-red-400' : 'text-slate-400'} />
                        {daysRemaining !== null && daysRemaining < 0 
                            ? `Expirou dia ${new Date(student.planEndDate + 'T12:00:00').toLocaleDateString('pt-BR')}`
                            : `Vence em ${daysRemaining} dias (${new Date(student.planEndDate + 'T12:00:00').toLocaleDateString('pt-BR')})`
                        }
                    </span>
                )}
                {student.contact && <span>{student.contact}</span>}
             </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
             <button 
               onClick={() => setShowRenewModal(true)}
               className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 text-slate-600 dark:text-slate-300 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
             >
                <RotateCw size={18} /> Renovar Plano
             </button>
             <button 
               onClick={() => navigate(`/student/${studentId}/assessment/new`)}
               className="bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-slate-200 dark:shadow-slate-900/50 transition-all"
             >
                <Plus size={20} /> Nova Avaliação
             </button>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Lista de Avaliações */}
         <div className="lg:col-span-2 space-y-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Activity className="text-emerald-600 dark:text-emerald-400" /> Histórico de Avaliações
            </h3>
            
            {assessments.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center">
                    <p className="text-slate-400 mb-4">Nenhuma avaliação registrada.</p>
                    <button 
                       onClick={() => navigate(`/student/${studentId}/assessment/new`)}
                       className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                    >
                        Criar Avaliação Inicial
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {assessments.map(assessment => (
                        <div 
                            key={assessment.id}
                            onClick={() => navigate(`/student/${studentId}/assessment/${assessment.id}/meals`)}
                            className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden ${
                                assessment.status === 'active' 
                                ? 'border-emerald-500 shadow-lg shadow-emerald-100 dark:shadow-emerald-900/20 ring-1 ring-emerald-500' 
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
                            }`}
                        >
                            {assessment.status === 'active' && (
                                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-xl">
                                    Atual
                                </div>
                            )}
                            
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar size={16} className="text-slate-400" />
                                        <span className="font-bold text-slate-800 dark:text-white text-lg">
                                            {new Date(assessment.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                                        </span>
                                    </div>
                                    <div className="flex gap-6 text-sm text-slate-600 dark:text-slate-400">
                                        <div className="flex items-center gap-1.5">
                                            <Scale size={16} className="text-purple-500" />
                                            <span className="font-semibold">{assessment.weight} kg</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <TrendingUp size={16} className="text-orange-500" />
                                            <span className="font-semibold">{assessment.calorieGoal} kcal</span>
                                        </div>
                                    </div>
                                    {assessment.objective && (
                                        <p className="text-xs text-slate-400 mt-2 italic">Obj: {assessment.objective}</p>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 group-hover:bg-slate-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-slate-900 transition-colors">
                                        <ChevronRight size={18} />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                                    Ver Plano Alimentar
                                </span>
                                <div className="flex items-center gap-3">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); navigate(`/student/${studentId}/assessment/${assessment.id}/edit`); }}
                                      className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                      title="Editar Avaliação"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button 
                                      onClick={(e) => requestDeleteAssessment(e, assessment.id)}
                                      className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                      title="Excluir Avaliação"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
         </div>

         {/* Sidebar Stats (Evolução Rápida) */}
         <div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm sticky top-6">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4">Resumo da Evolução</h3>
                {assessments.length < 2 ? (
                    <p className="text-sm text-slate-400">Registre pelo menos duas avaliações para ver a comparação.</p>
                ) : (
                   <div className="space-y-4">
                       <div>
                           <div className="text-xs text-slate-400 uppercase font-bold">Peso Inicial</div>
                           <div className="font-bold text-lg text-slate-700 dark:text-slate-300">{assessments[assessments.length-1].weight} kg</div>
                       </div>
                       <div>
                           <div className="text-xs text-slate-400 uppercase font-bold">Peso Atual</div>
                           <div className="font-bold text-2xl text-slate-900 dark:text-white">{assessments[0].weight} kg</div>
                       </div>
                       <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                           <div className="text-xs text-slate-400 uppercase font-bold">Diferença</div>
                           <div className={`font-bold text-lg ${(assessments[0].weight - assessments[assessments.length-1].weight) <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-500'}`}>
                               {(assessments[0].weight - assessments[assessments.length-1].weight).toFixed(1)} kg
                           </div>
                       </div>
                   </div>
                )}
            </div>
         </div>
      </div>

      {/* MODAL DE RENOVAÇÃO */}
      {showRenewModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">Renovar Plano</h3>
                      <button onClick={() => setShowRenewModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><X size={20}/></button>
                  </div>
                  
                  <div className="space-y-4">
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-sm text-slate-600 dark:text-slate-300">
                          A data de início será atualizada para <strong>Hoje</strong>.
                      </div>
                      
                      <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Novo Vencimento</label>
                          <input 
                            type="date" 
                            value={renewDate} 
                            onChange={(e) => setRenewDate(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl focus:border-emerald-500 outline-none [color-scheme:light] dark:[color-scheme:dark]"
                          />
                      </div>

                      <button 
                        onClick={handleRenewPlan}
                        disabled={isRenewing}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-200 dark:shadow-none mt-2 flex justify-center items-center gap-2"
                      >
                          {isRenewing ? <Loader2 className="animate-spin" /> : 'Confirmar Renovação'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* MODAL DE EXCLUSÃO DE AVALIAÇÃO */}
      {assessmentToDelete && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-md border border-red-100 dark:border-red-900/30">
                  <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                          <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-xl">
                              <AlertTriangle className="text-red-600 dark:text-red-400 w-6 h-6" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Excluir Avaliação?</h3>
                      </div>
                      <button onClick={() => setAssessmentToDelete(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                          <X size={20}/>
                      </button>
                  </div>
                  
                  <div className="space-y-4">
                      <p className="text-slate-600 dark:text-slate-400 text-sm">
                          Esta ação é irreversível. O plano alimentar vinculado a esta avaliação também será removido permanentemente.
                      </p>

                      <div className="flex gap-3 pt-2">
                          <button 
                              onClick={() => setAssessmentToDelete(null)}
                              className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                          >
                              Cancelar
                          </button>
                          <button 
                              onClick={confirmDeleteAssessment}
                              disabled={isDeleting}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-red-200 dark:shadow-none flex items-center justify-center gap-2"
                          >
                              {isDeleting ? <Loader2 className="animate-spin" /> : 'Excluir'}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </Layout>
  );
};