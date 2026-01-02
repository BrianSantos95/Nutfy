
import { supabase } from './supabase';
import { Student, Meal, ProfessionalProfile, Assessment, Subscription } from '../types';

// Helper para evitar erros de data vazia no Postgres
const emptyToNull = (val: string | undefined | null) => (val === '' || val === undefined ? null : val);

const toDbStudent = (s: Student, userId: string) => ({
  id: s.id,
  user_id: userId,
  name: s.name,
  logo_url: s.logoUrl,
  created_at: emptyToNull(s.createdAt),
  contact: s.contact,
  birth_date: emptyToNull(s.birthDate),
  next_appointment: emptyToNull(s.nextAppointment),
  extra_notes: s.extraNotes,
  plan_start_date: emptyToNull(s.planStartDate),
  plan_end_date: emptyToNull(s.planEndDate),
  anamnesis: s.anamnesis
});

const fromDbStudent = (s: any): Student => ({
  id: s.id,
  name: s.name,
  logoUrl: s.logo_url,
  createdAt: s.created_at,
  contact: s.contact,
  birthDate: s.birth_date,
  nextAppointment: s.next_appointment,
  extraNotes: s.extra_notes,
  planStartDate: s.plan_start_date,
  planEndDate: s.plan_end_date,
  anamnesis: s.anamnesis
});

export const storageService = {
  // --- Students ---
  getStudents: async (): Promise<Student[]> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.warn("getStudents: Nenhuma sessão ativa encontrada.");
        return [];
      }

      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Erro Supabase (getStudents):', error.message, 'Código:', error.code);
        throw error;
      }
      return (data || []).map(fromDbStudent);
    } catch (e) {
      console.error('Falha crítica ao buscar estudantes:', e);
      return [];
    }
  },

  saveStudent: async (student: Student) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error("Sessão expirada. Faça login novamente.");

    const payload = toDbStudent(student, session.user.id);
    const { error } = await supabase
      .from('students')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error('Erro Supabase (saveStudent):', error.message);
      throw new Error(`Erro ao salvar no banco: ${error.message}`);
    }
  },

  deleteStudent: async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    const { error } = await supabase.from('students').delete().eq('id', id).eq('user_id', session.user.id);
    if (error) throw error;
  },

  // --- Assessments ---
  getAssessments: async (studentId?: string): Promise<Assessment[]> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return [];

    let query = supabase.from('assessments').select('*').eq('user_id', session.user.id);
    if (studentId) query = query.eq('student_id', studentId);

    const { data, error } = await query.order('date', { ascending: false });
    if (error) throw error;
    return (data || []).map(a => ({
      id: a.id,
      studentId: a.student_id,
      date: a.date,
      weight: a.weight,
      height: a.height,
      calorieGoal: a.calorie_goal,
      bodyFat: a.body_fat,
      notes: a.notes,
      objective: a.objective,
      activityLevel: a.activity_level,
      status: a.status
    }));
  },

  saveAssessment: async (assessment: Assessment) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error("Não autenticado");

    const payload = {
      id: assessment.id,
      user_id: session.user.id,
      student_id: assessment.studentId,
      date: emptyToNull(assessment.date),
      weight: assessment.weight,
      height: assessment.height,
      calorie_goal: assessment.calorieGoal,
      body_fat: assessment.bodyFat,
      notes: assessment.notes,
      objective: assessment.objective,
      activity_level: assessment.activityLevel,
      status: assessment.status
    };

    const { error } = await supabase.from('assessments').upsert(payload, { onConflict: 'id' });
    if (error) throw error;
  },

  deleteAssessment: async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    await supabase.from('assessments').delete().eq('id', id).eq('user_id', session.user.id);
  },

  // --- Meals ---
  getMeals: async (assessmentId?: string): Promise<Meal[]> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return [];

    let query = supabase.from('meals').select('*').eq('user_id', session.user.id);
    if (assessmentId) query = query.eq('assessment_id', assessmentId);

    const { data, error } = await query;
    if (error) return [];
    return (data || []).map(m => ({
      id: m.id,
      studentId: m.student_id,
      assessmentId: m.assessment_id,
      name: m.name,
      description: m.description,
      quantity: m.quantity,
      calories: m.calories,
      time: m.time,
      type: m.type,
      foods: m.foods
    }));
  },

  saveMeal: async (meal: Meal) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error("Não autenticado");

    const payload = {
      id: meal.id,
      user_id: session.user.id,
      student_id: meal.studentId,
      assessment_id: meal.assessmentId,
      name: meal.name,
      description: meal.description,
      quantity: meal.quantity,
      calories: meal.calories,
      time: meal.time,
      type: meal.type,
      foods: meal.foods
    };

    const { error } = await supabase.from('meals').upsert(payload, { onConflict: 'id' });
    if (error) throw error;
  },

  deleteMeal: async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    await supabase.from('meals').delete().eq('id', id).eq('user_id', session.user.id);
  },

  // --- Profile ---
  getProfile: async (): Promise<ProfessionalProfile | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (error || !data) return null;
    return {
      name: data.name,
      title: data.title,
      registration: data.registration,
      logoUrl: data.logo_url,
      phone: data.phone
    };
  },

  saveProfile: async (profile: ProfessionalProfile) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) throw new Error("Não autenticado");

    const { error } = await supabase.from('profiles').upsert({
      user_id: session.user.id,
      name: profile.name,
      title: profile.title,
      registration: profile.registration,
      logo_url: profile.logoUrl,
      phone: profile.phone
    }, { onConflict: 'user_id' });

    if (error) throw error;
  },

  // --- Subscription ---
  getSubscription: async (): Promise<Subscription | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (error || !data) return null;
    return {
      startDate: data.start_date,
      trialEndDate: data.trial_end_date,
      planExpirationDate: data.plan_expiration_date,
      status: data.status,
      planType: data.plan_type
    };
  },

  saveSubscription: async (sub: Subscription) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    await supabase.from('subscriptions').upsert({
      user_id: session.user.id,
      start_date: emptyToNull(sub.startDate),
      trial_end_date: emptyToNull(sub.trialEndDate),
      plan_expiration_date: emptyToNull(sub.planExpirationDate),
      status: sub.status,
      plan_type: sub.planType
    }, { onConflict: 'user_id' });
  },

  fileToBase64: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }
};
