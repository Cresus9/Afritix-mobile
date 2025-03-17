import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { 
  AlertTriangle, 
  HelpCircle, 
  CreditCard, 
  Ticket, 
  Calendar, 
  User
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Button } from '@/components/Button';
import { useSupportStore } from '@/store/support-store';
import { SupportTicket } from '@/types';

type TicketCategory = 'PAYMENT' | 'TICKET' | 'EVENT' | 'ACCOUNT' | 'OTHER';
type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

interface CategoryOption {
  value: TicketCategory;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface PriorityOption {
  value: TicketPriority;
  label: string;
  color: string;
  description: string;
}

export default function NewTicketScreen() {
  const router = useRouter();
  const { createTicket, isLoading, error, clearError } = useSupportStore();
  
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<TicketCategory | null>(null);
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  
  // Show error if there is one
  React.useEffect(() => {
    if (error) {
      Alert.alert('Erreur', error, [
        { text: 'OK', onPress: clearError }
      ]);
    }
  }, [error]);
  
  const categoryOptions: CategoryOption[] = [
    {
      value: 'PAYMENT',
      label: 'Paiement',
      icon: <CreditCard size={20} color={colors.textSecondary} />,
      description: 'Problèmes liés aux paiements, remboursements, factures',
    },
    {
      value: 'TICKET',
      label: 'Billet',
      icon: <Ticket size={20} color={colors.textSecondary} />,
      description: 'Problèmes avec vos billets, QR codes, transferts',
    },
    {
      value: 'EVENT',
      label: 'Événement',
      icon: <Calendar size={20} color={colors.textSecondary} />,
      description: 'Questions sur les événements, lieux, horaires',
    },
    {
      value: 'ACCOUNT',
      label: 'Compte',
      icon: <User size={20} color={colors.textSecondary} />,
      description: 'Problèmes de connexion, profil, paramètres',
    },
    {
      value: 'OTHER',
      label: 'Autre',
      icon: <HelpCircle size={20} color={colors.textSecondary} />,
      description: 'Toute autre demande non listée ci-dessus',
    },
  ];
  
  const priorityOptions: PriorityOption[] = [
    {
      value: 'LOW',
      label: 'Basse',
      color: colors.info,
      description: 'Question générale, pas d\'urgence',
    },
    {
      value: 'MEDIUM',
      label: 'Moyenne',
      color: colors.warning,
      description: 'Problème à résoudre dans les prochains jours',
    },
    {
      value: 'HIGH',
      label: 'Haute',
      color: colors.error,
      description: 'Problème urgent nécessitant une attention rapide',
    },
    {
      value: 'URGENT',
      label: 'Urgente',
      color: '#FF0000',
      description: 'Problème critique nécessitant une attention immédiate',
    },
  ];
  
  const handleSubmit = async () => {
    if (!subject.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un sujet pour votre ticket');
      return;
    }
    
    if (!message.trim()) {
      Alert.alert('Erreur', 'Veuillez décrire votre problème ou question');
      return;
    }
    
    if (!category) {
      Alert.alert('Erreur', 'Veuillez sélectionner une catégorie');
      return;
    }
    
    try {
      // Create ticket data
      const ticketData: Partial<SupportTicket> = {
        subject: subject.trim(),
        category: category,
        priority: priority,
        status: 'OPEN',
      };
      
      // Create the ticket in Supabase
      const result = await createTicket(ticketData, message.trim());
      
      if (result) {
        Alert.alert(
          'Ticket créé',
          'Votre ticket de support a été créé avec succès. Nous vous répondrons dans les plus brefs délais.',
          [
            {
              text: 'OK',
              onPress: () => router.push('/profile/support'),
            },
          ]
        );
      }
    } catch (err) {
      console.error('Error creating ticket:', err);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la création du ticket. Veuillez réessayer.');
    }
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ 
        title: 'Nouveau ticket',
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerShadowVisible: false
      }} />
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Informations du ticket</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Sujet</Text>
              <TextInput
                style={styles.input}
                placeholder="Résumez votre problème en quelques mots"
                placeholderTextColor={colors.textMuted}
                value={subject}
                onChangeText={setSubject}
                maxLength={100}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Catégorie</Text>
              <View style={styles.categoryOptions}>
                {categoryOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.categoryOption,
                      category === option.value && styles.categoryOptionSelected
                    ]}
                    onPress={() => setCategory(option.value)}
                  >
                    <View style={styles.categoryIcon}>
                      {option.icon}
                    </View>
                    <Text 
                      style={[
                        styles.categoryLabel,
                        category === option.value && styles.categoryLabelSelected
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {category && (
                <Text style={styles.categoryDescription}>
                  {categoryOptions.find(opt => opt.value === category)?.description}
                </Text>
              )}
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Priorité</Text>
              <View style={styles.priorityOptions}>
                {priorityOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.priorityOption,
                      priority === option.value && styles.priorityOptionSelected,
                      { borderColor: option.color }
                    ]}
                    onPress={() => setPriority(option.value)}
                  >
                    <View 
                      style={[
                        styles.priorityDot,
                        { backgroundColor: option.color }
                      ]} 
                    />
                    <Text 
                      style={[
                        styles.priorityLabel,
                        priority === option.value && { color: option.color }
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.priorityDescription}>
                {priorityOptions.find(opt => opt.value === priority)?.description}
              </Text>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.textarea}
                placeholder="Décrivez votre problème ou question en détail..."
                placeholderTextColor={colors.textMuted}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                maxLength={1000}
              />
              <Text style={styles.charCount}>
                {message.length}/1000 caractères
              </Text>
            </View>
          </View>
          
          <View style={styles.infoSection}>
            <View style={styles.infoHeader}>
              <AlertTriangle size={20} color={colors.warning} />
              <Text style={styles.infoTitle}>Informations importantes</Text>
            </View>
            <Text style={styles.infoText}>
              Notre équipe de support traite les tickets du lundi au vendredi, de 9h à 18h.
              Temps de réponse moyen: 24h pour les priorités moyennes et basses, 4h pour les priorités hautes et urgentes.
            </Text>
          </View>
          
          <View style={styles.buttonContainer}>
            <Button
              title="Annuler"
              onPress={() => router.back()}
              variant="outline"
              style={styles.cancelButton}
            />
            <Button
              title="Soumettre"
              onPress={handleSubmit}
              loading={isLoading}
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  formSection: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    fontSize: 16,
  },
  textarea: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    fontSize: 16,
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: colors.textMuted,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  categoryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    marginBottom: 8,
    minWidth: '45%',
  },
  categoryOptionSelected: {
    backgroundColor: colors.primary + '20',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  categoryIcon: {
    marginRight: 8,
  },
  categoryLabel: {
    fontSize: 14,
    color: colors.text,
  },
  categoryLabelSelected: {
    color: colors.primary,
    fontWeight: '500',
  },
  categoryDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  priorityOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priorityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    flex: 1,
    marginHorizontal: 2,
    justifyContent: 'center',
  },
  priorityOptionSelected: {
    backgroundColor: colors.background + '80',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  priorityLabel: {
    fontSize: 12,
    color: colors.text,
  },
  priorityDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  infoSection: {
    backgroundColor: colors.warning + '10',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.warning + '30',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.warning,
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  submitButton: {
    flex: 1,
    marginLeft: 8,
  },
});