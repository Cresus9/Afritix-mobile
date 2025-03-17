import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Switch,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Globe, 
  Bell, 
  Trash2,
  Download,
  Info
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';

export default function PrivacyScreen() {
  const { user } = useAuthStore();
  const [profileVisible, setProfileVisible] = React.useState(true);
  const [locationSharing, setLocationSharing] = React.useState(false);
  const [dataCollection, setDataCollection] = React.useState(true);
  
  const handleDownloadData = () => {
    alert('Fonctionnalité à venir: Téléchargement de vos données');
  };
  
  const handleDeleteData = () => {
    alert('Fonctionnalité à venir: Suppression de vos données');
  };
  
  const openPrivacyPolicy = () => {
    Linking.openURL('https://afritix.com/privacy');
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ 
        title: 'Confidentialité et sécurité',
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerShadowVisible: false
      }} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paramètres de confidentialité</Text>
          
          <View style={styles.optionItem}>
            <View style={styles.optionInfo}>
              <Eye size={20} color={colors.textSecondary} />
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Visibilité du profil</Text>
                <Text style={styles.optionDescription}>
                  Permettre aux autres utilisateurs de voir votre profil
                </Text>
              </View>
            </View>
            <Switch
              value={profileVisible}
              onValueChange={setProfileVisible}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={profileVisible ? colors.primary : colors.textMuted}
            />
          </View>
          
          <View style={styles.optionItem}>
            <View style={styles.optionInfo}>
              <Globe size={20} color={colors.textSecondary} />
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Partage de localisation</Text>
                <Text style={styles.optionDescription}>
                  Partager votre localisation pour des recommandations personnalisées
                </Text>
              </View>
            </View>
            <Switch
              value={locationSharing}
              onValueChange={setLocationSharing}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={locationSharing ? colors.primary : colors.textMuted}
            />
          </View>
          
          <View style={styles.optionItem}>
            <View style={styles.optionInfo}>
              <Bell size={20} color={colors.textSecondary} />
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Collecte de données</Text>
                <Text style={styles.optionDescription}>
                  Autoriser la collecte de données pour améliorer votre expérience
                </Text>
              </View>
            </View>
            <Switch
              value={dataCollection}
              onValueChange={setDataCollection}
              trackColor={{ false: colors.border, true: colors.primary + '80' }}
              thumbColor={dataCollection ? colors.primary : colors.textMuted}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vos données</Text>
          
          <TouchableOpacity 
            style={styles.dataButton}
            onPress={handleDownloadData}
          >
            <Download size={20} color={colors.primary} />
            <Text style={styles.dataButtonText}>Télécharger mes données</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.dataButton}
            onPress={handleDeleteData}
          >
            <Trash2 size={20} color={colors.error} />
            <Text style={[styles.dataButtonText, { color: colors.error }]}>
              Supprimer mes données
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.infoSection}>
          <Info size={16} color={colors.textSecondary} />
          <Text style={styles.infoText}>
            Nous prenons votre confidentialité au sérieux. Vos données sont stockées de manière sécurisée et ne sont jamais partagées avec des tiers sans votre consentement.
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.policyButton}
          onPress={openPrivacyPolicy}
        >
          <Shield size={16} color={colors.primary} />
          <Text style={styles.policyButtonText}>
            Consulter notre politique de confidentialité
          </Text>
        </TouchableOpacity>
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
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  optionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  dataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dataButtonText: {
    fontSize: 16,
    color: colors.primary,
    marginLeft: 12,
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
  policyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 32,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 8,
  },
  policyButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginLeft: 8,
  },
});