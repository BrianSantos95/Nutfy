import { Subscription, PlanType } from '../types';
import { storageService } from './storageService';

export const subscriptionService = {
  
  initializeSubscription: async (): Promise<Subscription> => {
    const existing = await storageService.getSubscription();
    
    // Verificação de status atual
    if (existing) {
        // Se for premium, verifica se expirou
        if (existing.status === 'premium' && existing.planExpirationDate) {
            const now = new Date();
            const expDate = new Date(existing.planExpirationDate);
            if (now > expDate) {
                const expiredSub: Subscription = { ...existing, status: 'expired' };
                await storageService.saveSubscription(expiredSub);
                return expiredSub;
            }
        }
        
        // Se for trial, verifica se acabou os 7 dias
        if (existing.status === 'trial') {
            const now = new Date();
            const trialEnd = new Date(existing.trialEndDate);
            if (now > trialEnd) {
                const expiredSub: Subscription = { ...existing, status: 'expired' };
                await storageService.saveSubscription(expiredSub);
                return expiredSub;
            }
        }
        
        return existing;
    }

    // Primeira vez acessando o app: Cria teste grátis
    const now = new Date();
    const trialEnd = new Date(now);
    trialEnd.setDate(now.getDate() + 7); // 7 dias grátis

    const newSub: Subscription = {
        startDate: now.toISOString(),
        trialEndDate: trialEnd.toISOString(),
        status: 'trial',
        planType: null
    };

    await storageService.saveSubscription(newSub);
    return newSub;
  },

  getDaysRemaining: async (): Promise<number> => {
      const sub = await subscriptionService.initializeSubscription();
      const now = new Date();
      
      if (sub.status === 'trial') {
          const end = new Date(sub.trialEndDate);
          const diffTime = Math.abs(end.getTime() - now.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
          return now > end ? 0 : diffDays;
      }
      
      if (sub.status === 'premium' && sub.planExpirationDate) {
          const end = new Date(sub.planExpirationDate);
          const diffTime = Math.abs(end.getTime() - now.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return now > end ? 0 : diffDays;
      }

      return 0;
  },

  upgradeSubscription: async (type: PlanType): Promise<void> => {
      const sub = await storageService.getSubscription();
      if (!sub) return;

      const now = new Date();
      const expirationDate = new Date(now);
      
      if (type === 'monthly') {
          expirationDate.setDate(now.getDate() + 30);
      } else if (type === 'yearly') {
          expirationDate.setDate(now.getDate() + 365);
      }

      const upgradedSub: Subscription = {
          ...sub,
          status: 'premium',
          planType: type,
          planExpirationDate: expirationDate.toISOString()
      };

      await storageService.saveSubscription(upgradedSub);
  },
  
  // Cancela a assinatura removendo os dados locais e recarregando a página
  cancelSubscription: () => {
     localStorage.removeItem('nutriplan_subscription');
     window.location.reload();
  },

  // Mantido para compatibilidade se necessário, mas redireciona para o cancel
  resetSubscription: () => {
     subscriptionService.cancelSubscription();
  }
};