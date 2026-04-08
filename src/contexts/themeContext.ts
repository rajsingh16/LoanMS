import { createContext } from 'react';

export interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

// Shared context object used by the provider and the hook.
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

