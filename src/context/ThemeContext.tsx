import { createContext, useContext } from 'react'

type ThemeContextType = {
  darkMode: boolean
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  toggleTheme: () => {},
})

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}