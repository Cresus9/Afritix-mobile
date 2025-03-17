import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image,
  TouchableOpacity,
  Share,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Share2,
  Heart,
  ArrowLeft
} from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useEventsStore } from '@/store/events-store';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/Button';
import { LoadingIndicator } from '@/components/LoadingIndicator';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { selectedEvent, fetchEventById, isLoading } = useEventsStore();
  const { isAuthenticated } = useAuthStore();
  const [isFavorite, setIsFavorite] = useState(false);
  
  useEffect(() => {
    if (id) {
      fetchEventById(id);
    }
  }, [id]);
  
  const handleShare = async () => {
    if (!selectedEvent) return;
    
    try {
      await Share.share({
        title: selectedEvent.title,
        message: `Découvrez ${selectedEvent.title} sur AfriTix! ${selectedEvent.date} à ${selectedEvent.venue}, ${selectedEvent.location}`,
        url: `https://afritix.com/events/${selectedEvent.id}`,
      });
    } catch (error) {
      console.error('Error sharing event:', error);
    }
  };
  
  const handleBuyTicket = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    if (selectedEvent) {
      router.push(`/checkout/${selectedEvent.id}`);
    }
  };
  
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  if (isLoading || !selectedEvent) {
    return <LoadingIndicator fullScreen message="Chargement des détails de l'événement..." />;
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen 
        options={{
          title: '',
          headerTransparent: true,
          headerLeft: () => (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={toggleFavorite}
              >
                <Heart 
                  size={24} 
                  color={colors.text} 
                  fill={isFavorite ? colors.secondary : 'transparent'} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={handleShare}
              >
                <Share2 size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image 
          source={{ uri: selectedEvent.image }} 
          style={styles.image}
          resizeMode="cover"
        />
        
        <View style={styles.content}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{selectedEvent.category}</Text>
          </View>
          
          <Text style={styles.title}>{selectedEvent.title}</Text>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Calendar size={20} color={colors.textSecondary} />
              <Text style={styles.infoText}>{formatDate(selectedEvent.date)}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Clock size={20} color={colors.textSecondary} />
              <Text style={styles.infoText}>{selectedEvent.time}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <MapPin size={20} color={colors.textSecondary} />
              <Text style={styles.infoText}>{selectedEvent.venue}, {selectedEvent.location}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <User size={20} color={colors.textSecondary} />
              <Text style={styles.infoText}>Organisé par {selectedEvent.organizer}</Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>À propos de l'événement</Text>
            <Text style={styles.description}>{selectedEvent.description}</Text>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Prix</Text>
          <Text style={styles.price}>
            {selectedEvent.price.toLocaleString()} {selectedEvent.currency}
          </Text>
        </View>
        
        <Button
          title="Acheter un billet"
          onPress={handleBuyTicket}
          style={styles.buyButton}
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background + '80',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    marginRight: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background + '80',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  image: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 16,
  },
  categoryBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  infoContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 16,
    marginLeft: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  buyButton: {
    flex: 1,
  },
});