import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, Save, User, Calendar, Phone, Clock, FileText, HeartPulse, AlertOctagon, Utensils, Dumbbell, CheckSquare, Square, Loader2 } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Student } from '../types';
import { storageService } from '../services/storageService';

export const StudentForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const [isSaving, setIsSaving] = useState(false);
  
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<Partial<Student>>({
    name: '',
    logoUrl: '',
    extraNotes: '',
    nextAppointment: '',
    contact: '',
    birthDate: '',
    planStartDate: today,
    planEndDate: '',
    anamnesis: {
      objective: '',
      healthHistory: '',
      restrictions: [],
      allergies: '',
      preferences: '',
      activityLevel: '',
      generalNotes: ''
    }
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    const loadStudent = async () => {
        if (isEditing && id) {
            const students = await storageService.getStudents();
            const student = students.find(s => s.id === id);
            if (student) {
                // Garantir que o objeto anamnesis exista mesmo em registros antigos
                const mergedStudent = {
                    ...student,
                    anamnesis: {
                        objective: '',
                        healthHistory: '',
                        restrictions: [],
                        allergies: '',
                        preferences: '',
                        activityLevel: '',
                        generalNotes: '',
                        ...student.anamnesis
                    }
                };
                setFormData(mergedStudent as Partial<Student>);
                setLogoPreview(student.logoUrl || null);
            } else {
                navigate('/');
            }
        }
    };
    loadStudent();
  }, [id, isEditing, navigate]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await storageService.fileToBase64(file);
        setLogoPreview(base64);
        setFormData(prev => ({ ...prev, logoUrl: base64 }));
      } catch (err) { alert('Erro ao carregar imagem. Verifique se você está logado.'); }
    }
  };

  const handleAnamnesisChange = (field: string, value: any) => {
      setFormData(prev => ({
          ...prev,
          anamnesis: {
              ...prev.anamnesis!,
              [field]: value
          }
      }));
  };

  const handleRestrictionToggle = (value: string) => {
      const current = formData.anamnesis?.restrictions || [];
      const updated = current.includes(value)
        ? current.filter(r => r !== value)
        : [...current, value];
      handleAnamnesisChange('restrictions', updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return alert('O nome é obrigatório.');
    if (!formData.contact) return alert('O contato é obrigatório.');
    if (!formData.birthDate) return alert('A data de nascimento é obrigatória.');
    if (!formData.planEndDate) return alert('A data de fim do plano é obrigatória.');

    setIsSaving(true);

    try {
        let studentPayload: Student;
        
        if (isEditing && id) {
            // Edição
            studentPayload = { 
                ...formData as Student, 
                id: id // Garante que o ID é mantido
            };
        } else {
            // Criação
            studentPayload = {
                ...formData as Student,
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString()
            };
        }

        // Salva SOMENTE este estudante
        await storageService.saveStudent(studentPayload);
        
        alert(isEditing ? 'Cadastro atualizado com sucesso!' : 'Paciente cadastrado com sucesso!');
        navigate(`/student/${studentPayload.id}/progress`);
    } catch (error: any) {
        console.error(error);
        alert(`Erro ao salvar: ${error.message || 'Erro desconhecido'}`);
    } finally {
        setIsSaving(false);
    }
  };

  const handleDateChange = (field: keyof Student, value: string) => {
      if (value.length > 10) return; 
      setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Layout title={isEditing ? "Editar Cadastro" : "Novo Aluno"} showBack backPath="/">
      <div className="max-w-4xl mx-auto pb-20">
        <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Bloco 1: Dados Pessoais (Card Principal) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
                
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2.5 rounded-xl">
                        <User className="text-emerald-600 dark:text-emerald-400 w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Dados Pessoais</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Informações básicas e contato.</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Foto */}
                    <div className="flex justify-center md:justify-start">
                        <div className="relative group cursor-pointer w-32 h-32 shrink-0">
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        <div className={`w-full h-full rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${logoPreview ? 'border-emerald-500' : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                            {logoPreview ? (
                            <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                            <div className="text-center p-2">
                                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                                <span className="text-[10px] text-slate-400 uppercase font-bold">FOTO</span>
                            </div>
                            )}
                        </div>
                        </div>
                    </div>

                    {/* Inputs Básicos */}
                    <div className="flex-1 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome Completo *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                                placeholder="Ex: João da Silva"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contato *</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        value={formData.contact || ''}
                                        onChange={e => {
                                            let val = e.target.value.replace(/\D/g, '').slice(0, 11);
                                            if (val.length > 2) val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
                                            setFormData({ ...formData, contact: val });
                                        }}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white"
                                        placeholder="(11) 999999999"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nascimento *</label>
                                <input
                                    type="date"
                                    max="9999-12-31"
                                    value={formData.birthDate || ''}
                                    onChange={e => handleDateChange('birthDate', e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bloco 2: Anamnese (Novo Layout Premium) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>

                <div className="flex items-center gap-3 mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-xl">
                        <FileText className="text-blue-600 dark:text-blue-400 w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Anamnese Nutricional</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Informações clínicas e preferências.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    
                    {/* Objetivo */}
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                            <Utensils className="inline w-4 h-4 mr-1 mb-0.5 text-blue-500" /> Objetivo Principal
                        </label>
                        <select 
                            value={formData.anamnesis?.objective || ''} 
                            onChange={e => handleAnamnesisChange('objective', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                        >
                            <option value="">Selecione...</option>
                            <option value="Emagrecimento">Emagrecimento</option>
                            <option value="Hipertrofia">Hipertrofia</option>
                            <option value="Reeducação Alimentar">Reeducação Alimentar</option>
                            <option value="Saúde Geral">Saúde Geral</option>
                            <option value="Ganho de Energia">Ganho de Energia</option>
                            <option value="Outro">Outro</option>
                        </select>
                        {formData.anamnesis?.objective === 'Outro' && (
                            <input 
                                type="text" 
                                placeholder="Especifique o objetivo..."
                                value={formData.anamnesis?.objectiveOther || ''}
                                onChange={e => handleAnamnesisChange('objectiveOther', e.target.value)}
                                className="mt-3 w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-slate-900 dark:text-white"
                            />
                        )}
                    </div>

                    {/* Histórico de Saúde */}
                    <div className="col-span-1 md:col-span-2">
                         <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                            <HeartPulse className="inline w-4 h-4 mr-1 mb-0.5 text-red-500" /> Histórico de Saúde
                         </label>
                         <textarea 
                             rows={3}
                             value={formData.anamnesis?.healthHistory || ''}
                             onChange={e => handleAnamnesisChange('healthHistory', e.target.value)}
                             className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none text-slate-900 dark:text-white"
                             placeholder="Doenças pré-existentes, cirurgias, condições clínicas, medicamentos..."
                         />
                    </div>

                    {/* Restrições Alimentares */}
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide">
                            <AlertOctagon className="inline w-4 h-4 mr-1 mb-0.5 text-amber-500" /> Restrições Alimentares
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {['Lactose', 'Glúten', 'Açúcar', 'Oleaginosas', 'Frutos do Mar', 'Vegano', 'Vegetariano', 'Outro'].map(opt => {
                                const isSelected = (formData.anamnesis?.restrictions || []).includes(opt);
                                return (
                                    <div 
                                      key={opt}
                                      onClick={() => handleRestrictionToggle(opt)}
                                      className={`cursor-pointer px-4 py-3 rounded-xl border flex items-center gap-2 transition-all ${
                                          isSelected 
                                          ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold' 
                                          : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-blue-300'
                                      }`}
                                    >
                                        {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                                        <span className="text-sm">{opt}</span>
                                    </div>
                                );
                            })}
                        </div>
                        {(formData.anamnesis?.restrictions || []).includes('Outro') && (
                            <input 
                                type="text" 
                                placeholder="Especifique outras restrições..."
                                value={formData.anamnesis?.restrictionsOther || ''}
                                onChange={e => handleAnamnesisChange('restrictionsOther', e.target.value)}
                                className="mt-3 w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-slate-900 dark:text-white"
                            />
                        )}
                    </div>

                    {/* Alergias */}
                    <div>
                         <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                            Alergias
                         </label>
                         <textarea 
                             rows={2}
                             value={formData.anamnesis?.allergies || ''}
                             onChange={e => handleAnamnesisChange('allergies', e.target.value)}
                             className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none text-slate-900 dark:text-white"
                             placeholder="Lista de alergias..."
                         />
                    </div>

                    {/* Atividade Física */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                            <Dumbbell className="inline w-4 h-4 mr-1 mb-0.5 text-purple-500" /> Nível de Atividade
                        </label>
                        <select 
                            value={formData.anamnesis?.activityLevel || ''} 
                            onChange={e => handleAnamnesisChange('activityLevel', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white h-[86px]" // Altura para alinhar com textarea
                        >
                            <option value="">Selecione...</option>
                            <option value="sedentary">Sedentário</option>
                            <option value="light">Leve</option>
                            <option value="moderate">Moderado</option>
                            <option value="intense">Intenso</option>
                            <option value="athlete">Atleta</option>
                        </select>
                    </div>

                    {/* Preferências */}
                    <div className="col-span-1 md:col-span-2">
                         <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                            Preferências Alimentares
                         </label>
                         <textarea 
                             rows={3}
                             value={formData.anamnesis?.preferences || ''}
                             onChange={e => handleAnamnesisChange('preferences', e.target.value)}
                             className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none text-slate-900 dark:text-white"
                             placeholder="Alimentos que gosta ou não gosta, rotina alimentar, horários..."
                         />
                    </div>
                    
                    {/* Observações Gerais */}
                    <div className="col-span-1 md:col-span-2">
                         <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                            Observações Gerais
                         </label>
                         <textarea 
                             rows={3}
                             value={formData.anamnesis?.generalNotes || ''}
                             onChange={e => handleAnamnesisChange('generalNotes', e.target.value)}
                             className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none text-slate-900 dark:text-white"
                             placeholder="Informações adicionais relevantes..."
                         />
                    </div>

                </div>
            </div>

            {/* Bloco 3: Vigência do Plano */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-slate-400"></div>
                <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <Clock size={16} /> Configuração do Plano
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Início do Plano</label>
                        <input
                            type="date"
                            max="9999-12-31"
                            value={formData.planStartDate || ''}
                            onChange={e => handleDateChange('planStartDate', e.target.value)}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Fim do Plano (Vencimento) *</label>
                        <input
                            type="date"
                            max="9999-12-31"
                            value={formData.planEndDate || ''}
                            onChange={e => handleDateChange('planEndDate', e.target.value)}
                            className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                            required
                        />
                    </div>
                </div>

                <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notas Administrativas (Privado)</label>
                    <textarea
                        value={formData.extraNotes || ''}
                        onChange={e => setFormData({ ...formData, extraNotes: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none text-slate-900 dark:text-white"
                        placeholder="Observações internas..."
                    />
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <button
                type="submit"
                disabled={isSaving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-emerald-200 dark:shadow-none transition-all active:scale-95 flex items-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                {isSaving ? <Loader2 className="animate-spin" /> : <Save size={22} />}
                {isEditing ? 'Salvar Tudo' : 'Cadastrar Paciente'}
                </button>
            </div>
        </form>
      </div>
    </Layout>
  );
};