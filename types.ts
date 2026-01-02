export interface Anamnesis {
  objective: string;
  objectiveOther?: string;
  healthHistory: string;
  restrictions: string[];
  restrictionsOther?: string;
  allergies: string;
  preferences: string;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'intense' | 'athlete' | '';
  generalNotes: string;
}

export interface Student {
  id: string;
  name: string;
  logoUrl?: string;
  createdAt: string;
  contact?: string;      // Novo: Telefone/Email
  birthDate?: string;    // Novo: Data de Nascimento
  nextAppointment?: string;
  extraNotes?: string;   // Notas gerais do aluno (administrativas)

  // Dados de Anamnese (Novo)
  anamnesis?: Anamnesis;

  // Controle de Plano (Vencimento)
  planStartDate?: string;
  planEndDate?: string;
}

export interface Assessment {
  id: string;
  studentId: string;
  date: string;
  weight: number;
  height: number;
  calorieGoal: number;
  bodyFat?: number;
  notes?: string;       // Observações da avaliação

  // Anamnese Específica desta avaliação (opcional, pode variar com o tempo)
  objective?: string;
  activityLevel?: string;

  status: 'active' | 'archived'; // A última é sempre active
}

export interface FoodItem {
  id: string;
  name: string;
  quantity: string;
  calories: number;
  substitutions?: string;
}

export interface Meal {
  id: string;
  studentId: string;     // Mantido para referência rápida
  assessmentId: string;  // Novo: Vínculo com a avaliação específica
  name: string;
  description: string;
  quantity: string;
  calories: number;
  time: string;
  type: 'normal' | 'free';
  foods?: FoodItem[];
}

export interface ProfessionalProfile {
  name: string;
  title?: string;
  registration?: string;
  logoUrl?: string;
  phone?: string;
}

// Subscription types
export type SubscriptionStatus = 'trial' | 'premium' | 'expired';
export type PlanType = 'monthly' | 'yearly' | null;

export interface Subscription {
  startDate: string;
  trialEndDate: string;
  planExpirationDate?: string;
  status: SubscriptionStatus;
  planType: PlanType;
}