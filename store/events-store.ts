import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { Event } from '@/types';
import { mockEvents } from '@/mocks/events';

interface EventsState {
  events: Event[];
  featuredEvents: Event[];
  filteredEvents: Event[];
  selectedEvent: Event | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string | null;
  fetchEvents: () => Promise<void>;
  fetchEventById: (id: string) => Promise<void>;
  searchEvents: (query: string) => void;
  filterByCategory: (category: string | null) => void;
  clearFilters: () => void;
}

export const useEventsStore = create<EventsState>()(
  persist(
    (set, get) => ({
      events: [],
      featuredEvents: [],
      filteredEvents: [],
      selectedEvent: null,
      isLoading: false,
      error: null,
      searchQuery: '',
      selectedCategory: null,
      
      fetchEvents: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Fetch events from Supabase
          const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('date', { ascending: true });
          
          if (error) {
            throw error;
          }
          
          if (data && data.length > 0) {
            // Map Supabase data to Event type
            const events: Event[] = data.map(item => ({
              id: item.id,
              title: item.title,
              description: item.description,
              date: item.date,
              time: item.time,
              location: item.location,
              venue: item.venue,
              image: item.image_url,
              price: item.price,
              currency: item.currency || 'XOF',
              category: item.category,
              organizer: item.organizer,
              featured: item.featured || false,
              ticketsAvailable: item.tickets_available,
              ticketsSold: item.tickets_sold,
            }));
            
            // Filter featured events
            const featured = events.filter(event => event.featured);
            
            set({ 
              events, 
              featuredEvents: featured,
              filteredEvents: events,
              isLoading: false 
            });
          } else {
            // Use mock data if no events from Supabase
            console.log('No events found in Supabase, using mock data');
            
            // Filter featured events from mock data
            const featured = mockEvents.filter(event => event.featured);
            
            set({ 
              events: mockEvents, 
              featuredEvents: featured,
              filteredEvents: mockEvents,
              isLoading: false 
            });
          }
        } catch (error) {
          console.error('Error fetching events:', error);
          
          // Fallback to mock data on error
          const featured = mockEvents.filter(event => event.featured);
          
          set({ 
            events: mockEvents, 
            featuredEvents: featured,
            filteredEvents: mockEvents,
            error: 'Failed to fetch events',
            isLoading: false 
          });
        }
      },
      
      fetchEventById: async (id: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // First try to fetch from Supabase
          const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) {
            throw error;
          }
          
          if (data) {
            // Map Supabase data to Event type
            const event: Event = {
              id: data.id,
              title: data.title,
              description: data.description,
              date: data.date,
              time: data.time,
              location: data.location,
              venue: data.venue,
              image: data.image_url,
              price: data.price,
              currency: data.currency || 'XOF',
              category: data.category,
              organizer: data.organizer,
              featured: data.featured || false,
              ticketsAvailable: data.tickets_available,
              ticketsSold: data.tickets_sold,
            };
            
            set({ selectedEvent: event, isLoading: false });
          } else {
            // If not found in Supabase, look in mock data
            const mockEvent = mockEvents.find(event => event.id === id);
            
            if (mockEvent) {
              set({ selectedEvent: mockEvent, isLoading: false });
            } else {
              set({ 
                error: 'Event not found', 
                isLoading: false,
                selectedEvent: null
              });
            }
          }
        } catch (error) {
          console.error('Error fetching event by ID:', error);
          
          // Fallback to mock data on error
          const mockEvent = mockEvents.find(event => event.id === id);
          
          if (mockEvent) {
            set({ selectedEvent: mockEvent, isLoading: false });
          } else {
            set({ 
              error: 'Failed to fetch event details', 
              isLoading: false,
              selectedEvent: null
            });
          }
        }
      },
      
      searchEvents: (query: string) => {
        const { events, selectedCategory } = get();
        set({ searchQuery: query });
        
        if (!query && !selectedCategory) {
          set({ filteredEvents: events });
          return;
        }
        
        let filtered = events;
        
        // Apply search query filter
        if (query) {
          const lowercaseQuery = query.toLowerCase();
          filtered = filtered.filter(event => 
            event.title.toLowerCase().includes(lowercaseQuery) ||
            event.description.toLowerCase().includes(lowercaseQuery) ||
            event.location.toLowerCase().includes(lowercaseQuery) ||
            event.venue.toLowerCase().includes(lowercaseQuery) ||
            event.organizer.toLowerCase().includes(lowercaseQuery)
          );
        }
        
        // Apply category filter if selected
        if (selectedCategory) {
          filtered = filtered.filter(event => event.category === selectedCategory);
        }
        
        set({ filteredEvents: filtered });
      },
      
      filterByCategory: (category: string | null) => {
        const { events, searchQuery } = get();
        set({ selectedCategory: category });
        
        if (!category && !searchQuery) {
          set({ filteredEvents: events });
          return;
        }
        
        let filtered = events;
        
        // Apply category filter
        if (category) {
          filtered = filtered.filter(event => event.category === category);
        }
        
        // Apply search query filter if exists
        if (searchQuery) {
          const lowercaseQuery = searchQuery.toLowerCase();
          filtered = filtered.filter(event => 
            event.title.toLowerCase().includes(lowercaseQuery) ||
            event.description.toLowerCase().includes(lowercaseQuery) ||
            event.location.toLowerCase().includes(lowercaseQuery) ||
            event.venue.toLowerCase().includes(lowercaseQuery) ||
            event.organizer.toLowerCase().includes(lowercaseQuery)
          );
        }
        
        set({ filteredEvents: filtered });
      },
      
      clearFilters: () => {
        const { events } = get();
        set({ 
          searchQuery: '',
          selectedCategory: null,
          filteredEvents: events
        });
      }
    }),
    {
      name: 'afritix-events-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist these fields to avoid issues
        selectedCategory: state.selectedCategory,
        searchQuery: state.searchQuery,
      }),
    }
  )
);