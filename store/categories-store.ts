import { create } from 'zustand';
import { Category } from '@/types';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { categories as mockCategories } from '@/mocks/categories';

interface CategoriesState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
}

export const useCategoriesStore = create<CategoriesState>((set) => ({
  categories: [],
  isLoading: false,
  error: null,
  
  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      console.log('Fetching unique categories from events');
      
      // Fetch all events to extract unique categories
      const { data, error } = await supabase
        .from('events')
        .select('categories');
      
      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log('No events data returned, using mock categories');
        set({ categories: mockCategories, isLoading: false });
        return;
      }
      
      // Extract all categories from all events and flatten the array
      const allCategories = data
        .flatMap(item => item.categories || [])
        .filter(Boolean); // Remove any null/undefined values
      
      // Remove duplicates
      const uniqueCategories = [...new Set(allCategories)];
      
      console.log('Unique categories extracted:', uniqueCategories);
      
      // Map to our Category type with appropriate icons
      const categories: Category[] = uniqueCategories.map(name => {
        // Try to find a matching icon from our mock data
        const mockMatch = mockCategories.find(c => 
          c.name.toLowerCase() === name.toLowerCase()
        );
        
        return {
          id: name, // Use the name as the ID
          name: name,
          icon: mockMatch?.icon || 'tag' // Use matching icon or default to 'tag'
        };
      });
      
      // If no categories found, use mock data
      if (categories.length === 0) {
        console.log('No categories found, using mock data');
        set({ categories: mockCategories, isLoading: false });
        return;
      }
      
      set({ categories, isLoading: false });
    } catch (error) {
      console.error('Error fetching categories:', error);
      
      // Log detailed error information
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      } else {
        console.error('Unknown error type:', error);
      }
      
      // Fallback to mock data on error
      console.log('Using mock categories data due to error');
      set({ 
        categories: mockCategories, 
        error: handleSupabaseError(error), 
        isLoading: false 
      });
    }
  }
}));