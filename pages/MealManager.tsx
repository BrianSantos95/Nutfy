import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Clock, Flame, Utensils, ArrowRight, Edit2, Trash2, Calendar, Loader2, RefreshCw } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Meal, Student, Assessment } from '../types';
import { storageService } from '../services/storageService';

export const MealManager: React.FC = () => {
  const navigate = useNavigate();
  const { studentId, assessmentId } = useParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [mealToDelete, setMealToDelete] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
        if (studentId && assessmentId) {
            const students = await storageService.getStudents();
            const foundStudent = students.find(s => s.id === studentId);
            
            const assessments = await storageService.getAssessments(studentId);
            const foundAssessment = assessments.find(a => a.id === assessmentId);

            if (foundStudent && foundAssessment) {
                setStudent(foundStudent);
                setAssessment(foundAssessment);
                
                const allMeals = await storageService.getMeals(assessmentId); // Filter by assessment
                setMeals(allMeals.sort((a, b) => a.time.localeCompare(b.time)));
            } else {
                navigate('/');
            }
            setIsLoading(false);
        }
    };
    loadData();
  }, [studentId, assessmentId, navigate]);

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setMealToDelete(id);
  };

  const confirmDelete = async () => {
    if (mealToDelete) {
      await storageService.deleteMeal(mealToDelete);
      setMeals(prev => prev.filter(m => m.id !== mealToDelete));
      setMealToDelete(null);
    }
  };

  const handleEditMeal = (e: React.MouseEvent, mealId: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/student/${studentId}/assessment/${assessmentId}/meal/${mealId}`);
  };

  if (isLoading || !student || !assessment) {
    return (
      <Layout showBack backPath="/">
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-2" />
          <p>Carregando plano...</p>
        </div>
      </Layout>
    );
  }

  const totalCalories = meals
    .filter(m => m.type === 'normal')
    .reduce((acc, curr) => acc + curr.calories, 0);

  const calorieDiff = totalCalories - assessment.calorieGoal;
  const isOver = calorieDiff > 0;

  return (
    <Layout title={`Plano: ${new Date(assessment.date).toLocaleDateString()}`} showBack backPath={`/student/${studentId}/progress`}>
      {/* Summary Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
           <h2 className="text-xl font-bold text-slate-900 dark:text-white">Gerenciar Refeições</h2>
           <p className="text-slate-500 dark:text-slate-400 text-sm">Dieta para {student.name} (Peso: {assessment.weight}kg)</p>
        </div>
        <div className="flex items-center gap-6 bg-slate-50 dark:bg-slate-800 px-6 py-3 rounded-xl border border-slate-100 dark:border-slate-700">
           <div className="text-center">
             <span className="text-xs text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Meta</span>
             <div className="font-bold text-slate-700 dark:text-slate-200 text-lg">{assessment.calorieGoal} kcal</div>
           </div>
           <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
           <div className="text-center">
             <span className="text-xs text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Total</span>
             <div className={`font-bold text-lg ${isOver ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {totalCalories} kcal
             </div>
           </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4 mb-6">
         <button 
           onClick={() => navigate(`/student/${studentId}/assessment/${assessmentId}/meal/new?type=normal`)}
           className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 text-slate-500 dark:text-slate-400 rounded-xl p-4 flex items-center justify-center gap-2 font-medium transition-all group"
         >
            <div className="bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 p-2 rounded-full transition-colors">
              <Plus size={20} />
            </div>
            Refeição Normal
         </button>
         <button 
           onClick={() => navigate(`/student/${studentId}/assessment/${assessmentId}/meal/new?type=free`)}
           className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 text-slate-500 dark:text-slate-400 rounded-xl p-4 flex items-center justify-center gap-2 font-medium transition-all group"
         >
            <div className="bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 p-2 rounded-full transition-colors">
              <Utensils size={20} />
            </div>
            Refeição Livre
         </button>
      </div>

      {/* Meal List */}
      <div className="space-y-4 mb-20">
        {meals.map((meal) => (
            <div 
              key={meal.id} 
              className={`rounded-xl border p-5 flex flex-col sm:flex-row items-start gap-4 transition-colors ${
                  meal.type === 'free' 
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
               
               {/* Time Badge */}
               <div className="flex-shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold px-3 py-2 rounded-lg text-sm min-w-[80px] text-center mt-1 border border-transparent dark:border-slate-700">
                  {meal.time}
               </div>

               {/* Meal Content */}
               <div className="flex-1 w-full">
                 <div className="flex items-center gap-2 mb-3">
                   <h3 className="font-bold text-slate-900 dark:text-white text-lg">{meal.name}</h3>
                   {meal.type === 'free' && (
                       <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200 text-[10px] px-2 py-0.5 rounded-full font-bold border border-blue-200 dark:border-blue-800">
                           LIVRE
                       </span>
                   )}
                 </div>
                 
                 {meal.foods && meal.foods.length > 0 ? (
                    <div className="space-y-3">
                        {meal.foods.map((food, idx) => (
                           <div key={food.id || idx} className="flex flex-col">
                              {/* Main Food Item */}
                              <div className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300 font-medium">
                                 <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 mt-2 shrink-0"></div>
                                 <span>{food.quantity} {food.name}</span>
                              </div>
                              
                              {/* Substitution (if exists) */}
                              {food.substitutions && (
                                 <div className="pl-4 mt-1.5">
                                    <div className="inline-flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-500 dark:text-slate-400 max-w-full">
                                       <RefreshCw size={10} className="text-emerald-500" />
                                       <span className="font-semibold text-emerald-600 dark:text-emerald-500 text-[10px] uppercase">Ou:</span>
                                       <span className="italic">{food.substitutions}</span>
                                    </div>
                                 </div>
                              )}
                           </div>
                        ))}
                    </div>
                 ) : (
                    <p className="text-sm text-slate-600 dark:text-slate-400">{meal.quantity} {meal.description}</p>
                 )}
               </div>

               {/* Actions & Calories */}
               <div className="flex items-center gap-2 mt-2 sm:mt-0">
                   <span className="font-bold text-slate-600 dark:text-slate-300 text-sm mr-2">{meal.type === 'normal' ? `${meal.calories} kcal` : '--'}</span>
                   <button onClick={(e) => handleEditMeal(e, meal.id)} className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"><Edit2 size={18} /></button>
                   <button onClick={(e) => handleDeleteClick(e, meal.id)} className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"><Trash2 size={18} /></button>
               </div>
            </div>
        ))}
        {meals.length === 0 && <div className="text-center text-slate-400 dark:text-slate-600 py-10">Nenhuma refeição cadastrada.</div>}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 z-20">
        <div className="max-w-5xl mx-auto flex justify-end">
            <button 
              onClick={() => {
                if (meals.length === 0) return alert('Adicione refeições.');
                navigate(`/student/${studentId}/assessment/${assessmentId}/preview`);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-emerald-200 dark:shadow-none"
            >
               Visualizar e Exportar <ArrowRight size={20} />
            </button>
        </div>
      </div>
      
    </Layout>
  );
};