import { useEffect } from 'react';
import { StatusBar, View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/auth-store';
import { useThemeStore } from '@/store/theme-store';
import { supabase } from '@/lib/supabase';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { refreshUser, userSettings } = useAuthStore();
  const { theme, setTheme, colors } = useThemeStore();
  const systemColorScheme = useColorScheme();
  
  // Initialize theme based on user settings or system preference
  useEffect(() => {
    if (userSettings?.theme) {
      setTheme(userSettings.theme);
    } else if (systemColorScheme) {
      setTheme(systemColorScheme);
    }
  }, [userSettings?.theme]);
  
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await refreshUser();
      } else if (event === 'SIGNED_OUT') {
        // User is already set to null in the logout function
      }
    });
    
    // Initialize by checking for existing session
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session:', error);
          return;
        }
        
        console.log('Initial session check:', data.session ? `Session found for ${data.session.user.id}` : 'No session');
        
        if (data.session) {
          await refreshUser();
        }
      } catch (error) {
        console.error('Error during auth initialization:', error);
      } finally {
        // Hide the splash screen after a delay
        setTimeout(async () => {
          await SplashScreen.hideAsync();
        }, 1000);
      }
    };
    
    initializeAuth();
    
    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>AfriTix</Text>
            </View>
          ),
          headerTitleAlign: 'center',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="auth/login" 
          options={{ 
            title: 'Login',
            headerShown: false,
            presentation: 'modal',
          }} 
        />
        <Stack.Screen 
          name="auth/register" 
          options={{ 
            title: 'Register',
            headerShown: false,
            presentation: 'modal',
          }} 
        />
        <Stack.Screen 
          name="event/[id]" 
          options={{ 
            title: 'Event Details',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="ticket/[id]" 
          options={{ 
            title: 'Ticket Details',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="checkout/[id]" 
          options={{ 
            title: 'Checkout',
            animation: 'slide_from_bottom',
          }} 
        />
        <Stack.Screen 
          name="profile/edit" 
          options={{ 
            title: 'Edit Profile',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/index" 
          options={{ 
            title: 'Profile',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/personal-info" 
          options={{ 
            title: 'Informations personnelles',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/payment-methods" 
          options={{ 
            title: 'Méthodes de paiement',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/notifications" 
          options={{ 
            title: 'Notifications',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/help" 
          options={{ 
            title: 'Centre d\'aide',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/settings" 
          options={{ 
            title: 'Paramètres',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/support" 
          options={{ 
            title: 'Support',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/support/new" 
          options={{ 
            title: 'Nouveau ticket',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/support/[id]" 
          options={{ 
            title: 'Détails du ticket',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/account" 
          options={{ 
            title: 'Compte et sécurité',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/tickets" 
          options={{ 
            title: 'Mes billets',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/activity" 
          options={{ 
            title: 'Activité récente',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/privacy" 
          options={{ 
            title: 'Confidentialité',
            animation: 'slide_from_right',
          }} 
        />
        <Stack.Screen 
          name="profile/about" 
          options={{ 
            title: 'À propos',
            animation: 'slide_from_right',
          }} 
        />
      </Stack>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  headerTitleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
});