import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { 
  MessageSquare, 
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { useSupportStore } from '@/store/support-store';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';

export default function SupportScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { tickets, fetchTickets, isLoading, error, clearError } = useSupportStore();
  const [refreshing, setRefreshing] = useState(false);
  
  // Initial fetch of tickets
  useEffect(() => {
    if (isAuthenticated) {
      fetchTickets();
    }
  }, [isAuthenticated]);
  
  // Show error if there is one
  useEffect(() => {
    if (error) {
      console.error('Support error:', error);
      clearError();
    }
  }, [error]);
  
  const onRefresh = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setRefreshing(true);
    try {
      await fetchTickets();
    } catch (err) {
      console.error('Error refreshing tickets:', err);
    } finally {
      setRefreshing(false);
    }
  }, [isAuthenticated, fetchTickets]);
  
  const handleNewTicket = () => {
    router.push('/profile/support/new');
  };
  
  const handleViewTicket = (ticketId: string) => {
    router.push(`/profile/support/${ticketId}`);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return colors.warning;
      case 'IN_PROGRESS':
        return colors.info;
      case 'RESOLVED':
        return colors.success;
      case 'CLOSED':
        return colors.textMuted;
      default:
        return colors.textSecondary;
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <AlertCircle size={16} color={getStatusColor(status)} />;
      case 'IN_PROGRESS':
        return <Clock size={16} color={getStatusColor(status)} />;
      case 'RESOLVED':
        return <CheckCircle2 size={16} color={getStatusColor(status)} />;
      case 'CLOSED':
        return <CheckCircle2 size={16} color={getStatusColor(status)} />;
      default:
        return <HelpCircle size={16} color={getStatusColor(status)} />;
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'Ouvert';
      case 'IN_PROGRESS':
        return 'En cours';
      case 'RESOLVED':
        return 'Résolu';
      case 'CLOSED':
        return 'Fermé';
      default:
        return status;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen options={{ 
          title: 'Support',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerShadowVisible: false
        }} />
        
        <EmptyState
          title="Connectez-vous pour accéder au support"
          message="Vous devez être connecté pour voir vos tickets de support et en créer de nouveaux."
          actionLabel="Se connecter"
          onAction={() => router.push('/auth/login')}
          icon={<MessageSquare size={48} color={colors.textSecondary} />}
        />
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ 
        title: 'Support',
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerShadowVisible: false
      }} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mes tickets de support</Text>
          <Button
            title="Nouveau ticket"
            onPress={handleNewTicket}
            variant="primary"
            size="small"
            style={styles.newTicketButton}
            textStyle={styles.newTicketButtonText}
          />
        </View>
        
        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Chargement des tickets...</Text>
          </View>
        ) : tickets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MessageSquare size={48} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>Aucun ticket de support</Text>
            <Text style={styles.emptyMessage}>
              Vous n'avez pas encore créé de ticket de support. Cliquez sur "Nouveau ticket" pour en créer un.
            </Text>
          </View>
        ) : (
          <FlatList
            data={tickets}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.ticketCard}
                onPress={() => handleViewTicket(item.id)}
              >
                <View style={styles.ticketHeader}>
                  <Text style={styles.ticketSubject}>{item.subject}</Text>
                  <View style={styles.ticketStatus}>
                    {getStatusIcon(item.status)}
                    <Text style={[styles.ticketStatusText, { color: getStatusColor(item.status) }]}>
                      {getStatusText(item.status)}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.ticketInfo}>
                  <Text style={styles.ticketDate}>
                    Créé le {formatDate(item.createdAt)}
                  </Text>
                  <View style={styles.ticketPriority}>
                    <View 
                      style={[
                        styles.priorityDot, 
                        { 
                          backgroundColor: 
                            item.priority === 'HIGH' || item.priority === 'URGENT' ? colors.error :
                            item.priority === 'MEDIUM' ? colors.warning :
                            colors.info
                        }
                      ]} 
                    />
                    <Text style={styles.priorityText}>
                      {item.priority === 'HIGH' ? 'Haute' : 
                       item.priority === 'MEDIUM' ? 'Moyenne' : 
                       item.priority === 'LOW' ? 'Basse' : 'Urgente'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.ticketFooter}>
                  <Text style={styles.viewDetailsText}>Voir les détails</Text>
                  <ChevronRight size={16} color={colors.primary} />
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.ticketsList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
          />
        )}
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
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  newTicketButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  newTicketButtonText: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  ticketsList: {
    paddingBottom: 16,
  },
  ticketCard: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ticketSubject: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  ticketStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketStatusText: {
    fontSize: 12,
    marginLeft: 4,
  },
  ticketInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ticketDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  ticketPriority: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  priorityText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  ticketFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  viewDetailsText: {
    fontSize: 14,
    color: colors.primary,
    marginRight: 4,
  },
});