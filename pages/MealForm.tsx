import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Meal, FoodItem } from '../types';
import { storageService } from '../services/storageService';
import { Clock, Type, Save, Plus, Trash2, Utensils, AlignLeft, Calendar, ChevronDown } from 'lucide-react';

export const MealForm: React.FC = () => {
  const navigate = useNavigate();
  const { studentId, assessmentId, mealId } = useParams();
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type') as 'normal' | 'free';

  const isEditing = !!mealId;
  const [mealType, setMealType] = useState<'normal' | 'free'>(typeParam || 'normal');

  const [formData, setFormData] = useState<Partial<Meal>>({
    name: '',
    description: '',
    quantity: '', 
    calories: 0,
    time: '',
    type: typeParam || 'normal',
    foods: []
  });

  useEffect(() => {
    const loadMeal = async () => {
        if (isEditing && mealId) {
            const allMeals = await storageService.getMeals(assessmentId);
            const meal = allMeals.find(m => m.id === mealId);
            if (meal) {
                setFormData(meal);
                setMealType(meal.type);
            }
        }
    };
    loadMeal();
  }, [isEditing, mealId, assessmentId]);

  // Auto-calculate total calories when foods change
  useEffect(() => {
    if (formData.foods && formData.foods.length > 0 && mealType === 'normal') {
      const total = formData.foods.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);
      setFormData(prev => ({ ...prev, calories: total }));
    }
  }, [formData.foods, mealType]);

  const handleAddFood = () => {
    const newFood: FoodItem = {
      id: crypto.randomUUID(),
      name: '',
      quantity: '',
      calories: 0,
      substitutions: ''
    };
    setFormData(prev => ({ ...prev, foods: [...(prev.foods || []), newFood] }));
  };

  const handleUpdateFood = (id: string, field: keyof FoodItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      foods: (prev.foods || []).map(f => f.id === id ? { ...f, [field]: value } : f)
    }));
  };

  const handleRemoveFood = (id: string) => {
    setFormData(prev => ({ ...prev, foods: (prev.foods || []).filter(f => f.id !== id) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.time) { alert('Preencha o nome da refeição e o horário/frequência.'); return; }
    
    // Validação de Alimentos
    if (formData.foods && formData.foods.length > 0) {
        const invalidFood = formData.foods.find(f => !f.name || !f.quantity);
        if (invalidFood) {
            alert("Todos os alimentos devem ter Nome e Quantidade preenchidos.");
            return;
        }
    }

    const finalCalories = mealType === 'free' ? 0 : Number(formData.calories);

    const mealPayload: Meal = {
      id: isEditing && mealId ? mealId : crypto.randomUUID(),
      studentId: studentId!,
      assessmentId: assessmentId!,
      name: formData.name!,
      description: formData.description || '',
      quantity: '', // Campo removido da UI, enviando vazio
      calories: finalCalories,
      time: formData.time!,
      type: mealType,
      foods: formData.foods || []
    };

    await storageService.saveMeal(mealPayload);
    navigate(`/student/${studentId}/assessment/${assessmentId}/meals`);
  };

  return (
    <Layout title={isEditing ? 'Editar Refeição' : 'Nova Refeição'} showBack backPath={`/student/${studentId}/assessment/${assessmentId}/meals`}>
      <div className="max-w-3xl mx-auto pb-20">
         
         <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white/50 p-8 md:p-10 space-y-10 relative overflow-hidden">
            
            {/* Decorative background blob */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-slate-50 rounded-full blur-3xl pointer-events-none opacity-50"></div>

            {/* Header: Type Selection Display */}
            <div className="flex items-center gap-3">
               <div className={`p-3 rounded-2xl ${mealType === 'free' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  <Utensils size={24} />
               </div>
               <div>
                  <h2 className="text-2xl font-bold text-slate-800">Detalhes da Refeição</h2>
                  <p className="text-slate-500 font-medium text-sm">
                    {mealType === 'free' ? 'Refeição Livre (Sem contagem calórica)' : 'Refeição Planejada (Com cálculo de calorias)'}
                  </p>
               </div>
            </div>

            <div className="space-y-8 relative z-10">
                
                {/* 1. Nome da Refeição */}
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2 pl-1">Nome da Refeição</label>
                   <div className="relative group">
                       <Type className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors w-5 h-5" />
                       <input 
                         type="text" 
                         value={formData.name} 
                         onChange={e => setFormData({...formData, name: e.target.value})} 
                         className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all rounded-3xl font-bold text-lg text-slate-800 placeholder:text-slate-400 outline-none"
                         placeholder="Ex: Café da manhã" 
                         required 
                       />
                   </div>
                </div>

                {/* 2. Horário ou Frequência (Condicional) */}
                <div className="w-full md:w-1/2">
                   <label className="block text-sm font-bold text-slate-700 mb-2 pl-1">
                      {mealType === 'free' ? 'Frequência Sugerida' : 'Horário Sugerido'}
                   </label>
                   <div className="relative group">
                       {mealType === 'free' ? (
                           <>
                             <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors w-5 h-5 z-10" />
                             <div className="relative">
                               <select 
                                 value={formData.time} 
                                 onChange={e => setFormData({...formData, time: e.target.value})} 
                                 className="w-full pl-14 pr-10 py-5 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all rounded-3xl font-bold text-lg text-slate-800 outline-none appearance-none cursor-pointer"
                                 required
                               >
                                 <option value="" disabled>Selecione...</option>
                                 <option value="1x por semana">1x por semana</option>
                                 <option value="2x por semana">2x por semana</option>
                                 <option value="3x por semana">3x por semana</option>
                                 <option value="Fim de semana">Fim de semana</option>
                                 <option value="Quinzenalmente">Quinzenalmente</option>
                               </select>
                               <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-5 h-5" />
                             </div>
                           </>
                       ) : (
                           <>
                             <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors w-5 h-5" />
                             <input 
                               type="time" 
                               value={formData.time} 
                               onChange={e => setFormData({...formData, time: e.target.value})} 
                               className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all rounded-3xl font-bold text-lg text-slate-800 outline-none [color-scheme:light]"
                               required 
                             />
                           </>
                       )}
                   </div>
                </div>

                {/* Separator */}
                <div className="h-px bg-slate-100 w-full my-6"></div>

                {/* 4. Bloco: Alimentos */}
                <div>
                   <div className="flex justify-between items-center mb-6">
                       <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                           Alimentos 
                           <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded-lg">{(formData.foods || []).length}</span>
                       </h3>
                       <button 
                         type="button" 
                         onClick={handleAddFood} 
                         className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95"
                       >
                           <Plus size={18} strokeWidth={3} /> 
                           Adicionar Alimento
                       </button>
                   </div>

                   <div className="space-y-4">
                       {(formData.foods || []).length === 0 && (
                           <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                               <p className="text-slate-400 font-medium">Nenhum alimento adicionado.</p>
                               <button type="button" onClick={handleAddFood} className="text-emerald-600 font-bold text-sm mt-2 hover:underline">Adicionar o primeiro item</button>
                           </div>
                       )}

                       {(formData.foods || []).map((food, index) => (
                           <div key={food.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group relative animate-in slide-in-from-bottom-2 duration-300">
                               <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                                   
                                   {/* Nome do Alimento */}
                                   <div className="flex-1 w-full">
                                       <label className="text-[10px] uppercase font-bold text-slate-400 ml-1 mb-1 block">Alimento *</label>
                                       <input 
                                         placeholder="Ex: Cuscuz" 
                                         value={food.name} 
                                         onChange={e => handleUpdateFood(food.id, 'name', e.target.value)} 
                                         className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-emerald-400 focus:bg-white rounded-2xl font-bold text-slate-700 outline-none transition-colors"
                                       />
                                   </div>

                                   {/* Quantidade */}
                                   <div className="w-full md:w-32">
                                       <label className="text-[10px] uppercase font-bold text-slate-400 ml-1 mb-1 block">Qtd *</label>
                                       <input 
                                         placeholder="Ex: 200g" 
                                         value={food.quantity} 
                                         onChange={e => handleUpdateFood(food.id, 'quantity', e.target.value)} 
                                         className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-emerald-400 focus:bg-white rounded-2xl font-bold text-slate-700 outline-none transition-colors"
                                       />
                                   </div>

                                   {/* Calorias (Se não for livre) */}
                                   {mealType !== 'free' && (
                                       <div className="w-full md:w-28">
                                           <label className="text-[10px] uppercase font-bold text-slate-400 ml-1 mb-1 block">Kcal</label>
                                           <input 
                                             type="number" 
                                             placeholder="0" 
                                             value={food.calories || ''} 
                                             onChange={e => handleUpdateFood(food.id, 'calories', parseFloat(e.target.value))} 
                                             className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-emerald-400 focus:bg-white rounded-2xl font-bold text-slate-700 outline-none transition-colors"
                                           />
                                       </div>
                                   )}

                                   {/* Delete Button (Mobile: Full width, Desktop: Icon) */}
                                   <div className="w-full md:w-auto mt-2 md:mt-5 flex justify-end">
                                      <button 
                                        type="button" 
                                        onClick={() => handleRemoveFood(food.id)} 
                                        className="p-3 rounded-2xl bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-colors"
                                        title="Remover Alimento"
                                      >
                                        <Trash2 size={18} />
                                      </button>
                                   </div>
                               </div>
                               
                               {/* Substituições */}
                               <div className="mt-4 pt-4 border-t border-slate-50">
                                   <div className="flex items-center gap-2 mb-1 pl-1">
                                      <AlignLeft size={12} className="text-slate-400" />
                                      <label className="text-[10px] uppercase font-bold text-slate-400">Substituições (Opcional)</label>
                                   </div>
                                   <input 
                                      placeholder="Ex: Tapioca ou Cuscuz 200g" 
                                      value={food.substitutions} 
                                      onChange={e => handleUpdateFood(food.id, 'substitutions', e.target.value)} 
                                      className="w-full px-4 py-2 bg-transparent hover:bg-slate-50 border-b border-transparent hover:border-slate-200 focus:border-emerald-400 rounded-lg text-sm text-slate-600 outline-none transition-all placeholder:text-slate-300" 
                                   />
                               </div>

                               {/* Number Badge */}
                               <div className="absolute -left-3 -top-3 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold border-4 border-white shadow-sm">
                                  {index + 1}
                               </div>
                           </div>
                       ))}
                   </div>
                   
                   {mealType !== 'free' && (formData.foods || []).length > 0 && (
                       <div className="mt-4 flex justify-end">
                          <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 text-sm font-bold text-slate-600">
                             Total Estimado: <span className="text-emerald-600">{formData.calories} kcal</span>
                          </div>
                       </div>
                   )}
                </div>

                {/* 5. Observações */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 pl-1">Observações Gerais</label>
                    <div className="relative">
                        <textarea 
                           value={formData.description} 
                           onChange={e => setFormData({...formData, description: e.target.value})} 
                           className="w-full px-6 py-5 bg-slate-50 border-2 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all rounded-3xl text-slate-700 placeholder:text-slate-400 outline-none resize-none h-32"
                           placeholder="Observações adicionais sobre esta refeição (opcional)..."
                        />
                    </div>
                </div>

                {/* 6. Botão Salvar */}
                <div className="pt-6">
                    <button 
                      type="submit" 
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-[2rem] font-bold text-lg shadow-xl shadow-emerald-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                       <Save size={24} />
                       Salvar Refeição
                    </button>
                </div>

            </div>
         </form>
      </div>
    </Layout>
  );
};