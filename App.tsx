import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Dashboard } from './pages/Dashboard';
import { StudentForm } from './pages/StudentForm';
import { PatientProgress } from './pages/PatientProgress';
import { AssessmentForm } from './pages/AssessmentForm';
import { MealManager } from './pages/MealManager';
import { MealForm } from './pages/MealForm';
import { PlanPreview } from './pages/PlanPreview';
import { Success } from './pages/Success';
import { Profile } from './pages/Profile';
import { SubscriptionPage } from './pages/SubscriptionPage';
import { MonthlyReport } from './pages/MonthlyReport';
import { AIChat } from './pages/AIChat';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ResetPassword } from './pages/ResetPassword';
import { subscriptionService } from './services/subscriptionService';
import { Lock, Loader2 } from 'lucide-react';

// Protege rotas verificando LOGIN e ASSINATURA
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    const [checkingSub, setCheckingSub] = useState(true);
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const check = async () => {
            if (user) {
                try {
                    const sub = await subscriptionService.initializeSubscription();
                    if (sub.status === 'expired') {
                        setIsExpired(true);
                    }
                } catch (error) {
                    console.error("Erro ao verificar assinatura:", error);
                }
            }
            setCheckingSub(false);
        };
        if (!loading) {
            check();
        }
    }, [user, loading]);
    
    if (loading || checkingSub) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-emerald-600 w-10 h-10" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (isExpired) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><Lock size={32} /></div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Assinatura Expirada</h2>
                    <p className="text-slate-500 mb-6 text-sm">Seu período de teste ou plano Premium chegou ao fim. Renove para continuar utilizando a plataforma.</p>
                    <a href="#/subscription" className="block w-full bg-emerald-600 text-white py-3 rounded-xl font-bold mt-4 shadow-lg shadow-emerald-100">Ver Planos</a>
                </div>
            </div>
        );
    }
    return <>{children}</>;
};

// Redireciona usuários logados para a dashboard se tentarem acessar login
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (user) return <Navigate to="/" replace />;
    return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
        <HashRouter>
        <Routes>
            {/* Rotas Públicas */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Rotas Privadas */}
            <Route path="/subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><MonthlyReport /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><AIChat /></ProtectedRoute>} />
            
            {/* Student Management */}
            <Route path="/student/new" element={<ProtectedRoute><StudentForm /></ProtectedRoute>} />
            <Route path="/student/:id/edit" element={<ProtectedRoute><StudentForm /></ProtectedRoute>} />
            
            {/* Hub / History of Assessments */}
            <Route path="/student/:studentId/progress" element={<ProtectedRoute><PatientProgress /></ProtectedRoute>} />
            
            {/* Assessment Management */}
            <Route path="/student/:studentId/assessment/new" element={<ProtectedRoute><AssessmentForm /></ProtectedRoute>} />
            <Route path="/student/:studentId/assessment/:assessmentId/edit" element={<ProtectedRoute><AssessmentForm /></ProtectedRoute>} />
            
            {/* Meals linked to Assessment */}
            <Route path="/student/:studentId/assessment/:assessmentId/meals" element={<ProtectedRoute><MealManager /></ProtectedRoute>} />
            <Route path="/student/:studentId/assessment/:assessmentId/meal/new" element={<ProtectedRoute><MealForm /></ProtectedRoute>} />
            <Route path="/student/:studentId/assessment/:assessmentId/meal/:mealId" element={<ProtectedRoute><MealForm /></ProtectedRoute>} />
            
            <Route path="/student/:studentId/assessment/:assessmentId/preview" element={<ProtectedRoute><PlanPreview /></ProtectedRoute>} />
            <Route path="/student/:studentId/success" element={<ProtectedRoute><Success /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </HashRouter>
    </AuthProvider>
  );
};

export default App;