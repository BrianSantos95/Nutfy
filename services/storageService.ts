import { Student, Meal, ProfessionalProfile, Assessment, Subscription } from '../types';

const BASE_KEYS = {
  STUDENTS: 'nutriplan_students',
  ASSESSMENTS: 'nutriplan_assessments',
  MEALS: 'nutriplan_meals',
  PROFILE: 'nutriplan_profile',
  SUBSCRIPTION: 'nutriplan_subscription'
};

// Helper para obter a chave baseada no usuário logado
const getKey = (baseKey: string): string => {
  // Check local mock session first
  try {
      const localUser = localStorage.getItem('nutfy_auth_user');
      if (localUser) {
          const user = JSON.parse(localUser);
          if (user.id) return `${baseKey}_${user.id}`;
      }

      // Fallback: Check Supabase session (Legacy support or if switched back)
      const storageKey = Object.keys(localStorage).find(key => key.startsWith('sb-') && key.endsWith('-auth-token'));
      if (storageKey) {
          const sessionData = JSON.parse(localStorage.getItem(storageKey) || '{}');
          const userId = sessionData?.user?.id;
          if (userId) {
              return `${baseKey}_${userId}`;
          }
      }
  } catch (e) {
      console.error("Erro ao recuperar sessão para storage", e);
  }
  // Fallback para chave sem usuário
  return baseKey;
};

export const storageService = {
  // --- Students ---
  getStudents: (): Student[] => {
    try {
      const data = localStorage.getItem(getKey(BASE_KEYS.STUDENTS));
      return data ? JSON.parse(data) : [];
    } catch (e) { return []; }
  },

  saveStudents: (students: Student[]) => {
    localStorage.setItem(getKey(BASE_KEYS.STUDENTS), JSON.stringify(students));
  },

  // --- Assessments (Avaliações) ---
  getAssessments: (studentId?: string): Assessment[] => {
    try {
      const data = localStorage.getItem(getKey(BASE_KEYS.ASSESSMENTS));
      const all: Assessment[] = data ? JSON.parse(data) : [];
      if (studentId) {
        return all.filter(a => a.studentId === studentId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
      return all;
    } catch (e) { return []; }
  },

  saveAssessment: (assessment: Assessment) => {
    const all = storageService.getAssessments();
    const index = all.findIndex(a => a.id === assessment.id);
    
    // Se for uma nova avaliação ativa, arquiva as anteriores deste aluno
    if (assessment.status === 'active') {
        all.forEach(a => {
            if (a.studentId === assessment.studentId) a.status = 'archived';
        });
    }

    if (index >= 0) {
      all[index] = assessment;
    } else {
      all.push(assessment);
    }
    localStorage.setItem(getKey(BASE_KEYS.ASSESSMENTS), JSON.stringify(all));
  },

  deleteAssessment: (id: string) => {
     const all = storageService.getAssessments();
     const filtered = all.filter(a => a.id !== id);
     localStorage.setItem(getKey(BASE_KEYS.ASSESSMENTS), JSON.stringify(filtered));
  },

  // --- Meals ---
  // Agora filtra por AssessmentId preferencialmente
  getMeals: (assessmentId?: string): Meal[] => {
    try {
      const data = localStorage.getItem(getKey(BASE_KEYS.MEALS));
      const all: Meal[] = data ? JSON.parse(data) : [];
      if (assessmentId) {
        return all.filter(m => m.assessmentId === assessmentId);
      }
      return all;
    } catch (e) { return []; }
  },

  saveMeals: (meals: Meal[]) => {
    // Carrega tudo, remove os do assessment atual (para substituir), e adiciona os novos
    const all = storageService.getMeals(); // Pega todos sem filtro
    if (meals.length > 0) {
        const assessmentId = meals[0].assessmentId;
        const others = all.filter(m => m.assessmentId !== assessmentId);
        localStorage.setItem(getKey(BASE_KEYS.MEALS), JSON.stringify([...others, ...meals]));
    } else {
        // Caso de deleção total, lógica precisa ser tratada no componente ou aqui se passarmos o ID
        localStorage.setItem(getKey(BASE_KEYS.MEALS), JSON.stringify(meals));
    }
  },

  // Helper para salvar refeição única sem sobrescrever tudo
  saveMeal: (meal: Meal) => {
      const all = storageService.getMeals(); // todos
      const index = all.findIndex(m => m.id === meal.id);
      if (index >= 0) {
          all[index] = meal;
      } else {
          all.push(meal);
      }
      localStorage.setItem(getKey(BASE_KEYS.MEALS), JSON.stringify(all));
  },

  deleteMeal: (id: string) => {
      const all = storageService.getMeals();
      const filtered = all.filter(m => m.id !== id);
      localStorage.setItem(getKey(BASE_KEYS.MEALS), JSON.stringify(filtered));
  },

  // --- Profile ---
  getProfile: (): ProfessionalProfile | null => {
    try {
      const data = localStorage.getItem(getKey(BASE_KEYS.PROFILE));
      return data ? JSON.parse(data) : null;
    } catch (e) { return null; }
  },

  saveProfile: (profile: ProfessionalProfile) => {
    localStorage.setItem(getKey(BASE_KEYS.PROFILE), JSON.stringify(profile));
  },

  // --- Subscription ---
  getSubscription: (): Subscription | null => {
    try {
        const data = localStorage.getItem(getKey(BASE_KEYS.SUBSCRIPTION));
        return data ? JSON.parse(data) : null;
    } catch (e) { return null; }
  },

  saveSubscription: (sub: Subscription) => {
    localStorage.setItem(getKey(BASE_KEYS.SUBSCRIPTION), JSON.stringify(sub));
  },

  fileToBase64: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }
};