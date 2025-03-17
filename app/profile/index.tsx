import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { 
  User, 
  CreditCard, 
  Bell, 
  HelpCircle, 
  Settings, 
  LogOut, 
  ChevronRight,
  Ticket,
  Clock,
  Shield,
  Info
} from 'lucide-react-native';
import { Button } from '@/components/Button';
import { useAuthStore } from '@/store/auth-store';
import { useThemeStore } from '@/store/theme-store';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout, refreshUser, isLoading } = useAuthStore();
  const { colors } = useThemeStore();
  const [refreshing, setRefreshing] = React.useState(false);
  
  useEffect(() => {
    if (isAuthenticated) {
      refreshUser();
    }
  }, [isAuthenticated]);
  
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshUser();
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);
  
  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };
  
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ 
          title: 'Profil',
          headerRight: () => <ThemeToggle />,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text
        }} />
        
        <View style={styles.notAuthenticatedContainer}>
          <Text style={[styles.notAuthenticatedText, { color: colors.text }]}>
            Connectez-vous pour accéder à votre profil
          </Text>
          <Button 
            title="Se connecter" 
            onPress={() => router.push('/auth/login')}
            style={styles.loginButton}
          />
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <Stack.Screen options={{ 
        title: 'Profil',
        headerRight: () => <ThemeToggle />,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text
      }} />
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <TouchableOpacity 
          style={[styles.profileHeader, { backgroundColor: colors.card }]}
          onPress={() => router.push('/profile/edit')}
          activeOpacity={0.7}
        >
          <View style={styles.profileInfo}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            
            <View style={styles.nameContainer}>
              <Text style={[styles.name, { color: colors.text }]}>{user?.name}</Text>
              <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>
            </View>
          </View>
          
          <ChevronRight size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Compte</Text>
          
          <View style={[styles.menuContainer, { backgroundColor: colors.card }]}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/profile/personal-info')}
            >
              <View style={styles.menuItemLeft}>
                <User size={20} color={colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>Informations personnelles</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.menuItem, styles.menuItemBorder, { borderTopColor: colors.border }]}
              onPress={() => router.push('/profile/payment-methods')}
            >
              <View style={styles.menuItemLeft}>
                <CreditCard size={20} color={colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>Méthodes de paiement</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.menuItem, styles.menuItemBorder, { borderTopColor: colors.border }]}
              onPress={() => router.push('/tickets')}
            >
              <View style={styles.menuItemLeft}>
                <Ticket size={20} color={colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>Mes billets</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.menuItem, styles.menuItemBorder, { borderTopColor: colors.border }]}
              onPress={() => router.push('/profile/activity')}
            >
              <View style={styles.menuItemLeft}>
                <Clock size={20} color={colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>Activité récente</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Préférences</Text>
          
          <View style={[styles.menuContainer, { backgroundColor: colors.card }]}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/profile/notifications')}
            >
              <View style={styles.menuItemLeft}>
                <Bell size={20} color={colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>Notifications</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.menuItem, styles.menuItemBorder, { borderTopColor: colors.border }]}
              onPress={() => router.push('/profile/settings')}
            >
              <View style={styles.menuItemLeft}>
                <Settings size={20} color={colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>Paramètres</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.menuItem, styles.menuItemBorder, { borderTopColor: colors.border }]}
              onPress={() => router.push('/profile/privacy')}
            >
              <View style={styles.menuItemLeft}>
                <Shield size={20} color={colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>Confidentialité</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Support</Text>
          
          <View style={[styles.menuContainer, { backgroundColor: colors.card }]}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/profile/help')}
            >
              <View style={styles.menuItemLeft}>
                <HelpCircle size={20} color={colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>Centre d'aide</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.menuItem, styles.menuItemBorder, { borderTopColor: colors.border }]}
              onPress={() => router.push('/profile/support')}
            >
              <View style={styles.menuItemLeft}>
                <HelpCircle size={20} color={colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>Contacter le support</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.menuItem, styles.menuItemBorder, { borderTopColor: colors.border }]}
              onPress={() => router.push('/profile/about')}
            >
              <View style={styles.menuItemLeft}>
                <Info size={20} color={colors.textSecondary} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>À propos</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: colors.card }]}
          onPress={handleLogout}
        >
          <LogOut size={20} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Se déconnecter</Text>
        </TouchableOpacity>
        
        <View style={styles.versionContainer}>
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
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  nameContainer: {
    marginLeft: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    marginTop: 4,
  },
  sectionContainer: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  menuContainer: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemBorder: {
    borderTopWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  versionText: {
    fontSize: 14,
  },
  notAuthenticatedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  notAuthenticatedText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  loginButton: {
    width: '80%',
  },
});