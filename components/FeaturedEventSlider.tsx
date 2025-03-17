import React, { useRef, useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  Dimensions,
  Animated
} from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, MapPin, ChevronRight, ChevronLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Event } from '@/types';
import { colors } from '@/constants/colors';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width - 48;
const ITEM_HEIGHT = 220;

interface FeaturedEventSliderProps {
  events: Event[];
}

export const FeaturedEventSlider: React.FC<FeaturedEventSliderProps> = ({ events }) => {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  
  // Define getItemLayout function to help FlatList know the dimensions of items
  const getItemLayout = (data: any, index: number) => ({
    length: ITEM_WIDTH,
    offset: ITEM_WIDTH * index,
    index,
  });
  
  // Handle scroll failures gracefully
  const handleScrollToIndexFailed = (info: {
    index: number;
    highestMeasuredFrameIndex: number;
    averageItemLength: number;
  }) => {
    const wait = new Promise(resolve => setTimeout(resolve, 500));
    wait.then(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({ 
          offset: info.index * ITEM_WIDTH,
          animated: true 
        });
      }
    });
  };
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (events.length > 1) {
        const nextIndex = (currentIndex + 1) % events.length;
        if (flatListRef.current) {
          // Use scrollToOffset instead of scrollToIndex for more reliable behavior
          flatListRef.current.scrollToOffset({
            offset: nextIndex * ITEM_WIDTH,
            animated: true
          });
        }
        setCurrentIndex(nextIndex);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [currentIndex, events.length]);
  
  const handleEventPress = (eventId: string) => {
    router.push(`/event/${eventId}`);
  };
  
  const handleNext = () => {
    if (events.length > 1) {
      const nextIndex = (currentIndex + 1) % events.length;
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({
          offset: nextIndex * ITEM_WIDTH,
          animated: true
        });
      }
      setCurrentIndex(nextIndex);
    }
  };
  
  const handlePrev = () => {
    if (events.length > 1) {
      const prevIndex = currentIndex === 0 ? events.length - 1 : currentIndex - 1;
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({
          offset: prevIndex * ITEM_WIDTH,
          animated: true
        });
      }
      setCurrentIndex(prevIndex);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  const renderItem = ({ item, index }: { item: Event, index: number }) => {
    const inputRange = [
      (index - 1) * ITEM_WIDTH,
      index * ITEM_WIDTH,
      (index + 1) * ITEM_WIDTH
    ];
    
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: 'clamp'
    });
    
    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.7, 1, 0.7],
      extrapolate: 'clamp'
    });
    
    return (
      <Animated.View
        style={[
          styles.itemContainer,
          { 
            transform: [{ scale }],
            opacity
          }
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => handleEventPress(item.id)}
          style={styles.touchable}
        >
          <Image 
            source={{ uri: item.image }} 
            style={styles.image}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gradient}
          >
            <View style={styles.contentContainer}>
              <View style={styles.tagContainer}>
                <View style={styles.categoryTag}>
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>
                <View style={styles.featuredTag}>
                  <Text style={styles.featuredText}>À la une</Text>
                </View>
              </View>
              
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              
              <View style={styles.detailsContainer}>
                <View style={styles.detailItem}>
                  <Calendar size={16} color={colors.text} />
                  <Text style={styles.detailText}>{formatDate(item.date)}</Text>
                </View>
                <View style={styles.detailItem}>
                  <MapPin size={16} color={colors.text} />
                  <Text style={styles.detailText}>{item.location}</Text>
                </View>
              </View>
              
              <View style={styles.priceContainer}>
                <Text style={styles.priceText}>
                  {item.price.toLocaleString()} {item.currency}
                </Text>
                <View style={styles.buyButton}>
                  <Text style={styles.buyButtonText}>Acheter</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };
  
  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={events}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        getItemLayout={getItemLayout}
        onScrollToIndexFailed={handleScrollToIndexFailed}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / ITEM_WIDTH);
          setCurrentIndex(index);
        }}
      />
      
      {events.length > 1 && (
        <View style={styles.controls}>
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={handlePrev}
          >
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          
          <View style={styles.pagination}>
            {events.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentIndex && styles.paginationDotActive
                ]}
              />
            ))}
          </View>
          
          <TouchableOpacity 
            style={styles.controlButton} 
            onPress={handleNext}
          >
            <ChevronRight size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  listContent: {
    paddingHorizontal: 24,
  },
  itemContainer: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    marginHorizontal: 0,
    borderRadius: 16,
    overflow: 'hidden',
  },
  touchable: {
    flex: 1,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  contentContainer: {
    padding: 16,
  },
  tagContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  categoryTag: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  categoryText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  featuredTag: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  featuredText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  detailsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    color: colors.text,
    fontSize: 14,
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  buyButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  buyButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textMuted,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: colors.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});