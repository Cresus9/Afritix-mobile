import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes } from '@/constants/colors';

interface ThemeState {
  theme: 'light' | 'dark';
  colors: typeof themes.dark;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

// Helper function to get colors based on theme
const getColors = (theme: 'light' | 'dark') => {
  return themes[theme];
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      colors: getColors('dark'),
      setTheme: (theme) => set({ 
        theme, 
        colors: getColors(theme) 
      }),
      toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        return { 
          theme: newTheme, 
          colors: getColors(newTheme) 
        };
      }),
    }),
    {
      name: 'afritix-theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);