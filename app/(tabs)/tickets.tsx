import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { TicketX } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { useTicketsStore } from '@/store/tickets-store';
import { TicketCard } from '@/components/TicketCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { Button } from '@/components/Button';

export default function TicketsScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { tickets, isLoading, fetchTickets } = useTicketsStore();
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchTickets();
    }
  }, [isAuthenticated]);
  
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <EmptyState
          title="Connectez-vous pour voir vos billets"
          message="Vous devez être connecté pour voir vos billets"
          actionLabel="Se connecter"
          onAction={() => router.push('/auth/login')}
          icon={<TicketX size={48} color={colors.textSecondary} />}
        />
      </SafeAreaView>
    );
  }
  
  if (isLoading && tickets.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <LoadingIndicator fullScreen message="Chargement de vos billets..." />
      </SafeAreaView>
    );
  }
  
  const renderEmptyState = () => (
    <EmptyState
      title="Pas encore de billets"
      message="Vous n'avez pas encore acheté de billets. Parcourez les événements pour trouver quelque chose qui vous plaît!"
      actionLabel="Parcourir les événements"
      onAction={() => router.push('/')}
      icon={<TicketX size={48} color={colors.textSecondary} />}
    />
  );
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes billets</Text>
      </View>
      
      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TicketCard ticket={item} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexGrow: 1,
  },
});