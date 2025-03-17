import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { 
  Music, 
  Cpu, 
  Shirt, 
  Clapperboard, 
  BookOpen, 
  Trophy, 
  Utensils, 
  Briefcase,
  Palette,
  Laugh,
  PartyPopper,
  Tag
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';
import { useCategoriesStore } from '@/store/categories-store';

const { width } = Dimensions.get('window');
const CATEGORY_WIDTH = (width - 64) / 2;

interface CategoryListProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  enhanced?: boolean;
  isLoading?: boolean;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  selectedCategory,
  onSelectCategory,
  enhanced = false,
  isLoading: externalLoading
}) => {
  const { categories, isLoading: storeLoading } = useCategoriesStore();
  
  const isLoading = externalLoading !== undefined ? externalLoading : storeLoading;
  
  const getIcon = (iconName: string, isSelected: boolean) => {
    const color = isSelected ? colors.white : colors.textSecondary;
    const size = 20;
    
    switch (iconName) {
      case 'music':
        return <Music size={size} color={color} />;
      case 'cpu':
        return <Cpu size={size} color={color} />;
      case 'shirt':
        return <Shirt size={size} color={color} />;
      case 'clapperboard':
        return <Clapperboard size={size} color={color} />;
      case 'book-open':
        return <BookOpen size={size} color={color} />;
      case 'trophy':
        return <Trophy size={size} color={color} />;
      case 'utensils':
        return <Utensils size={size} color={color} />;
      case 'briefcase':
        return <Briefcase size={size} color={color} />;
      case 'palette':
        return <Palette size={size} color={color} />;
      case 'laugh':
        return <Laugh size={size} color={color} />;
      case 'party-popper':
        return <PartyPopper size={size} color={color} />;
      default:
        return <Tag size={size} color={color} />;
    }
  };
  
  // Background images for enhanced categories
  const getCategoryImage = (category: string) => {
    switch (category) {
      case 'Music Concerts':
        return 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
      case 'Festivals':
        return 'https://images.unsplash.com/photo-1537832816519-689ad163238b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
      case 'Sport':
        return 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
      case 'Cinema':
        return 'https://images.unsplash.com/photo-1485846234645-a62644f84728?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
      case 'Art & Culture':
        return 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
      case 'Food & Drink':
        return 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
      case 'Business':
        return 'https://images.unsplash.com/photo-1556761175-4b46a572b786?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
      case 'Workshops':
        return 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
      default:
        return 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
    }
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }
  
  if (enhanced) {
    return (
      <View style={styles.enhancedContainer}>
        <Text style={styles.sectionTitle}>Catégories</Text>
        <ScrollView
          horizontal={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.enhancedGrid}
        >
          <TouchableOpacity
            style={[
              styles.enhancedAllItem,
              !selectedCategory && styles.enhancedSelectedItem
            ]}
            onPress={() => onSelectCategory(null)}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryLight]}
              style={styles.enhancedAllGradient}
            >
              <Text 
                style={[
                  styles.enhancedAllText,
                  !selectedCategory && styles.enhancedSelectedText
                ]}
              >
                Tous les événements
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          
          {categories.map((category) => {
            const isSelected = selectedCategory === category.name;
            
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.enhancedCategoryItem,
                  isSelected && styles.enhancedSelectedItem
                ]}
                onPress={() => onSelectCategory(category.name)}
              >
                <Image
                  source={{ uri: getCategoryImage(category.name) }}
                  style={styles.categoryImage}
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={styles.categoryGradient}
                >
                  <View style={styles.categoryContent}>
                    {getIcon(category.icon, isSelected)}
                    <Text 
                      style={[
                        styles.enhancedCategoryText,
                        isSelected && styles.enhancedSelectedText
                      ]}
                    >
                      {category.name}
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  }
  
  return (
    <View style={styles.outerContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>Catégories</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <TouchableOpacity
          style={[
            styles.categoryItem,
            !selectedCategory && styles.selectedCategory
          ]}
          onPress={() => onSelectCategory(null)}
        >
          <Text 
            style={[
              styles.categoryText,
              !selectedCategory && styles.selectedCategoryText
            ]}
          >
            Tous
          </Text>
        </TouchableOpacity>
        
        {categories.map((category) => {
          const isSelected = selectedCategory === category.name;
          
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryItem,
                isSelected && styles.selectedCategory
              ]}
              onPress={() => onSelectCategory(category.name)}
            >
              {getIcon(category.icon, isSelected)}
              <Text 
                style={[
                  styles.categoryText,
                  isSelected && styles.selectedCategoryText
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: colors.background,
    paddingBottom: 8,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedCategory: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    color: colors.textSecondary,
    marginLeft: 8,
    fontWeight: '500',
    fontSize: 14,
  },
  selectedCategoryText: {
    color: colors.white,
  },
  // Enhanced styles
  enhancedContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  enhancedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  enhancedAllItem: {
    width: '100%',
    height: 60,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  enhancedAllGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  enhancedAllText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  enhancedCategoryItem: {
    width: CATEGORY_WIDTH,
    height: 100,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  enhancedSelectedItem: {
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  categoryContent: {
    padding: 12,
    alignItems: 'center',
  },
  enhancedCategoryText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  enhancedSelectedText: {
    color: colors.white,
  },
});