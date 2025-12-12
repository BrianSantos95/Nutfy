import { Student, Meal, ProfessionalProfile, Assessment, Subscription } from '../types';

// Simula delay de rede
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const DATA_KEYS = {
    STUDENTS: 'nutfy_students',
    ASSESSMENTS: 'nutfy_assessments',
    MEALS: 'nutfy_meals',
    PROFILE: 'nutfy_profile',
    SUBSCRIPTION: 'nutfy_subscription'
};

export const storageService = {
  // --- Students ---
  getStudents: async (): Promise<Student[]> => {
    await delay(100);
    const data = localStorage.getItem(DATA_KEYS.STUDENTS);
    return data ? JSON.parse(data) : [];
  },

  saveStudent: async (student: Student) => {
    await delay(200);
    const students = await storageService.getStudents();
    const index = students.findIndex(s => s.id === student.id);
    
    if (index >= 0) {
        students[index] = student;
    } else {
        students.push(student);
    }
    localStorage.setItem(DATA_KEYS.STUDENTS, JSON.stringify(students));
  },

  deleteStudent: async (id: string) => {
      await delay(200);
      const students = await storageService.getStudents();
      const filtered = students.filter(s => s.id !== id);
      localStorage.setItem(DATA_KEYS.STUDENTS, JSON.stringify(filtered));
      
      // Limpeza em cascata simples
      const assessments = await storageService.getAssessments();
      const keptAssessments = assessments.filter(a => a.studentId !== id);
      localStorage.setItem(DATA_KEYS.ASSESSMENTS, JSON.stringify(keptAssessments));
  },

  // --- Assessments ---
  getAssessments: async (studentId?: string): Promise<Assessment[]> => {
    await delay(100);
    const data = localStorage.getItem(DATA_KEYS.ASSESSMENTS);
    const all: Assessment[] = data ? JSON.parse(data) : [];
    if (studentId) return all.filter(a => a.studentId === studentId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return all.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  saveAssessment: async (assessment: Assessment) => {
    await delay(200);
    const all = await storageService.getAssessments();
    
    // Arquiva outros se este for ativo
    if (assessment.status === 'active') {
        all.forEach(a => {
            if (a.studentId === assessment.studentId && a.id !== assessment.id) {
                a.status = 'archived';
            }
        });
    }

    const index = all.findIndex(a => a.id === assessment.id);
    if (index >= 0) {
        all[index] = assessment;
    } else {
        all.push(assessment);
    }
    localStorage.setItem(DATA_KEYS.ASSESSMENTS, JSON.stringify(all));
  },

  deleteAssessment: async (id: string) => {
     await delay(200);
     const all = await storageService.getAssessments();
     const filtered = all.filter(a => a.id !== id);
     localStorage.setItem(DATA_KEYS.ASSESSMENTS, JSON.stringify(filtered));
  },

  // --- Meals ---
  getMeals: async (assessmentId?: string): Promise<Meal[]> => {
    await delay(100);
    const data = localStorage.getItem(DATA_KEYS.MEALS);
    const all: Meal[] = data ? JSON.parse(data) : [];
    if (assessmentId) return all.filter(m => m.assessmentId === assessmentId);
    return all;
  },

  saveMeal: async (meal: Meal) => {
      await delay(200);
      const all = await storageService.getMeals();
      const index = all.findIndex(m => m.id === meal.id);
      if (index >= 0) {
          all[index] = meal;
      } else {
          all.push(meal);
      }
      localStorage.setItem(DATA_KEYS.MEALS, JSON.stringify(all));
  },

  deleteMeal: async (id: string) => {
      await delay(200);
      const all = await storageService.getMeals();
      const filtered = all.filter(m => m.id !== id);
      localStorage.setItem(DATA_KEYS.MEALS, JSON.stringify(filtered));
  },

  // --- Profile ---
  getProfile: async (): Promise<ProfessionalProfile | null> => {
    await delay(100);
    const data = localStorage.getItem(DATA_KEYS.PROFILE);
    return data ? JSON.parse(data) : null;
  },

  saveProfile: async (profile: ProfessionalProfile) => {
    await delay(200);
    localStorage.setItem(DATA_KEYS.PROFILE, JSON.stringify(profile));
  },

  // --- Subscription ---
  getSubscription: async (): Promise<Subscription | null> => {
      await delay(100);
      const data = localStorage.getItem(DATA_KEYS.SUBSCRIPTION);
      return data ? JSON.parse(data) : null;
  },

  saveSubscription: async (sub: Subscription) => {
    await delay(200);
    localStorage.setItem(DATA_KEYS.SUBSCRIPTION, JSON.stringify(sub));
  },

  // --- Files (Local FileReader) ---
  fileToBase64: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
  }
};