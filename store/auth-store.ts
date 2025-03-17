import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, PaymentMethod, NotificationPreferences, UserSettings } from '@/types';
import { supabase, handleSupabaseError } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  paymentMethods: PaymentMethod[];
  notificationPreferences: NotificationPreferences | null;
  userSettings: UserSettings | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  fetchPaymentMethods: () => Promise<void>;
  fetchNotificationPreferences: () => Promise<void>;
  fetchUserSettings: () => Promise<void>;
  updateNotificationPreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
  updateUserSettings: (settings: Partial<UserSettings>) => Promise<void>;
  uploadAvatar: (uri: string) => Promise<string>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      paymentMethods: [],
      notificationPreferences: null,
      userSettings: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Login attempt with email:', email);
          
          // Fix: Properly handle the auth response structure
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (error) {
            console.error('Supabase login error:', JSON.stringify(error, null, 2));
            throw error;
          }
          
          console.log('Login successful, user:', data.user?.id);
          
          if (data.user) {
            // Fetch user profile data from profiles table
            // Using maybeSingle() instead of single() to handle case where profile doesn't exist
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .maybeSingle();
            
            if (profileError) {
              console.error('Profile fetch error:', JSON.stringify(profileError, null, 2));
              // Continue with basic user info
              const user: User = {
                id: data.user.id,
                name: data.user.email?.split('@')[0] || 'User',
                email: data.user.email || '',
                avatar: null,
              };
              
              set({ user, isAuthenticated: true, isLoading: false });
              return;
            }
            
            // If profile doesn't exist, create one
            if (!profileData) {
              console.log('Profile not found, creating new profile');
              
              // Create a profile record
              const { error: insertError } = await supabase
                .from('profiles')
                .insert([
                  {
                    id: data.user.id,
                    name: data.user.email?.split('@')[0] || 'User',
                    email: data.user.email,
                    updated_at: new Date().toISOString(),
                  }
                ]);
              
              if (insertError) {
                console.error('Profile creation error:', JSON.stringify(insertError, null, 2));
              }
              
              const user: User = {
                id: data.user.id,
                name: data.user.email?.split('@')[0] || 'User',
                email: data.user.email || '',
                avatar: null,
              };
              
              set({ user, isAuthenticated: true, isLoading: false });
              return;
            }
            
            const user: User = {
              id: data.user.id,
              name: profileData?.name || data.user.email?.split('@')[0] || 'User',
              email: data.user.email || '',
              avatar: profileData?.avatar_url,
              phone: profileData?.phone || null,
              location: profileData?.location || null,
              bio: profileData?.bio || null,
            };
            
            console.log('Setting user state:', user.name);
            set({ user, isAuthenticated: true, isLoading: false });
            
            // Fetch additional user data
            const authStore = get();
            authStore.fetchPaymentMethods();
            authStore.fetchNotificationPreferences();
            authStore.fetchUserSettings();
          } else {
            throw new Error('Aucun utilisateur trouvé');
          }
        } catch (error) {
          console.error('Login error:', error);
          set({ error: handleSupabaseError(error), isLoading: false });
        }
      },
      
      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          console.log('Registration attempt with email:', email);
          
          // Fix: Properly handle the auth response structure
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name: name,
              },
            },
          });
          
          if (error) {
            console.error('Registration auth error:', JSON.stringify(error, null, 2));
            throw error;
          }
          
          console.log('Registration successful, user:', data.user?.id);
          
          if (data.user) {
            // Wait for the session to be established before creating profile
            // This ensures the RLS policy will work correctly
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError) {
              console.error('Session fetch error:', JSON.stringify(sessionError, null, 2));
              throw sessionError;
            }
            
            if (!sessionData.session) {
              console.log('No active session found after registration');
              // Try to sign in to establish a session
              const { error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
              });
              
              if (signInError) {
                console.error('Auto sign-in error:', JSON.stringify(signInError, null, 2));
                throw signInError;
              }
            }
            
            console.log('Session established, creating profile');
            
            // Create a profile record in the profiles table
            // IMPORTANT: Use the user's ID as the id field, not user_id
            const { error: profileError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: data.user.id, // This should match the auth.users.id
                  name: name,
                  email: email,
                  updated_at: new Date().toISOString(),
                  settings: {
                    language: 'fr',
                    theme: 'light',
                    currency: 'XOF'
                  }
                }
              ]);
            
            if (profileError) {
              console.error('Profile creation error:', JSON.stringify(profileError, null, 2));
              
              // If we get an RLS error, we need to handle it differently
              if (profileError.code === '42501') {
                console.log('RLS policy error, using upsert instead');
                
                // Try using upsert instead which might have different RLS policies
                const { error: upsertError } = await supabase
                  .from('profiles')
                  .upsert([
                    {
                      id: data.user.id,
                      name: name,
                      email: email,
                      updated_at: new Date().toISOString(),
                      settings: {
                        language: 'fr',
                        theme: 'light',
                        currency: 'XOF'
                      }
                    }
                  ]);
                
                if (upsertError) {
                  console.error('Profile upsert error:', JSON.stringify(upsertError, null, 2));
                  // Continue anyway, as the user was created
                }
              }
            }
            
            // Create default notification preferences
            const { error: notifError } = await supabase
              .from('notification_preferences')
              .insert([
                {
                  user_id: data.user.id,
                  email: true,
                  push: true,
                  types: ['events', 'tickets', 'promotions']
                }
              ]);
            
            if (notifError) {
              console.error('Notification preferences creation error:', JSON.stringify(notifError, null, 2));
            }
            
            const user: User = {
              id: data.user.id,
              name: name,
              email: email,
              avatar: null,
            };
            
            // Create default user settings
            const defaultSettings: UserSettings = {
              userId: user.id,
              language: 'fr',
              theme: 'light',
              currency: 'XOF',
            };
            
            console.log('Setting user state after registration:', user.name);
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false,
              userSettings: defaultSettings
            });
          } else {
            throw new Error('Échec de la création du compte');
          }
        } catch (error) {
          console.error('Registration error:', error);
          set({ error: handleSupabaseError(error), isLoading: false });
        }
      },
      
      logout: async () => {
        set({ isLoading: true });
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            paymentMethods: [],
            notificationPreferences: null,
            userSettings: null
          });
        } catch (error) {
          console.error('Logout error:', error);
          set({ error: handleSupabaseError(error), isLoading: false });
        }
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      refreshUser: async () => {
        try {
          console.log('Refreshing user data');
          
          // Fix: Properly handle the auth response structure
          const { data, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('Session fetch error:', JSON.stringify(sessionError, null, 2));
            set({ user: null, isAuthenticated: false });
            return;
          }
          
          if (!data.session) {
            console.log('No active session found');
            set({ user: null, isAuthenticated: false });
            return;
          }
          
          console.log('Active session found for user:', data.session.user.id);
          
          // Fetch user profile data using maybeSingle() instead of single()
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .maybeSingle();
          
          if (profileError) {
            console.error('Profile fetch error during refresh:', JSON.stringify(profileError, null, 2));
            
            // Continue with basic user info
            const user: User = {
              id: data.session.user.id,
              name: data.session.user.email?.split('@')[0] || 'User',
              email: data.session.user.email || '',
              avatar: null,
            };
            
            set({ user, isAuthenticated: true });
            return;
          }
          
          // If profile doesn't exist, create one
          if (!profileData) {
            console.log('Profile not found during refresh, creating new profile');
            
            // Try upsert instead of insert to handle RLS policies
            const { error: upsertError } = await supabase
              .from('profiles')
              .upsert([
                {
                  id: data.session.user.id,
                  name: data.session.user.email?.split('@')[0] || 'User',
                  email: data.session.user.email,
                  updated_at: new Date().toISOString(),
                  settings: {
                    language: 'fr',
                    theme: 'light',
                    currency: 'XOF'
                  }
                }
              ]);
            
            if (upsertError) {
              console.error('Profile creation error during refresh:', JSON.stringify(upsertError, null, 2));
            }
            
            const user: User = {
              id: data.session.user.id,
              name: data.session.user.email?.split('@')[0] || 'User',
              email: data.session.user.email || '',
              avatar: null,
            };
            
            set({ user, isAuthenticated: true });
            return;
          }
          
          const user: User = {
            id: data.session.user.id,
            name: profileData.name || data.session.user.email?.split('@')[0] || 'User',
            email: data.session.user.email || '',
            avatar: profileData.avatar_url,
            phone: profileData.phone || null,
            location: profileData.location || null,
            bio: profileData.bio || null,
          };
          
          console.log('User refreshed successfully:', user.name);
          set({ user, isAuthenticated: true });
          
          // Fetch additional user data
          const authStore = get();
          authStore.fetchPaymentMethods();
          authStore.fetchNotificationPreferences();
          authStore.fetchUserSettings();
        } catch (error) {
          console.error('Error refreshing user:', error);
          set({ user: null, isAuthenticated: false });
        }
      },
      
      updateProfile: async (profileData) => {
        const { user } = get();
        if (!user) return;
        
        set({ isLoading: true, error: null });
        
        try {
          console.log('Updating profile for user:', user.id);
          console.log('Profile data to update:', profileData);
          
          // Prepare the data for update
          const updateData = {
            id: user.id, // Make sure to include the id for upsert
            name: profileData.name || user.name,
            phone: profileData.phone !== undefined ? profileData.phone : user.phone,
            location: profileData.location !== undefined ? profileData.location : user.location,
            bio: profileData.bio !== undefined ? profileData.bio : user.bio,
            avatar_url: profileData.avatar || user.avatar,
            email: user.email, // Include email to ensure it's not lost
            updated_at: new Date().toISOString(),
          };
          
          // Use upsert instead of update to handle potential RLS issues
          const { data, error } = await supabase
            .from('profiles')
            .upsert(updateData)
            .select()
            .single();
          
          if (error) {
            console.error('Profile update error:', JSON.stringify(error, null, 2));
            throw error;
          }
          
          console.log('Profile updated successfully:', data);
          
          // Update local user state with the returned data
          const updatedUser: User = {
            id: user.id,
            name: data.name,
            email: user.email,
            avatar: data.avatar_url,
            phone: data.phone,
            location: data.location,
            bio: data.bio,
          };
          
          set({ 
            user: updatedUser,
            isLoading: false 
          });
          
          return updatedUser;
        } catch (error) {
          console.error('Profile update error:', error);
          set({ error: handleSupabaseError(error), isLoading: false });
          throw error;
        }
      },
      
      uploadAvatar: async (uri) => {
        const { user } = get();
        if (!user) throw new Error('User not authenticated');
        
        set({ isLoading: true, error: null });
        
        try {
          console.log('Uploading avatar for user:', user.id);
          
          // Create a unique filename
          const fileName = `avatar-${user.id}-${Date.now()}.jpg`;
          
          // Convert image to blob
          const response = await fetch(uri);
          const blob = await response.blob();
          
          // Upload to Supabase Storage
          const { data, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, blob, {
              cacheControl: '3600',
              upsert: true
            });
          
          if (uploadError) {
            console.error('Avatar upload error:', JSON.stringify(uploadError, null, 2));
            throw uploadError;
          }
          
          console.log('Avatar uploaded successfully:', data?.path);
          
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);
          
          const avatarUrl = urlData.publicUrl;
          console.log('Avatar public URL:', avatarUrl);
          
          // Update profile with new avatar URL
          await get().updateProfile({ avatar: avatarUrl });
          
          set({ isLoading: false });
          return avatarUrl;
        } catch (error) {
          console.error('Avatar upload error:', error);
          set({ error: handleSupabaseError(error), isLoading: false });
          throw error;
        }
      },
      
      fetchPaymentMethods: async () => {
        const { user, isAuthenticated } = get();
        if (!user || !isAuthenticated) return;
        
        try {
          const { data, error } = await supabase
            .from('payment_methods')
            .select('*')
            .eq('user_id', user.id);
          
          if (error) throw error;
          
          const paymentMethods: PaymentMethod[] = data.map(method => ({
            id: method.id,
            userId: method.user_id,
            type: method.type,
            provider: method.provider,
            last4: method.last4,
            expiryDate: method.expiry_date,
            isDefault: method.is_default,
          }));
          
          set({ paymentMethods });
        } catch (error) {
          console.error('Error fetching payment methods:', error);
        }
      },
      
      fetchNotificationPreferences: async () => {
        const { user, isAuthenticated } = get();
        if (!user || !isAuthenticated) return;
        
        try {
          const { data, error } = await supabase
            .from('notification_preferences')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (error) throw error;
          
          if (data) {
            const preferences: NotificationPreferences = {
              userId: data.user_id,
              email: data.email,
              push: data.push,
              types: data.types,
            };
            
            set({ notificationPreferences: preferences });
          } else {
            // Create default preferences if none exist
            const defaultPreferences: NotificationPreferences = {
              userId: user.id,
              email: true,
              push: true,
              types: ['events', 'tickets', 'promotions'],
            };
            
            // Use upsert instead of insert to handle RLS policies
            const { error: upsertError } = await supabase
              .from('notification_preferences')
              .upsert([{
                user_id: user.id,
                email: true,
                push: true,
                types: ['events', 'tickets', 'promotions'],
              }]);
            
            if (upsertError) throw upsertError;
            
            set({ notificationPreferences: defaultPreferences });
          }
        } catch (error) {
          console.error('Error fetching notification preferences:', error);
        }
      },
      
      fetchUserSettings: async () => {
        const { user, isAuthenticated } = get();
        if (!user || !isAuthenticated) return;
        
        try {
          console.log('Fetching user settings for user:', user.id);
          
          // Get settings directly from the profiles table
          const { data, error } = await supabase
            .from('profiles')
            .select('settings')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.error('Error fetching user settings:', JSON.stringify(error, null, 2));
            throw error;
          }
          
          // Check if settings exist in the profile
          if (data && data.settings) {
            console.log('User settings found:', data.settings);
            
            const settings: UserSettings = {
              userId: user.id,
              language: data.settings.language || 'fr',
              theme: data.settings.theme || 'light',
              currency: data.settings.currency || 'XOF',
            };
            
            set({ userSettings: settings });
          } else {
            console.log('No user settings found, creating default settings');
            
            // Create default settings if none exist
            const defaultSettings: UserSettings = {
              userId: user.id,
              language: 'fr',
              theme: 'light',
              currency: 'XOF',
            };
            
            // Update the profile with default settings
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                settings: {
                  language: 'fr',
                  theme: 'light',
                  currency: 'XOF'
                }
              })
              .eq('id', user.id);
            
            if (updateError) {
              console.error('Error creating default user settings:', JSON.stringify(updateError, null, 2));
              throw updateError;
            }
            
            set({ userSettings: defaultSettings });
          }
        } catch (error) {
          console.error('Error in fetchUserSettings:', error);
          // Don't throw the error, just log it and continue
          // This prevents the app from crashing if settings can't be fetched
          
          // Set default settings anyway so the app can continue
          const defaultSettings: UserSettings = {
            userId: user.id,
            language: 'fr',
            theme: 'light',
            currency: 'XOF',
          };
          
          set({ userSettings: defaultSettings });
        }
      },
      
      updateNotificationPreferences: async (preferences) => {
        const { user, notificationPreferences } = get();
        if (!user || !notificationPreferences) return;
        
        set({ isLoading: true, error: null });
        
        try {
          // Use upsert instead of update to handle RLS policies
          const { error } = await supabase
            .from('notification_preferences')
            .upsert({
              user_id: user.id,
              email: preferences.email !== undefined ? preferences.email : notificationPreferences.email,
              push: preferences.push !== undefined ? preferences.push : notificationPreferences.push,
              types: preferences.types || notificationPreferences.types,
            });
          
          if (error) throw error;
          
          // Update local state
          set({ 
            notificationPreferences: { ...notificationPreferences, ...preferences },
            isLoading: false 
          });
        } catch (error) {
          console.error('Notification preferences update error:', error);
          set({ error: handleSupabaseError(error), isLoading: false });
        }
      },
      
      updateUserSettings: async (settings) => {
        const { user, userSettings } = get();
        if (!user) return;
        
        set({ isLoading: true, error: null });
        
        try {
          console.log('Updating user settings:', settings);
          
          // Get current profile data first
          const { data: profileData, error: fetchError } = await supabase
            .from('profiles')
            .select('settings')
            .eq('id', user.id)
            .single();
          
          if (fetchError) {
            console.error('Error fetching profile for settings update:', JSON.stringify(fetchError, null, 2));
            throw fetchError;
          }
          
          // Prepare the settings object, merging with existing settings if any
          const currentSettings = profileData.settings || {};
          const updatedSettings = {
            ...currentSettings,
            language: settings.language || (userSettings?.language || 'fr'),
            theme: settings.theme || (userSettings?.theme || 'light'),
            currency: settings.currency || (userSettings?.currency || 'XOF'),
          };
          
          console.log('Updated settings object:', updatedSettings);
          
          // Update the profile with the new settings
          const { data, error: updateError } = await supabase
            .from('profiles')
            .update({
              settings: updatedSettings,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id)
            .select();
          
          if (updateError) {
            console.error('Settings update error:', JSON.stringify(updateError, null, 2));
            throw updateError;
          }
          
          console.log('Settings updated successfully:', data);
          
          // Update local state
          const newUserSettings: UserSettings = {
            userId: user.id,
            language: updatedSettings.language,
            theme: updatedSettings.theme,
            currency: updatedSettings.currency,
          };
          
          set({ 
            userSettings: newUserSettings,
            isLoading: false 
          });
        } catch (error) {
          console.error('User settings update error:', error);
          set({ error: handleSupabaseError(error), isLoading: false });
        }
      }
    }),
    {
      name: 'afritix-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);