import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  CreditCard, 
  Wallet, 
  CheckCircle,
  Circle
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useEventsStore } from '@/store/events-store';
import { useTicketsStore } from '@/store/tickets-store';
import { Button } from '@/components/Button';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { supabase } from '@/lib/supabase';
import { TicketType } from '@/types';

const PAYMENT_METHODS = [
  { id: 'card', name: 'Carte de crédit/débit', icon: CreditCard },
  { id: 'mobile', name: 'Mobile Money', icon: Wallet },
];

export default function CheckoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { selectedEvent, fetchEventById, isLoading: isLoadingEvent } = useEventsStore();
  const { purchaseTicket, isLoading: isLoadingPurchase } = useTicketsStore();
  
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [selectedTicketType, setSelectedTicketType] = useState<TicketType | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingTicketTypes, setIsLoadingTicketTypes] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchEventById(id);
      fetchTicketTypes(id);
    }
  }, [id]);
  
  const fetchTicketTypes = async (eventId: string) => {
    setIsLoadingTicketTypes(true);
    try {
      const { data, error } = await supabase
        .from('ticket_types')
        .select('*')
        .eq('event_id', eventId)
        .order('price', { ascending: true });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const ticketTypes: TicketType[] = data.map(item => ({
          id: item.id,
          eventId: item.event_id,
          name: item.name,
          description: item.description || '',
          price: item.price,
          quantity: item.quantity,
          available: item.available,
          maxPerOrder: item.max_per_order
        }));
        
        setTicketTypes(ticketTypes);
        setSelectedTicketType(ticketTypes[0]);
      } else {
        // If no ticket types found, create default ones based on event price
        if (selectedEvent) {
          const defaultTicketTypes: TicketType[] = [
            {
              id: 'standard',
              eventId: eventId,
              name: 'Standard',
              description: 'Billet standard',
              price: selectedEvent.price,
              quantity: 100,
              available: 100,
              maxPerOrder: 5
            },
            {
              id: 'vip',
              eventId: eventId,
              name: 'VIP',
              description: 'Billet VIP avec accès privilégié',
              price: selectedEvent.price * 2,
              quantity: 50,
              available: 50,
              maxPerOrder: 3
            },
            {
              id: 'premium',
              eventId: eventId,
              name: 'Premium',
              description: 'Expérience premium avec tous les avantages',
              price: selectedEvent.price * 3,
              quantity: 20,
              available: 20,
              maxPerOrder: 2
            }
          ];
          
          setTicketTypes(defaultTicketTypes);
          setSelectedTicketType(defaultTicketTypes[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching ticket types:', error);
      Alert.alert('Erreur', 'Impossible de charger les types de billets');
    } finally {
      setIsLoadingTicketTypes(false);
    }
  };
  
  const handlePurchase = async () => {
    if (!selectedEvent || !selectedTicketType) return;
    
    setIsProcessing(true);
    
    try {
      // Purchase ticket and get the newly created ticket
      const newTicket = await purchaseTicket(selectedEvent.id, selectedTicketType.id);
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate directly to the ticket details page
      router.push(`/ticket/${newTicket.id}`);
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Échec de l\'achat du billet. Veuillez réessayer.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (isLoadingEvent || isLoadingTicketTypes || !selectedEvent) {
    return <LoadingIndicator fullScreen message="Chargement du paiement..." />;
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ 
        title: 'AfriTix',
        headerTitleAlign: 'center',
      }} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Événement</Text>
            <View style={styles.eventCard}>
              <Text style={styles.eventTitle}>{selectedEvent.title}</Text>
              <Text style={styles.eventDetails}>
                {new Date(selectedEvent.date).toLocaleDateString('fr-FR', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })} • {selectedEvent.time}
              </Text>
              <Text style={styles.eventDetails}>
                {selectedEvent.location}
              </Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Type de billet</Text>
            {ticketTypes.map((ticketType) => (
              <TouchableOpacity
                key={ticketType.id}
                style={styles.optionCard}
                onPress={() => setSelectedTicketType(ticketType)}
                disabled={ticketType.available <= 0}
              >
                <View style={styles.optionContent}>
                  <View>
                    <Text style={[
                      styles.optionTitle,
                      ticketType.available <= 0 && styles.disabledText
                    ]}>
                      {ticketType.name}
                    </Text>
                    {ticketType.description && (
                      <Text style={styles.optionDescription}>
                        {ticketType.description}
                      </Text>
                    )}
                    {ticketType.available <= 0 && (
                      <Text style={styles.soldOutText}>Épuisé</Text>
                    )}
                    {ticketType.available > 0 && ticketType.available <= 10 && (
                      <Text style={styles.limitedText}>
                        Seulement {ticketType.available} restant(s)
                      </Text>
                    )}
                  </View>
                  <Text style={[
                    styles.optionPrice,
                    ticketType.available <= 0 && styles.disabledText
                  ]}>
                    {ticketType.price.toLocaleString()} {selectedEvent.currency}
                  </Text>
                </View>
                {selectedTicketType?.id === ticketType.id ? (
                  <CheckCircle size={24} color={colors.primary} />
                ) : (
                  <Circle size={24} color={ticketType.available <= 0 ? colors.textMuted : colors.textMuted} />
                )}
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Méthode de paiement</Text>
            {PAYMENT_METHODS.map((method) => {
              const Icon = method.icon;
              
              return (
                <TouchableOpacity
                  key={method.id}
                  style={styles.optionCard}
                  onPress={() => setSelectedPaymentMethod(method)}
                >
                  <View style={styles.optionContent}>
                    <Icon size={20} color={colors.textSecondary} />
                    <Text style={[styles.optionTitle, { marginLeft: 12 }]}>
                      {method.name}
                    </Text>
                  </View>
                  {selectedPaymentMethod.id === method.id ? (
                    <CheckCircle size={24} color={colors.primary} />
                  ) : (
                    <Circle size={24} color={colors.textMuted} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Résumé de la commande</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Prix du billet</Text>
                <Text style={styles.summaryValue}>
                  {selectedTicketType?.price.toLocaleString()} {selectedEvent.currency}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Frais de service</Text>
                <Text style={styles.summaryValue}>
                  {(selectedTicketType ? selectedTicketType.price * 0.05 : 0).toLocaleString()} {selectedEvent.currency}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  {selectedTicketType ? (selectedTicketType.price * 1.05).toLocaleString() : 0} {selectedEvent.currency}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title={isProcessing ? 'Traitement...' : 'Finaliser l\'achat'}
          onPress={handlePurchase}
          loading={isProcessing || isLoadingPurchase}
          disabled={!selectedTicketType || selectedTicketType.available <= 0}
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  eventCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  eventDetails: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 16,
    color: colors.text,
  },
  optionDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  optionPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  disabledText: {
    color: colors.textMuted,
  },
  soldOutText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
    fontWeight: '500',
  },
  limitedText: {
    fontSize: 12,
    color: colors.warning,
    marginTop: 4,
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  footer: {
    padding: 16,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});