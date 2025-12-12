import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { User, Award, Hash, Save, Upload, Loader2 } from 'lucide-react';
import { storageService } from '../services/storageService';
import { ProfessionalProfile } from '../types';

export const Profile: React.FC = () => {
  const [profile, setProfile] = useState<ProfessionalProfile>({
    name: '',
    title: '',
    registration: '',
    logoUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    storageService.getProfile().then(savedProfile => {
      if (savedProfile) {
        setProfile(savedProfile);
      }
      setLoading(false);
    });
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setSaving(true);
        const url = await storageService.fileToBase64(file);
        setProfile(prev => ({ ...prev, logoUrl: url }));
      } catch (err) {
        alert('Erro ao carregar imagem');
      } finally {
        setSaving(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.name.trim()) {
      alert('O Nome Profissional é obrigatório para gerar os planos.');
      return;
    }
    
    setSaving(true);
    try {
        await storageService.saveProfile(profile);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    } catch (e) {
        alert("Erro ao salvar perfil.");
    } finally {
        setSaving(false);
    }
  };

  if (loading) {
      return (
          <Layout title="Perfil">
             <div className="flex h-[50vh] items-center justify-center">
                 <Loader2 className="animate-spin text-emerald-600 w-10 h-10" />
             </div>
          </Layout>
      );
  }

  return (
    <Layout title="Perfil Profissional" showBack>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <User className="text-emerald-600" />
              Identificação Profissional
            </h2>
            <p className="text-slate-500 mt-2">
              Estas informações aparecerão automaticamente no cabeçalho e rodapé de todos os PDFs gerados.
              <span className="block mt-1 font-medium text-emerald-600">* O nome é obrigatório para exportar.</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Logo Upload Section */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100 mb-6">
               <div className="relative group cursor-pointer w-24 h-24 shrink-0">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleLogoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={saving}
                  />
                  <div className={`w-full h-full rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden transition-all bg-white ${profile.logoUrl ? 'border-emerald-500' : 'border-slate-300 hover:border-emerald-400'}`}>
                    {profile.logoUrl ? (
                      <img src={profile.logoUrl} alt="Logo Profissional" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-1">
                        <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                        <span className="text-[9px] text-slate-400 uppercase font-bold block">Sua Logo</span>
                      </div>
                    )}
                  </div>
               </div>
               <div className="text-center sm:text-left">
                  <h3 className="font-semibold text-slate-800">Logo do Profissional</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Carregue sua logomarca para personalizar os documentos. Recomendado: Formato quadrado (PNG ou JPG).
                  </p>
                  {profile.logoUrl && (
                    <button 
                      type="button" 
                      onClick={() => setProfile(prev => ({...prev, logoUrl: ''}))}
                      className="text-xs text-red-500 hover:text-red-700 mt-2 font-medium"
                    >
                      Remover Logo
                    </button>
                  )}
               </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo do Profissional *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Nome completo do profissional"
                  value={profile.name}
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none placeholder-slate-400"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título Profissional (Opcional)</label>
                <div className="relative">
                  <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Ex: Nutricionista"
                    value={profile.title || ''}
                    onChange={e => setProfile({ ...profile, title: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none placeholder-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Registro Profissional (Opcional)</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Ex: CRN-3 12345, CREF 000000-G"
                    value={profile.registration || ''}
                    onChange={e => setProfile({ ...profile, registration: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none placeholder-slate-400"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              {showSuccess ? (
                <div className="text-emerald-600 font-medium animate-pulse">
                  Informações salvas com sucesso!
                </div>
              ) : (
                 <div></div>
              )}
              <button
                type="submit"
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                Salvar Informações
              </button>
            </div>
          </form>
        </div>

        {/* Preview Box */}
        <div className="mt-8 bg-slate-100 border border-slate-200 rounded-xl p-6 opacity-80">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Como aparecerá no PDF</h3>
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm max-w-sm">
             <div className="flex items-start gap-4">
                <div className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center border border-slate-200 bg-slate-50 overflow-hidden">
                  {profile.logoUrl ? (
                    <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-slate-400">Logo</span>
                  )}
                </div>
                <div>
                   <div className="font-bold text-slate-800">{profile.name || "Nome do Profissional"}</div>
                   {(profile.title || profile.registration) && (
                     <div className="text-xs text-slate-500 mt-1">
                       {profile.title} <br/>
                       {profile.registration}
                     </div>
                   )}
                </div>
             </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};