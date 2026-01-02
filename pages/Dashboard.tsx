
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2, Edit2, ChevronRight, Sun, Moon, Sunrise, Users, Activity, PauseCircle, CheckCircle2, XCircle, AlertTriangle, X, Loader2, RefreshCw } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Student, ProfessionalProfile } from '../types';
import { storageService } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [loadingData, setLoadingData] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    if (!user) return;
    setLoadingData(true);
    setErrorMsg('');
    try {
        const [loadedStudents, loadedProfile] = await Promise.all([
            storageService.getStudents(),
            storageService.getProfile()
        ]);
        setStudents(loadedStudents);
        setProfile(loadedProfile);
    } catch (error: any) {
        console.error("Erro ao carregar dashboard:", error);
        setErrorMsg('Erro ao conectar com o servidor de dados.');
    } finally {
        setLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

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
            setStudents(prev => prev.filter(s => s.id !== studentToDelete));
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
      if (hour < 12) return { label: 'Bom dia', icon: Sunrise, blobColor: 'bg-orange-100 dark:bg-orange-900/20', textGradient: 'from-orange-500 to-amber-500' };
      if (hour < 18) return { label: 'Boa tarde', icon: Sun, blobColor: 'bg-blue-100 dark:bg-blue-900/20', textGradient: 'from-blue-500 to-indigo-500' };
      return { label: 'Boa noite', icon: Moon, blobColor: 'bg-emerald-100 dark:bg-emerald-900/20', textGradient: 'from-emerald-600 to-teal-500' };
  };

  const getDaysRemaining = (endDateStr?: string) => {
    if (!endDateStr) return null;
    const end = new Date(endDateStr + 'T12:00:00');
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
      if (days !== null && days >= 0) activeCount++;
      else inactiveCount++;
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
              <div className="flex h-[60vh] items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-emerald-500 w-12 h-12" />
                    <p className="text-slate-500 font-medium animate-pulse">Sincronizando seus dados...</p>
                  </div>
              </div>
          </Layout>
      );
  }

  return (
    <Layout>
      {errorMsg && (
        <div className="mb-6 bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center justify-between">
           <div className="flex items-center gap-3 text-red-600 font-medium">
              <AlertTriangle size={20} />
              {errorMsg}
           </div>
           <button onClick={loadData} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-red-100">
              <RefreshCw size={14} /> Tentar Novamente
           </button>
        </div>
      )}

      <div className="mb-10">
         <div className="rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 border border-white dark:border-slate-800 relative overflow-hidden bg-white dark:bg-slate-900 transition-colors">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-200/40 flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                  <Users size={28} />
              </div>
              <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Total de Pacientes</p>
                  <h3 className="text-4xl font-extrabold text-slate-800 dark:text-white">{students.length}</h3>
              </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-200/40 flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Activity size={28} />
              </div>
              <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Planos Ativos</p>
                  <h3 className="text-4xl font-extrabold text-slate-800 dark:text-white">{activeCount}</h3>
              </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-200/40 flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center">
                  <PauseCircle size={28} />
              </div>
              <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Inativos / Vencidos</p>
                  <h3 className="text-4xl font-extrabold text-slate-800 dark:text-white">{inactiveCount}</h3>
              </div>
          </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
         <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Seus Pacientes</h2>
            <button onClick={loadData} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors" title="Atualizar dados">
               <RefreshCw size={18} className={loadingData ? 'animate-spin' : ''} />
            </button>
         </div>
         
         <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
             <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm self-start md:self-auto">
                 <button onClick={() => setStatusFilter('all')} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${statusFilter === 'all' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50'}`}>Todos</button>
                 <button onClick={() => setStatusFilter('active')} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${statusFilter === 'active' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50'}`}>Ativos</button>
                 <button onClick={() => setStatusFilter('inactive')} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${statusFilter === 'inactive' ? 'bg-red-500 text-white shadow-md shadow-red-200' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50'}`}>Inativos</button>
             </div>

             <div className="relative group w-full md:w-72">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
                 <input type="text" placeholder="Buscar paciente..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-12 pr-6 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-emerald-100 outline-none transition-all shadow-sm text-slate-800 dark:text-white" />
             </div>
         </div>
      </div>

      <div className="space-y-4 pb-20">
        {filteredStudents.length === 0 ? (
           <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
             <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Users className="text-slate-300" size={32} />
             </div>
             <p className="text-slate-500 dark:text-slate-400 font-medium">Você ainda não tem pacientes cadastrados ou nada foi encontrado.</p>
             <button onClick={() => navigate('/student/new')} className="text-emerald-600 dark:text-emerald-400 font-bold mt-2 hover:underline text-sm">Clique para cadastrar o primeiro</button>
           </div>
        ) : (
           filteredStudents.map(student => {
             const days = getDaysRemaining(student.planEndDate);
             const isActive = days !== null && days >= 0;
             return (
               <div key={student.id} onClick={() => navigate(`/student/${student.id}/progress`)} className="group bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
                  <div className={`absolute left-0 top-0 bottom-0 w-2 ${isActive ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                  <div className="flex items-center gap-5 w-full md:w-1/2 pl-4">
                      <div className="w-16 h-16 rounded-[1.2rem] bg-slate-50 dark:bg-slate-800 overflow-hidden border border-slate-100 shrink-0">
                         {student.logoUrl ? <img src={student.logoUrl} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-xl">{student.name[0]}</div>}
                      </div>
                      <div>
                         <h3 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-emerald-700 transition-colors">{student.name}</h3>
                         <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider mt-1 ${isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                            {isActive ? 'Plano Ativo' : 'Plano Vencido'}
                         </span>
                      </div>
                  </div>
                  <div className="flex-1 w-full md:w-auto flex items-center justify-between md:justify-end gap-8 text-sm">
                      <div className="text-right hidden sm:block">
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Vencimento</p>
                         <p className="font-bold text-slate-700 dark:text-slate-300">{student.planEndDate ? new Date(student.planEndDate + 'T12:00:00').toLocaleDateString('pt-BR') : '--'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/student/${student.id}/edit`); }} className="p-3 rounded-2xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"><Edit2 size={20} /></button>
                        <button onClick={(e) => requestDelete(e, student.id)} className="p-3 rounded-2xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={20} /></button>
                        <ChevronRight size={20} className="text-slate-300 group-hover:text-slate-600" />
                      </div>
                  </div>
               </div>
             );
           })
        )}
      </div>

      {studentToDelete && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-md border border-red-100">
                  <div className="flex justify-between items-start mb-6">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Excluir Paciente?</h3>
                      <button onClick={() => setStudentToDelete(null)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">Digite <strong>excluir</strong> para confirmar a remoção definitiva.</p>
                  <input type="text" value={deleteConfirmation} onChange={(e) => setDeleteConfirmation(e.target.value)} placeholder="Digite 'excluir'" className="w-full px-4 py-3 border border-slate-200 rounded-xl mb-4 outline-none focus:border-red-500" />
                  <div className="flex gap-3">
                      <button onClick={() => setStudentToDelete(null)} className="flex-1 bg-slate-100 py-3 rounded-xl font-bold">Cancelar</button>
                      <button onClick={confirmDelete} disabled={deleteConfirmation.toLowerCase() !== 'excluir' || isDeleting} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold disabled:opacity-50">Excluir</button>
                  </div>
              </div>
          </div>
      )}
    </Layout>
  );
};
