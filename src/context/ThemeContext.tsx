import { createContext } from 'react'

type ThemeContextType = {
  darkMode: boolean
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  toggleTheme: () => {},
})