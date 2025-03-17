import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { 
  ChevronRight, 
  Lock, 
  Smartphone, 
  Shield, 
  AlertTriangle,
  LogOut,
  Trash2,
  Info
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/Button';

export default function AccountScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  
  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Déconnexion',
          onPress: () => {
            logout();
            router.push('/');
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer le compte',
      'Êtes-vous sûr de vouloir supprimer votre compte? Cette action est irréversible.',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          onPress: () => Alert.alert('Fonctionnalité à venir', 'Cette fonctionnalité sera disponible prochainement.'),
          style: 'destructive',
        },
      ]
    );
  };
  
  const handleChangePassword = () => {
    Alert.alert('Fonctionnalité à venir', 'Cette fonctionnalité sera disponible prochainement.');
  };
  
  const handleSetupTwoFactor = () => {
    Alert.alert('Fonctionnalité à venir', 'Cette fonctionnalité sera disponible prochainement.');
  };
  
  const handleToggleTwoFactor = (value: boolean) => {
    if (value && !twoFactorEnabled) {
      handleSetupTwoFactor();
      return;
    }
    setTwoFactorEnabled(value);
  };
  
  const handleToggleBiometric = (value: boolean) => {
    setBiometricEnabled(value);
    if (value) {
      Alert.alert('Fonctionnalité à venir', 'Cette fonctionnalité sera disponible prochainement.');
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ 
        title: 'Compte et sécurité',
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerShadowVisible: false
      }} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sécurité</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleChangePassword}
          >
            <Lock size={20} color={colors.textSecondary} />
            <Text style={styles.menuItemText}>Changer le mot de passe</Text>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
          
          <View style={styles.menuItem}>
            <Shield size={20} color={colors.textSecondary} />
            <Text style={styles.menuItemText}>Authentification à deux facteurs</Text>
            <Switch
              value={twoFactorEnabled}
              onValueChange={handleToggleTwoFactor}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={twoFactorEnabled ? colors.primary : colors.textMuted}
            />
          </View>
          
          <View style={styles.menuItem}>
            <Smartphone size={20} color={colors.textSecondary} />
            <Text style={styles.menuItemText}>Connexion biométrique</Text>
            <Switch
              value={biometricEnabled}
              onValueChange={handleToggleBiometric}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={biometricEnabled ? colors.primary : colors.textMuted}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appareils</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => Alert.alert('Fonctionnalité à venir', 'Cette fonctionnalité sera disponible prochainement.')}
          >
            <Text style={styles.menuItemText}>Appareils connectés</Text>
            <View style={styles.deviceBadge}>
              <Text style={styles.deviceBadgeText}>1</Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => Alert.alert('Fonctionnalité à venir', 'Cette fonctionnalité sera disponible prochainement.')}
          >
            <Text style={styles.menuItemText}>Historique de connexion</Text>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.infoSection}>
          <Info size={16} color={colors.textSecondary} />
          <Text style={styles.infoText}>
            Votre compte a été créé le {new Date(user?.createdAt || Date.now()).toLocaleDateString('fr-FR')}. 
            Dernière connexion le {new Date(user?.lastSignInAt || Date.now()).toLocaleDateString('fr-FR')}.
          </Text>
        </View>
        
        <View style={styles.dangerSection}>
          <Text style={styles.dangerSectionTitle}>Zone de danger</Text>
          
          <TouchableOpacity 
            style={styles.dangerButton}
            onPress={handleLogout}
          >
            <LogOut size={20} color={colors.warning} />
            <Text style={[styles.dangerButtonText, { color: colors.warning }]}>
              Déconnexion
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.dangerButton}
            onPress={handleDeleteAccount}
          >
            <Trash2 size={20} color={colors.error} />
            <Text style={[styles.dangerButtonText, { color: colors.error }]}>
              Supprimer mon compte
            </Text>
          </TouchableOpacity>
          
          <View style={styles.warningContainer}>
            <AlertTriangle size={16} color={colors.error} />
            <Text style={styles.warningText}>
              La suppression de votre compte est irréversible. Toutes vos données seront définitivement supprimées.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    margin: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    marginLeft: 16,
  },
  deviceBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  deviceBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoSection: {
    flexDirection: 'row',
    backgroundColor: colors.cardLight,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  dangerSection: {
    marginHorizontal: 16,
    marginTop: 32,
    marginBottom: 32,
  },
  dangerSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.error,
    marginBottom: 16,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  dangerButtonText: {
    fontSize: 16,
    marginLeft: 16,
    fontWeight: '500',
  },
  warningContainer: {
    flexDirection: 'row',
    backgroundColor: colors.error + '10',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  warningText: {
    fontSize: 14,
    color: colors.error,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});