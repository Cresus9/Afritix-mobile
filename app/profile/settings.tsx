import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Globe, Moon, Sun, DollarSign, Check } from 'lucide-react-native';
import { useAuthStore } from '@/store/auth-store';
import { useThemeStore } from '@/store/theme-store';
import { UserSettings } from '@/types';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, userSettings, fetchUserSettings, updateUserSettings, isLoading, error } = useAuthStore();
  const { theme, setTheme, colors } = useThemeStore();
  const [isRefreshing, setIsRefreshing] = useState(true);
  
  // Default settings if none exist
  const [settings, setSettings] = useState<UserSettings>({
    userId: user?.id || '',
    language: 'fr',
    theme: 'light',
    currency: 'XOF'
  });
  
  useEffect(() => {
    const loadSettings = async () => {
      setIsRefreshing(true);
      try {
        await fetchUserSettings();
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setIsRefreshing(false);
      }
    };
    
    loadSettings();
  }, []);
  
  useEffect(() => {
    if (userSettings) {
      setSettings(userSettings);
      
      // Also update the theme in the theme store if it's different
      if (userSettings.theme !== theme) {
        setTheme(userSettings.theme);
      }
    }
  }, [userSettings]);
  
  const handleUpdateLanguage = async (language: 'en' | 'fr') => {
    setSettings(prev => ({
      ...prev,
      language
    }));
    
    await updateUserSettings({ language });
  };
  
  const handleUpdateTheme = async (newTheme: 'light' | 'dark') => {
    setSettings(prev => ({
      ...prev,
      theme: newTheme
    }));
    
    await updateUserSettings({ theme: newTheme });
    
    // Update the theme in the theme store
    setTheme(newTheme);
    
    Alert.alert(
      'Thème mis à jour',
      'Le thème a été changé avec succès.'
    );
  };
  
  const handleUpdateCurrency = async (currency: 'XOF' | 'EUR' | 'USD') => {
    setSettings(prev => ({
      ...prev,
      currency
    }));
    
    await updateUserSettings({ currency });
  };
  
  if (isRefreshing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ 
          title: 'Paramètres',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerShadowVisible: false,
          headerTintColor: colors.text
        }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Chargement des paramètres...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ 
          title: 'Paramètres',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerShadowVisible: false,
          headerTintColor: colors.text
        }} />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            Une erreur est survenue lors du chargement des paramètres.
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => fetchUserSettings()}
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen options={{ 
        title: 'Paramètres',
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerShadowVisible: false,
        headerTintColor: colors.text
      }} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Langue</Text>
          
          <TouchableOpacity 
            style={[styles.optionItem, { borderTopColor: colors.border }]}
            onPress={() => handleUpdateLanguage('fr')}
            disabled={isLoading}
          >
            <View style={styles.optionInfo}>
              <Globe size={20} color={colors.textSecondary} />
              <Text style={[styles.optionText, { color: colors.text }]}>Français</Text>
            </View>
            {settings.language === 'fr' && (
              <Check size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.optionItem, { borderTopColor: colors.border }]}
            onPress={() => handleUpdateLanguage('en')}
            disabled={isLoading}
          >
            <View style={styles.optionInfo}>
              <Globe size={20} color={colors.textSecondary} />
              <Text style={[styles.optionText, { color: colors.text }]}>English</Text>
            </View>
            {settings.language === 'en' && (
              <Check size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>
        
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Thème</Text>
          
          <TouchableOpacity 
            style={[styles.optionItem, { borderTopColor: colors.border }]}
            onPress={() => handleUpdateTheme('light')}
            disabled={isLoading}
          >
            <View style={styles.optionInfo}>
              <Sun size={20} color={colors.textSecondary} />
              <Text style={[styles.optionText, { color: colors.text }]}>Clair</Text>
            </View>
            {theme === 'light' && (
              <Check size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.optionItem, { borderTopColor: colors.border }]}
            onPress={() => handleUpdateTheme('dark')}
            disabled={isLoading}
          >
            <View style={styles.optionInfo}>
              <Moon size={20} color={colors.textSecondary} />
              <Text style={[styles.optionText, { color: colors.text }]}>Sombre</Text>
            </View>
            {theme === 'dark' && (
              <Check size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>
        
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Devise</Text>
          
          <TouchableOpacity 
            style={[styles.optionItem, { borderTopColor: colors.border }]}
            onPress={() => handleUpdateCurrency('XOF')}
            disabled={isLoading}
          >
            <View style={styles.optionInfo}>
              <DollarSign size={20} color={colors.textSecondary} />
              <Text style={[styles.optionText, { color: colors.text }]}>Franc CFA (XOF)</Text>
            </View>
            {settings.currency === 'XOF' && (
              <Check size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.optionItem, { borderTopColor: colors.border }]}
            onPress={() => handleUpdateCurrency('EUR')}
            disabled={isLoading}
          >
            <View style={styles.optionInfo}>
              <DollarSign size={20} color={colors.textSecondary} />
              <Text style={[styles.optionText, { color: colors.text }]}>Euro (EUR)</Text>
            </View>
            {settings.currency === 'EUR' && (
              <Check size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.optionItem, { borderTopColor: colors.border }]}
            onPress={() => handleUpdateCurrency('USD')}
            disabled={isLoading}
          >
            <View style={styles.optionInfo}>
              <DollarSign size={20} color={colors.textSecondary} />
              <Text style={[styles.optionText, { color: colors.text }]}>Dollar US (USD)</Text>
            </View>
            {settings.currency === 'USD' && (
              <Check size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        </View>
        
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingOverlayText, { color: colors.text }]}>
              Mise à jour...
            </Text>
          </View>
        )}
        
        <View style={styles.versionSection}>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>AfriTix v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  section: {
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    margin: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
  },
  versionSection: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 32,
  },
  versionText: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  loadingOverlayText: {
    marginLeft: 10,
    fontSize: 14,
  },
});