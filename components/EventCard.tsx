import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, MapPin, Clock, Tag } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Event } from '@/types';
import { colors } from '@/constants/colors';
import layout from '@/constants/layout';

const { width } = Dimensions.get('window');

interface EventCardProps {
  event: Event;
  variant?: 'default' | 'featured' | 'grid';
  style?: any;
}

export const EventCard: React.FC<EventCardProps> = ({ 
  event,
  variant = 'default',
  style
}) => {
  const router = useRouter();
  
  const handlePress = () => {
    router.push(`/event/${event.id}`);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  // Check if event is happening soon (within 7 days)
  const isHappeningSoon = () => {
    const eventDate = new Date(event.date);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 7;
  };
  
  if (variant === 'featured') {
    return (
      <TouchableOpacity 
        style={styles.featuredContainer}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <Image 
          source={{ uri: event.image }} 
          style={styles.featuredImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.featuredOverlay}
        >
          <View style={styles.featuredContent}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{event.category}</Text>
            </View>
            <Text style={styles.featuredTitle}>{event.title}</Text>
            <View style={styles.featuredDetails}>
              <View style={styles.featuredDetailItem}>
                <Calendar size={16} color={colors.text} />
                <Text style={styles.featuredDetailText}>{formatDate(event.date)}</Text>
              </View>
              <View style={styles.featuredDetailItem}>
                <MapPin size={16} color={colors.text} />
                <Text style={styles.featuredDetailText}>{event.location}</Text>
              </View>
            </View>
            <View style={styles.featuredPriceContainer}>
              <Text style={styles.featuredPrice}>
                {event.price.toLocaleString()} {event.currency}
              </Text>
              <View style={styles.buyButton}>
                <Text style={styles.buyButtonText}>Acheter</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }
  
  if (variant === 'grid') {
    return (
      <TouchableOpacity 
        style={[styles.gridContainer, style]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: event.image }} 
            style={styles.gridImage}
            resizeMode="cover"
          />
          {isHappeningSoon() && (
            <View style={styles.soonBadge}>
              <Text style={styles.soonText}>Bientôt</Text>
            </View>
          )}
        </View>
        
        <View style={styles.gridContent}>
          <View style={styles.gridCategoryBadge}>
            <Text style={styles.gridCategoryText}>{event.category}</Text>
          </View>
          <Text style={styles.gridTitle} numberOfLines={2}>{event.title}</Text>
          <View style={styles.gridDetails}>
            <View style={styles.gridDetailItem}>
              <Calendar size={12} color={colors.textSecondary} />
              <Text style={styles.gridDetailText}>{formatDate(event.date)}</Text>
            </View>
            <View style={styles.gridDetailItem}>
              <MapPin size={12} color={colors.textSecondary} />
              <Text style={styles.gridDetailText}>{event.location}</Text>
            </View>
          </View>
          <Text style={styles.gridPrice}>
            {event.price.toLocaleString()} {event.currency}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.imageWrapper}>
        <Image 
          source={{ uri: event.image }} 
          style={styles.image}
          resizeMode="cover"
        />
        {isHappeningSoon() && (
          <View style={styles.soonBadge}>
            <Text style={styles.soonText}>Bientôt</Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{event.category}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>{event.title}</Text>
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Calendar size={14} color={colors.textSecondary} />
            <Text style={styles.detailText}>{formatDate(event.date)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Clock size={14} color={colors.textSecondary} />
            <Text style={styles.detailText}>{event.time}</Text>
          </View>
          <View style={styles.detailItem}>
            <MapPin size={14} color={colors.textSecondary} />
            <Text style={styles.detailText}>{event.location}</Text>
          </View>
        </View>
        <View style={styles.footer}>
          <Text style={styles.price}>
            {event.price.toLocaleString()} {event.currency}
          </Text>
          <View style={styles.buyButton}>
            <Text style={styles.buyButtonText}>Acheter</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 150,
  },
  soonBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  soonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  categoryBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  details: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    color: colors.secondary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  buyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  buyButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  // Featured styles
  featuredContainer: {
    width: layout.window.width - 32,
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  featuredContent: {
    padding: 16,
  },
  featuredTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  featuredDetails: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  featuredDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  featuredDetailText: {
    color: colors.text,
    fontSize: 14,
    marginLeft: 4,
  },
  featuredPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredPrice: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Grid styles
  gridContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: 120,
  },
  gridContent: {
    padding: 12,
  },
  gridCategoryBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  gridCategoryText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '600',
  },
  gridTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    height: 40,
  },
  gridDetails: {
    marginBottom: 8,
  },
  gridDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  gridDetailText: {
    color: colors.textSecondary,
    fontSize: 12,
    marginLeft: 4,
  },
  gridPrice: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});