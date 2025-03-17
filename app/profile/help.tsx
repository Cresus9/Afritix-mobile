import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { 
  HelpCircle, 
  MessageSquare, 
  Phone, 
  Mail, 
  FileText, 
  ChevronRight,
  AlertCircle,
  User,
  Ticket,
  CreditCard,
  Calendar,
  Info,
  Shield
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';

export default function HelpScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  
  const handleContact = (method: 'chat' | 'call' | 'email') => {
    if (!isAuthenticated && method === 'chat') {
      Alert.alert(
        'Connexion requise',
        'Vous devez être connecté pour créer un ticket de support.',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Se connecter', onPress: () => router.push('/auth/login') }
        ]
      );
      return;
    }
    
    switch (method) {
      case 'chat':
        router.push('/profile/support/new');
        break;
      case 'call':
        Linking.openURL('tel:+22600000000');
        break;
      case 'email':
        Linking.openURL('mailto:support@afritix.com');
        break;
    }
  };
  
  const handleOpenFAQ = (category: string) => {
    Alert.alert('Fonctionnalité à venir', `La FAQ sur ${category} sera disponible prochainement.`);
  };
  
  const handleViewTickets = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Connexion requise',
        'Vous devez être connecté pour voir vos tickets de support.',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Se connecter', onPress: () => router.push('/auth/login') }
        ]
      );
      return;
    }
    
    router.push('/profile/support');
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ 
        title: 'Centre d\'aide',
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerShadowVisible: false
      }} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <HelpCircle size={40} color={colors.primary} />
          <Text style={styles.headerTitle}>Comment pouvons-nous vous aider?</Text>
          <Text style={styles.headerSubtitle}>
            Consultez notre FAQ ou contactez-nous directement
          </Text>
        </View>
        
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Nous contacter</Text>
          
          <View style={styles.contactOptions}>
            <TouchableOpacity 
              style={styles.contactOption}
              onPress={() => handleContact('chat')}
            >
              <View style={[styles.contactIconContainer, { backgroundColor: colors.primary + '20' }]}>
                <MessageSquare size={24} color={colors.primary} />
              </View>
              <Text style={styles.contactOptionText}>Ticket</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.contactOption}
              onPress={() => handleContact('call')}
            >
              <View style={[styles.contactIconContainer, { backgroundColor: colors.success + '20' }]}>
                <Phone size={24} color={colors.success} />
              </View>
              <Text style={styles.contactOptionText}>Appel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.contactOption}
              onPress={() => handleContact('email')}
            >
              <View style={[styles.contactIconContainer, { backgroundColor: colors.warning + '20' }]}>
                <Mail size={24} color={colors.warning} />
              </View>
              <Text style={styles.contactOptionText}>Email</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.supportTicketsButton}
            onPress={handleViewTickets}
          >
            <Text style={styles.supportTicketsText}>Voir mes tickets de support</Text>
            <ChevronRight size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Questions fréquentes</Text>
          
          <TouchableOpacity 
            style={styles.faqItem}
            onPress={() => handleOpenFAQ('Compte')}
          >
            <View style={styles.faqItemContent}>
              <User size={20} color={colors.textSecondary} />
              <Text style={styles.faqItemText}>Compte et profil</Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.faqItem}
            onPress={() => handleOpenFAQ('Billets')}
          >
            <View style={styles.faqItemContent}>
              <Ticket size={20} color={colors.textSecondary} />
              <Text style={styles.faqItemText}>Billets et réservations</Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.faqItem}
            onPress={() => handleOpenFAQ('Paiements')}
          >
            <View style={styles.faqItemContent}>
              <CreditCard size={20} color={colors.textSecondary} />
              <Text style={styles.faqItemText}>Paiements et remboursements</Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.faqItem}
            onPress={() => handleOpenFAQ('Événements')}
          >
            <View style={styles.faqItemContent}>
              <Calendar size={20} color={colors.textSecondary} />
              <Text style={styles.faqItemText}>Événements et organisateurs</Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.resourcesSection}>
          <Text style={styles.sectionTitle}>Ressources</Text>
          
          <TouchableOpacity 
            style={styles.resourceItem}
            onPress={() => Linking.openURL('https://afritix.com/terms')}
          >
            <View style={styles.resourceItemContent}>
              <FileText size={20} color={colors.textSecondary} />
              <Text style={styles.resourceItemText}>Conditions d'utilisation</Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.resourceItem}
            onPress={() => Linking.openURL('https://afritix.com/privacy')}
          >
            <View style={styles.resourceItemContent}>
              <Shield size={20} color={colors.textSecondary} />
              <Text style={styles.resourceItemText}>Politique de confidentialité</Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.resourceItem}
            onPress={() => Linking.openURL('https://afritix.com/about')}
          >
            <View style={styles.resourceItemContent}>
              <Info size={20} color={colors.textSecondary} />
              <Text style={styles.resourceItemText}>À propos d'AfriTix</Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.supportSection}>
          <AlertCircle size={20} color={colors.textSecondary} />
          <Text style={styles.supportText}>
            Notre équipe de support est disponible 7j/7 de 8h à 20h.
            Temps de réponse moyen: moins de 24h.
          </Text>
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
  headerSection: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.card,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  contactSection: {
    backgroundColor: colors.card,
    borderRadius: 8,
    marginHorizontal: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  contactOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  contactOption: {
    alignItems: 'center',
    flex: 1,
  },
  contactIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactOptionText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  supportTicketsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: colors.cardLight,
    borderRadius: 8,
    marginTop: 8,
  },
  supportTicketsText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginRight: 4,
  },
  faqSection: {
    backgroundColor: colors.card,
    borderRadius: 8,
    marginHorizontal: 16,
    padding: 16,
    marginBottom: 16,
  },
  faqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  faqItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  faqItemText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  resourcesSection: {
    backgroundColor: colors.card,
    borderRadius: 8,
    marginHorizontal: 16,
    padding: 16,
    marginBottom: 16,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resourceItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resourceItemText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  supportSection: {
    flexDirection: 'row',
    backgroundColor: colors.cardLight,
    borderRadius: 8,
    marginHorizontal: 16,
    padding: 16,
    marginBottom: 32,
  },
  supportText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});