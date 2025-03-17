import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList,
  TouchableOpacity,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  Clock, 
  ChevronRight,
  Search
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { useTicketsStore } from '@/store/tickets-store';
import { EmptyState } from '@/components/EmptyState';
import { SearchBar } from '@/components/SearchBar';

export default function TicketsScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { tickets, fetchUserTickets } = useTicketsStore();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTickets, setFilteredTickets] = useState([]);
  
  useEffect(() => {
    const loadTickets = async () => {
      setIsLoading(true);
      if (isAuthenticated) {
        await fetchUserTickets(user?.id);
      }
      setIsLoading(false);
    };
    
    loadTickets();
  }, [isAuthenticated, user]);
  
  useEffect(() => {
    if (tickets) {
      if (searchQuery.trim() === '') {
        setFilteredTickets(tickets);
      } else {
        const query = searchQuery.toLowerCase();
        const filtered = tickets.filter(ticket => 
          ticket.event.title.toLowerCase().includes(query) ||
          ticket.event.location.toLowerCase().includes(query) ||
          ticket.ticketType.toLowerCase().includes(query)
        );
        setFilteredTickets(filtered);
      }
    }
  }, [tickets, searchQuery]);
  
  const handleTicketPress = (ticketId) => {
    router.push(`/ticket/${ticketId}`);
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen options={{ 
          title: 'Mes billets',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerShadowVisible: false
        }} />
        
        <EmptyState
          title="Connectez-vous pour voir vos billets"
          message="Vous devez être connecté pour voir vos billets."
          actionLabel="Se connecter"
          onAction={() => router.push('/auth/login')}
          icon={<Ticket size={48} color={colors.textSecondary} />}
        />
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ 
        title: 'Mes billets',
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerShadowVisible: false
      }} />
      
      <View style={styles.content}>
        <SearchBar
          placeholder="Rechercher un billet..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
        />
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Chargement des billets...</Text>
          </View>
        ) : filteredTickets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ticket size={48} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>Aucun billet trouvé</Text>
            <Text style={styles.emptyMessage}>
              {searchQuery.trim() !== '' 
                ? "Aucun billet ne correspond à votre recherche."
                : "Vous n'avez pas encore acheté de billets."}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredTickets}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.ticketCard}
                onPress={() => handleTicketPress(item.id)}
              >
                <Image 
                  source={{ uri: item.event.image }} 
                  style={styles.eventImage} 
                />
                
                <View style={styles.ticketContent}>
                  <Text style={styles.eventTitle} numberOfLines={1}>
                    {item.event.title}
                  </Text>
                  
                  <View style={styles.ticketInfo}>
                    <View style={styles.infoRow}>
                      <Calendar size={14} color={colors.textSecondary} />
                      <Text style={styles.infoText}>
                        {formatDate(item.event.startDate)}
                      </Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                      <Clock size={14} color={colors.textSecondary} />
                      <Text style={styles.infoText}>
                        {formatTime(item.event.startDate)}
                      </Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                      <MapPin size={14} color={colors.textSecondary} />
                      <Text style={styles.infoText} numberOfLines={1}>
                        {item.event.location}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.ticketFooter}>
                    <View style={styles.ticketType}>
                      <Text style={styles.ticketTypeText}>
                        {item.ticketType}
                      </Text>
                    </View>
                    
                    <ChevronRight size={16} color={colors.primary} />
                  </View>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.ticketsList}
            showsVerticalScrollIndicator={false}
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
  searchBar: {
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
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
    overflow: 'hidden',
    marginBottom: 16,
  },
  eventImage: {
    width: '100%',
    height: 120,
  },
  ticketContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  ticketInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  ticketType: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  ticketTypeText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
});