import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Moon, Sun } from 'lucide-react-native';
import { useThemeStore } from '@/store/theme-store';

interface ThemeToggleProps {
  size?: number;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ size = 24 }) => {
  const { theme, toggleTheme, colors } = useThemeStore();
  
  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={[
        styles.container,
        { backgroundColor: colors.cardLight }
      ]}
      activeOpacity={0.7}
    >
      {theme === 'light' ? (
        <Sun size={size} color={colors.text} />
      ) : (
        <Moon size={size} color={colors.text} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});