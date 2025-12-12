import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2, Edit2, ChevronRight, Sun, Moon, Sunrise, Users, Activity, PauseCircle, CheckCircle2, XCircle, AlertTriangle, X, Loader2 } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Student, ProfessionalProfile } from '../types';
import { storageService } from '../services/storageService';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [loadingData, setLoadingData] = useState(true);
  
  // Estados para Modal de Exclusão
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Carregar dados de forma assíncrona
    const loadData = async () => {
        try {
            const [loadedStudents, loadedProfile] = await Promise.all([
                storageService.getStudents(),
                storageService.getProfile()
            ]);
            setStudents(loadedStudents);
            setProfile(loadedProfile);
        } catch (error) {
            console.error("Erro ao carregar dashboard:", error);
        } finally {
            setLoadingData(false);
        }
    };
    loadData();
  }, []);

  const requestDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); 
    e.stopPropagation();
    setStudentToDelete(id);
    setDeleteConfirmation('');
  };

  const confirmDelete = async () => {
    if (studentToDelete && deleteConfirmation.toLowerCase() === 'excluir') {
        setIsDeleting(true);
        try {
            await storageService.deleteStudent(studentToDelete);
            
            // Atualiza UI
            const newStudents = students.filter(s => s.id !== studentToDelete);
            setStudents(newStudents);
            setStudentToDelete(null);
        } catch (e: any) {
            alert("Erro ao excluir: " + e.message);
        } finally {
            setIsDeleting(false);
        }
    }
  };

  const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return { 
          label: 'Bom dia', 
          icon: Sunrise, 
          blobColor: 'bg-orange-100 dark:bg-orange-900/20', 
          textGradient: 'from-orange-500 to-amber-500' 
      };
      if (hour < 18) return { 
          label: 'Boa tarde', 
          icon: Sun, 
          blobColor: 'bg-blue-100 dark:bg-blue-900/20', 
          textGradient: 'from-blue-500 to-indigo-500' 
      };
      return { 
          label: 'Boa noite', 
          icon: Moon, 
          blobColor: 'bg-emerald-100 dark:bg-emerald-900/20', 
          textGradient: 'from-emerald-600 to-teal-500' 
      };
  };

  const getDaysRemaining = (endDateStr?: string) => {
    if (!endDateStr) return null;
    const end = new Date(endDateStr + 'T12:00:00'); // Fix Timezone issue
    const now = new Date();
    end.setHours(0,0,0,0);
    now.setHours(0,0,0,0);
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  let activeCount = 0;
  let inactiveCount = 0;

  students.forEach(s => {
      const days = getDaysRemaining(s.planEndDate);
      if (days !== null && days >= 0) {
          activeCount++;
      } else {
          inactiveCount++;
      }
  });

  const filteredStudents = students.filter(s => {
    const days = getDaysRemaining(s.planEndDate);
    const isActive = days !== null && days >= 0;
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = isActive;
    if (statusFilter === 'inactive') matchesStatus = !isActive;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => a.name.localeCompare(b.name));

  const greetingData = getGreeting();
  const professionalName = profile?.name ? profile.name.split(' ')[0] : 'Nutri';

  if (loadingData) {
      return (
          <Layout>
              <div className="flex h-screen items-center justify-center">
                  <Loader2 className="animate-spin text-emerald-500 w-10 h-10" />
              </div>
          </Layout>
      );
  }

  return (
    <Layout>
      {/* 1. Welcome Banner Premium (White Version) */}
      <div className="mb-10">
         <div className="rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-white dark:border-slate-800 relative overflow-hidden bg-white dark:bg-slate-900 transition-colors">
            
            {/* Abstract Blobs (Cores Sutis no Fundo Branco) */}
            <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none opacity-60 ${greetingData.blobColor}`}></div>
            <div className={`absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none opacity-40 ${greetingData.blobColor}`}></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-bold mb-3 uppercase tracking-widest text-[10px]">
                        <greetingData.icon size={14} />
                        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 dark:text-white tracking-tight leading-tight">
                        {greetingData.label}, <br/>
                        <span className={`text-transparent bg-clip-text bg-gradient-to-r ${greetingData.textGradient}`}>
                            {professionalName}
                        </span>
                    </h1>
                </div>
                
                <button 
                    onClick={() => navigate('/student/new')} 
                    className="bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 pl-6 pr-8 py-4 rounded-[1.5rem] flex items-center gap-3 font-bold transition-all shadow-xl shadow-slate-200 dark:shadow-slate-900/50 hover:shadow-slate-300 hover:-translate-y-1 active:scale-95 group border border-transparent"
                >
                    <div className="bg-white/20 dark:bg-slate-900/10 p-2 rounded-xl group-hover:bg-white/30 dark:group-hover:bg-slate-900/20 transition-colors">
                        <Plus size={20} />
                    </div> 
                    Novo Paciente
                </button>
            </div>
         </div>
      </div>

      {/* 2. Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-slate-900/40 flex items-center gap-5 transition-transform hover:scale-[1.02]">
              <div className="w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 flex items-center justify-center shadow-sm ring-4 ring-violet-50/50 dark:ring-violet-900/10">
                  <Users size={28} />
              </div>
              <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Total de Pacientes</p>
                  <h3 className="text-4xl font-extrabold text-slate-800 dark:text-white">{students.length}</h3>
              </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-slate-900/40 flex items-center gap-5 transition-transform hover:scale-[1.02]">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm ring-4 ring-emerald-50/50 dark:ring-emerald-900/10">
                  <Activity size={28} />
              </div>
              <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Planos Ativos</p>
                  <h3 className="text-4xl font-extrabold text-slate-800 dark:text-white">{activeCount}</h3>
              </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-slate-900/40 flex items-center gap-5 transition-transform hover:scale-[1.02]">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center shadow-sm ring-4 ring-slate-100/50 dark:ring-slate-800/50">
                  <PauseCircle size={28} />
              </div>
              <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Inativos / Vencidos</p>
                  <h3 className="text-4xl font-extrabold text-slate-800 dark:text-white">{inactiveCount}</h3>
              </div>
          </div>
      </div>

      {/* 3. Patient List */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
         <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Seus Pacientes</h2>
         
         <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
             <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm self-start md:self-auto">
                 <button 
                   onClick={() => setStatusFilter('all')}
                   className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${statusFilter === 'all' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                 >
                   Todos
                 </button>
                 <button 
                   onClick={() => setStatusFilter('active')}
                   className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${statusFilter === 'active' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200 dark:shadow-none' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                 >
                   {statusFilter === 'active' && <CheckCircle2 size={14} />} Ativos
                 </button>
                 <button 
                   onClick={() => setStatusFilter('inactive')}
                   className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${statusFilter === 'inactive' ? 'bg-red-500 text-white shadow-md shadow-red-200 dark:shadow-none' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                 >
                   {statusFilter === 'inactive' && <XCircle size={14} />} Inativos
                 </button>
             </div>

             <div className="relative group w-full md:w-72">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
                 <input 
                    type="text" 
                    placeholder="Buscar paciente..." 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                    className="w-full pl-12 pr-6 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-900/20 focus:border-emerald-500 dark:focus:border-emerald-500 outline-none transition-all shadow-sm text-slate-800 dark:text-white" 
                 />
             </div>
         </div>
      </div>

      <div className="space-y-4 pb-20">
        {filteredStudents.length === 0 ? (
           <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
             <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Search className="text-slate-300 dark:text-slate-600" size={32} />
             </div>
             <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhum paciente encontrado com este filtro.</p>
             {statusFilter !== 'all' && (
                 <button onClick={() => setStatusFilter('all')} className="text-emerald-600 dark:text-emerald-400 font-bold mt-2 hover:underline text-sm">Limpar Filtros</button>
             )}
           </div>
        ) : (
           filteredStudents.map(student => {
             const days = getDaysRemaining(student.planEndDate);
             const isActive = days !== null && days >= 0;
             
             return (
               <div 
                 key={student.id} 
                 onClick={() => navigate(`/student/${student.id}/progress`)} 
                 className="group bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 hover:border-emerald-100 dark:hover:border-emerald-900 hover:-translate-y-1 transition-all cursor-pointer flex flex-col md:flex-row items-center gap-6 relative overflow-hidden"
               >
                  <div className={`absolute left-0 top-0 bottom-0 w-2 ${isActive ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                  
                  <div className="flex items-center gap-5 w-full md:w-1/2 pl-4">
                      <div className="w-16 h-16 rounded-[1.2rem] bg-slate-50 dark:bg-slate-800 overflow-hidden border border-slate-100 dark:border-slate-700 shrink-0 shadow-inner">
                         {student.logoUrl ? (
                            <img src={student.logoUrl} className="w-full h-full object-cover"/> 
                         ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600 font-bold text-xl">{student.name[0]}</div>
                         )}
                      </div>
                      <div>
                         <h3 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">{student.name}</h3>
                         <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider mt-1 ${isActive ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400'}`}>
                            {isActive ? 'Plano Ativo' : 'Plano Vencido / Inativo'}
                         </span>
                      </div>
                  </div>
                  
                  <div className="flex-1 w-full md:w-auto flex items-center justify-between md:justify-end gap-8 text-sm">
                      {days !== null && (
                         <div className="text-right hidden sm:block">
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-0.5">Vencimento</p>
                            <p className={`font-bold px-3 py-1 rounded-lg border ${isActive ? 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300' : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400'}`}>
                                {new Date(student.planEndDate! + 'T12:00:00').toLocaleDateString('pt-BR')}
                            </p>
                         </div>
                      )}

                      <div className="flex items-center gap-3">
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/student/${student.id}/edit`); }} className="p-3 rounded-2xl text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors" title="Editar">
                            <Edit2 size={20} />
                        </button>
                        <button onClick={(e) => requestDelete(e, student.id)} className="p-3 rounded-2xl text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Excluir">
                            <Trash2 size={20} />
                        </button>
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 group-hover:bg-slate-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-slate-900 transition-all ml-2 shadow-sm">
                            <ChevronRight size={20} />
                        </div>
                      </div>
                  </div>
               </div>
             );
           })
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {studentToDelete && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-md border border-red-100 dark:border-red-900/30">
                  <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                          <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-xl">
                              <AlertTriangle className="text-red-600 dark:text-red-400 w-6 h-6" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Excluir Paciente?</h3>
                      </div>
                      <button onClick={() => setStudentToDelete(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                          <X size={20}/>
                      </button>
                  </div>
                  
                  <div className="space-y-4">
                      <p className="text-slate-600 dark:text-slate-400 text-sm">
                          Esta ação é irreversível e apagará <strong>todos</strong> os dados, avaliações e planos deste paciente.
                      </p>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">
                          Para confirmar, digite <strong className="text-red-600 dark:text-red-400 select-all">excluir</strong> abaixo:
                      </p>
                      
                      <div>
                          <input 
                              type="text" 
                              value={deleteConfirmation} 
                              onChange={(e) => setDeleteConfirmation(e.target.value)}
                              placeholder="Digite 'excluir'"
                              className="w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none font-bold text-slate-700 dark:text-slate-200 placeholder:font-normal placeholder:text-slate-400 transition-all bg-white dark:bg-slate-950"
                          />
                      </div>

                      <div className="flex gap-3 pt-2">
                          <button 
                              onClick={() => setStudentToDelete(null)}
                              className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                          >
                              Cancelar
                          </button>
                          <button 
                              onClick={confirmDelete}
                              disabled={deleteConfirmation.toLowerCase() !== 'excluir' || isDeleting}
                              className={`flex-1 font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${
                                  deleteConfirmation.toLowerCase() === 'excluir' 
                                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-200 dark:shadow-none cursor-pointer active:scale-95' 
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                              }`}
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