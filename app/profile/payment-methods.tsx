import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Alert,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { CreditCard, Plus, Trash2, Check, CreditCardOff } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { PaymentMethod } from '@/types';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const { user, paymentMethods, fetchPaymentMethods } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    fetchPaymentMethods();
  }, []);
  
  const handleAddPaymentMethod = () => {
    Alert.alert('Fonctionnalité à venir', 'Cette fonctionnalité sera disponible prochainement.');
  };
  
  const handleSetDefault = (id: string) => {
    Alert.alert('Fonctionnalité à venir', 'Cette fonctionnalité sera disponible prochainement.');
  };
  
  const handleDelete = (id: string) => {
    Alert.alert(
      'Supprimer la méthode de paiement',
      'Êtes-vous sûr de vouloir supprimer cette méthode de paiement?',
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
  
  const getCardImage = (type: string) => {
    switch (type) {
      case 'visa':
        return 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png';
      case 'mastercard':
        return 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png';
      case 'orange_money':
        return 'https://upload.wikimedia.org/wikipedia/fr/thumb/8/83/Orange_Money.svg/1200px-Orange_Money.svg.png';
      case 'moov_money':
        return 'https://play-lh.googleusercontent.com/DTzWtkxfnKwFO3ruybY1SKjJQnLYeuK3KmQmwV5OQ3dULr5iXxeEtzBLceultrKTIUTr';
      default:
        return null;
    }
  };
  
  // Mock payment methods for demo
  const mockPaymentMethods: PaymentMethod[] = [
    {
      id: '1',
      userId: user?.id || '',
      type: 'card',
      provider: 'visa',
      last4: '4242',
      expiryDate: '12/25',
      isDefault: true
    },
    {
      id: '2',
      userId: user?.id || '',
      type: 'mobile_money',
      provider: 'orange_money',
      last4: '7890',
      isDefault: false
    }
  ];
  
  const displayPaymentMethods = paymentMethods.length > 0 ? paymentMethods : mockPaymentMethods;
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ 
        title: 'Méthodes de paiement',
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerShadowVisible: false
      }} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {displayPaymentMethods.length === 0 ? (
          <EmptyState
            title="Aucune méthode de paiement"
            message="Ajoutez une carte ou un compte mobile money pour faciliter vos achats"
            icon={<CreditCardOff size={48} color={colors.textSecondary} />}
            actionLabel="Ajouter une méthode de paiement"
            onAction={handleAddPaymentMethod}
          />
        ) : (
          <>
            <View style={styles.section}>
              {displayPaymentMethods.map((method) => (
                <View key={method.id} style={styles.paymentMethodItem}>
                  <View style={styles.paymentMethodHeader}>
                    {method.provider && getCardImage(method.provider) ? (
                      <Image 
                        source={{ uri: getCardImage(method.provider) }} 
                        style={styles.cardImage} 
                        resizeMode="contain"
                      />
                    ) : (
                      <CreditCard size={32} color={colors.primary} />
                    )}
                    
                    <View style={styles.paymentMethodInfo}>
                      <Text style={styles.paymentMethodTitle}>
                        {method.type === 'card' ? 'Carte' : 'Mobile Money'} 
                        {method.provider && ` ${method.provider.charAt(0).toUpperCase() + method.provider.slice(1)}`}
                      </Text>
                      <Text style={styles.paymentMethodSubtitle}>
                        {method.type === 'card' ? 
                          `**** **** **** ${method.last4}` : 
                          `**** ${method.last4}`}
                        {method.expiryDate && ` • Exp: ${method.expiryDate}`}
                      </Text>
                    </View>
                    
                    {method.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Par défaut</Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.paymentMethodActions}>
                    {!method.isDefault && (
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleSetDefault(method.id)}
                      >
                        <Check size={16} color={colors.success} />
                        <Text style={[styles.actionButtonText, { color: colors.success }]}>
                          Définir par défaut
                        </Text>
                      </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => handleDelete(method.id)}
                    >
                      <Trash2 size={16} color={colors.error} />
                      <Text style={[styles.actionButtonText, { color: colors.error }]}>
                        Supprimer
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
            
            <View style={styles.addButtonContainer}>
              <Button
                title="Ajouter une méthode de paiement"
                onPress={handleAddPaymentMethod}
                icon={<Plus size={18} color={colors.white} />}
                fullWidth
              />
            </View>
          </>
        )}
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
  paymentMethodItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardImage: {
    width: 40,
    height: 24,
  },
  paymentMethodInfo: {
    flex: 1,
    marginLeft: 12,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  paymentMethodSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  defaultBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  defaultBadgeText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '500',
  },
  paymentMethodActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  actionButtonText: {
    fontSize: 14,
    marginLeft: 4,
  },
  addButtonContainer: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 32,
  },
});