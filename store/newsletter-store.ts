import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { NewsletterSubscription } from '@/types';

interface NewsletterState {
  subscriptions: NewsletterSubscription[];
  isLoading: boolean;
  error: string | null;
  success: boolean;
  
  // Actions
  subscribeToNewsletter: (email: string) => Promise<boolean>;
  unsubscribeFromNewsletter: (email: string) => Promise<boolean>;
  fetchSubscriptions: () => Promise<void>;
  clearError: () => void;
  clearSuccess: () => void;
}

export const useNewsletterStore = create<NewsletterState>()(
  persist(
    (set, get) => ({
      subscriptions: [],
      isLoading: false,
      error: null,
      success: false,
      
      subscribeToNewsletter: async (email: string) => {
        set({ isLoading: true, error: null, success: false });
        
        try {
          // Validate email
          if (!email || !email.includes('@')) {
            throw new Error("Veuillez entrer un email valide");
          }
          
          // Insert into newsletter_subscriptions table
          const { data, error } = await supabase
            .from('newsletter_subscriptions')
            .upsert([
              { 
                email: email.trim().toLowerCase(),
                status: 'active',
                subscribed_at: new Date().toISOString()
              }
            ], { 
              onConflict: 'email',
              ignoreDuplicates: false
            })
            .select();
          
          if (error) throw error;
          
          // Update local state with the new subscription
          if (data && data.length > 0) {
            const newSubscription: NewsletterSubscription = {
              id: data[0].id,
              email: data[0].email,
              status: data[0].status,
              subscribedAt: data[0].subscribed_at,
            };
            
            set(state => ({
              subscriptions: [...state.subscriptions, newSubscription],
              isLoading: false,
              success: true
            }));
            
            // Reset success after 3 seconds
            setTimeout(() => {
              set({ success: false });
            }, 3000);
            
            return true;
          }
          
          set({ isLoading: false, success: true });
          return true;
        } catch (error) {
          console.error('Newsletter subscription error:', error);
          set({ 
            error: handleSupabaseError(error), 
            isLoading: false,
            success: false
          });
          return false;
        }
      },
      
      unsubscribeFromNewsletter: async (email: string) => {
        set({ isLoading: true, error: null, success: false });
        
        try {
          // Update status to 'unsubscribed'
          const { error } = await supabase
            .from('newsletter_subscriptions')
            .update({ status: 'unsubscribed' })
            .eq('email', email.trim().toLowerCase());
          
          if (error) throw error;
          
          // Update local state
          set(state => ({
            subscriptions: state.subscriptions.map(sub => 
              sub.email === email.trim().toLowerCase() 
                ? { ...sub, status: 'unsubscribed' } 
                : sub
            ),
            isLoading: false,
            success: true
          }));
          
          // Reset success after 3 seconds
          setTimeout(() => {
            set({ success: false });
          }, 3000);
          
          return true;
        } catch (error) {
          console.error('Newsletter unsubscribe error:', error);
          set({ 
            error: handleSupabaseError(error), 
            isLoading: false,
            success: false
          });
          return false;
        }
      },
      
      fetchSubscriptions: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Only fetch active subscriptions
          const { data, error } = await supabase
            .from('newsletter_subscriptions')
            .select('*')
            .eq('status', 'active');
          
          if (error) throw error;
          
          if (data) {
            const subscriptions: NewsletterSubscription[] = data.map(sub => ({
              id: sub.id,
              email: sub.email,
              status: sub.status,
              subscribedAt: sub.subscribed_at,
            }));
            
            set({ subscriptions, isLoading: false });
          }
        } catch (error) {
          console.error('Fetch subscriptions error:', error);
          set({ 
            error: handleSupabaseError(error), 
            isLoading: false 
          });
        }
      },
      
      clearError: () => set({ error: null }),
      clearSuccess: () => set({ success: false }),
    }),
    {
      name: 'afritix-newsletter-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        // Only persist subscriptions, not loading states or errors
        subscriptions: state.subscriptions 
      }),
    }
  )
);