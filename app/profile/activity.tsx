import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  FlatList,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { 
  Clock, 
  CreditCard, 
  LogIn, 
  Ticket, 
  Heart, 
  Calendar,
  ChevronRight,
  Search
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { EmptyState } from '@/components/EmptyState';

// Mock activity data
const mockActivities = [
  {
    id: '1',
    type: 'LOGIN',
    description: 'Connexion depuis Chrome sur Windows',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    metadata: {
      device: 'Chrome on Windows',
      location: 'Abidjan, Côte d\'Ivoire'
    }
  },
  {
    id: '2',
    type: 'PURCHASE',
    description: 'Achat de billet pour Festival Afropolitain',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    metadata: {
      eventId: '123',
      eventName: 'Festival Afropolitain',
      amount: '15000 XOF'
    }
  },
  {
    id: '3',
    type: 'FAVORITE',
    description: 'Ajout aux favoris: Concert Youssou N\'Dour',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    metadata: {
      eventId: '456',
      eventName: 'Concert Youssou N\'Dour'
    }
  },
  {
    id: '4',
    type: 'SEARCH',
    description: 'Recherche: "concerts décembre"',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    metadata: {
      query: 'concerts décembre'
    }
  },
  {
    id: '5',
    type: 'VIEW',
    description: 'Consultation de l\'événement Festival des Arts de Rue',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    metadata: {
      eventId: '789',
      eventName: 'Festival des Arts de Rue'
    }
  },
  {
    id: '6',
    type: 'LOGIN',
    description: 'Connexion depuis l\'application mobile',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), // 4 days ago
    metadata: {
      device: 'iPhone 13',
      location: 'Abidjan, Côte d\'Ivoire'
    }
  },
];

export default function ActivityScreen() {
  const { user, isAuthenticated } = useAuthStore();
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API call to fetch activities
    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call
        // For now, we'll use mock data
        setTimeout(() => {
          setActivities(mockActivities);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching activities:', error);
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchActivities();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);
  
  const getActivityIcon = (type) => {
    switch (type) {
      case 'LOGIN':
        return <LogIn size={20} color={colors.info} />;
      case 'PURCHASE':
        return <CreditCard size={20} color={colors.success} />;
      case 'FAVORITE':
        return <Heart size={20} color={colors.error} />;
      case 'SEARCH':
        return <Search size={20} color={colors.warning} />;
      case 'VIEW':
        return <Calendar size={20} color={colors.primary} />;
      default:
        return <Clock size={20} color={colors.textSecondary} />;
    }
  };
  
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) {
      return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  };
  
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen options={{ 
          title: 'Activité récente',
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerShadowVisible: false
        }} />
        
        <EmptyState
          title="Connectez-vous pour voir votre activité"
          message="Vous devez être connecté pour voir votre activité récente."
          actionLabel="Se connecter"
          onAction={() => router.push('/auth/login')}
          icon={<Clock size={48} color={colors.textSecondary} />}
        />
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ 
        title: 'Activité récente',
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerShadowVisible: false
      }} />
      
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Chargement de l'activité...</Text>
          </View>
        ) : activities.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Clock size={48} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>Aucune activité récente</Text>
            <Text style={styles.emptyMessage}>
              Votre activité récente apparaîtra ici.
            </Text>
          </View>
        ) : (
          <FlatList
            data={activities}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.activityItem}>
                <View style={styles.activityIconContainer}>
                  {getActivityIcon(item.type)}
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityDescription}>{item.description}</Text>
                  <Text style={styles.activityTime}>{formatTimestamp(item.timestamp)}</Text>
                </View>
                <ChevronRight size={16} color={colors.textMuted} />
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.activitiesList}
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
  activitiesList: {
    paddingBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});