import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  TextInput,
  Platform,
  Image,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ChevronRight, 
  Search, 
  MapPin, 
  Calendar, 
  Ticket, 
  CreditCard, 
  Shield
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';
import { useEventsStore } from '@/store/events-store';
import { EventCard } from '@/components/EventCard';
import { CategoryList } from '@/components/CategoryList';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { FeaturedEventSlider } from '@/components/FeaturedEventSlider';
import { Button } from '@/components/Button';
import { SearchBar } from '@/components/SearchBar';
import { SubscriptionBlock } from '@/components/SubscriptionBlock';
import { useNewsletterStore } from '@/store/newsletter-store';

const { width } = Dimensions.get('window');

export default function DiscoverScreen() {
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const { 
    events, 
    featuredEvents, 
    filteredEvents,
    isLoading, 
    fetchEvents,
    selectedCategory,
    filterByCategory,
    searchEvents
  } = useEventsStore();
  
  const { subscribeToNewsletter } = useNewsletterStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    if (events.length === 0) {
      fetchEvents();
    }
  }, []);
  
  const handleSearch = () => {
    searchEvents(searchQuery);
    router.push('/search');
  };

  const handleSubscribe = (email: string) => {
    // Use the newsletter store to handle subscription
    subscribeToNewsletter(email);
  };
  
  if (isLoading && events.length === 0) {
    return <LoadingIndicator fullScreen message="Loading events..." />;
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher par artiste, événement ou lieu"
              placeholderTextColor="#757575"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity style={styles.searchIconContainer} onPress={handleSearch}>
              <Search size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScrollContent}
          >
            <TouchableOpacity 
              style={[
                styles.categoryButton,
                !selectedCategory && styles.categoryButtonActive
              ]}
              onPress={() => filterByCategory(null)}
            >
              <Text style={[
                styles.categoryButtonText,
                !selectedCategory && styles.categoryButtonTextActive
              ]}>
                Tous
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.categoryButton,
                selectedCategory === 'Music Concerts' && styles.categoryButtonActive
              ]}
              onPress={() => filterByCategory('Music Concerts')}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === 'Music Concerts' && styles.categoryButtonTextActive
              ]}>
                Concerts
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.categoryButton,
                selectedCategory === 'Sport' && styles.categoryButtonActive
              ]}
              onPress={() => filterByCategory('Sport')}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === 'Sport' && styles.categoryButtonTextActive
              ]}>
                Sports
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.categoryButton,
                selectedCategory === 'Festivals' && styles.categoryButtonActive
              ]}
              onPress={() => filterByCategory('Festivals')}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === 'Festivals' && styles.categoryButtonTextActive
              ]}>
                Festivals
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.categoryButton,
                selectedCategory === 'Cinema' && styles.categoryButtonActive
              ]}
              onPress={() => filterByCategory('Cinema')}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === 'Cinema' && styles.categoryButtonTextActive
              ]}>
                Cinéma
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        
        {/* Featured Events Slider */}
        <View style={styles.sliderSection}>
          <FeaturedEventSlider events={featuredEvents} />
        </View>
        
        {/* Upcoming Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory ? selectedCategory : 'Événements à venir'}
            </Text>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => router.push('/search')}
            >
              <Text style={styles.viewAllText}>Voir tout</Text>
              <ChevronRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.eventsGrid}>
            {filteredEvents.slice(0, 4).map(event => (
              <EventCard 
                key={event.id} 
                event={event} 
                variant="grid"
                style={styles.gridCard}
              />
            ))}
          </View>
          
          <Button
            title="Explorer plus d'événements"
            onPress={() => router.push('/search')}
            variant="outline"
            style={styles.exploreButton}
          />
        </View>
        
        {/* Benefits Section */}
        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsSectionTitle}>Pourquoi choisir AfriTix</Text>
          
          <View style={styles.benefitsContainer}>
            <View style={styles.benefitItem}>
              <View style={styles.benefitIconContainer}>
                <Ticket size={24} color={colors.primary} />
              </View>
              <Text style={styles.benefitTitle}>Réservation facile</Text>
              <Text style={styles.benefitText}>
                Réservez des billets en quelques secondes avec notre processus simple
              </Text>
            </View>
            
            <View style={styles.benefitItem}>
              <View style={styles.benefitIconContainer}>
                <CreditCard size={24} color={colors.primary} />
              </View>
              <Text style={styles.benefitTitle}>Paiements sécurisés</Text>
              <Text style={styles.benefitText}>
                Options de paiement multiples avec traitement sécurisé
              </Text>
            </View>
            
            <View style={styles.benefitItem}>
              <View style={styles.benefitIconContainer}>
                <Calendar size={24} color={colors.primary} />
              </View>
              <Text style={styles.benefitTitle}>Événements exclusifs</Text>
              <Text style={styles.benefitText}>
                Accès aux meilleurs événements au Burkina Faso
              </Text>
            </View>
            
            <View style={styles.benefitItem}>
              <View style={styles.benefitIconContainer}>
                <Shield size={24} color={colors.primary} />
              </View>
              <Text style={styles.benefitTitle}>Entrée garantie</Text>
              <Text style={styles.benefitText}>
                Billets numériques avec codes QR pour une entrée sans problème
              </Text>
            </View>
          </View>
        </View>
        
        {/* Newsletter Section - Using SubscriptionBlock */}
        <View style={styles.newsletterSection}>
          <SubscriptionBlock onSubscribe={handleSubscribe} />
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2023 AfriTix. Tous droits réservés.</Text>
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
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 50,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    height: '100%',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  searchIconContainer: {
    padding: 8,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  sliderSection: {
    marginTop: 8,
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    color: colors.primary,
    marginRight: 4,
  },
  eventsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  gridCard: {
    width: (width - 48) / 2,
    marginHorizontal: 8,
    marginBottom: 16,
  },
  exploreButton: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  benefitsSection: {
    paddingVertical: 32,
    backgroundColor: colors.card,
    marginBottom: 32,
  },
  benefitsSectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  benefitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  benefitItem: {
    width: (width - 48) / 2,
    marginHorizontal: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  benefitIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.cardLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  benefitText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  newsletterSection: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: colors.textMuted,
  },
});