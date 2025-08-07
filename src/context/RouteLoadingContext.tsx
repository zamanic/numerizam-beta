import React, { createContext, useContext, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

interface RouteLoadingContextType {
  isLoading: boolean
  setLoading: (loading: boolean) => void
  loadingMessage: string
  setLoadingMessage: (message: string) => void
}

const RouteLoadingContext = createContext<RouteLoadingContextType | undefined>(undefined)

export const useRouteLoading = () => {
  const context = useContext(RouteLoadingContext)
  if (!context) {
    throw new Error('useRouteLoading must be used within a RouteLoadingProvider')
  }
  return context
}

interface RouteLoadingProviderProps {
  children: React.ReactNode
}

export const RouteLoadingProvider: React.FC<RouteLoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('Loading...')
  const location = useLocation()

  // Route-specific loading messages
  const getRouteMessage = (pathname: string): string => {
    if (pathname === '/') return 'Loading Dashboard...'
    if (pathname === '/login') return 'Preparing Login...'
    if (pathname === '/signup') return 'Loading Registration...'
    if (pathname === '/app') return 'Loading Dashboard...'
    if (pathname === '/app/query') return 'Loading Query Interface...'
    if (pathname === '/app/ocr') return 'Loading OCR Upload...'
    if (pathname === '/app/ai') return 'Loading AI Assistant...'
    if (pathname === '/app/admin') return 'Loading Admin Panel...'
    if (pathname === '/app/admin-dashboard') return 'Loading Admin Dashboard...'
    if (pathname === '/demo') return 'Loading Demo...'
    return 'Loading...'
  }

  // Handle route changes
  useEffect(() => {
    setIsLoading(true)
    setLoadingMessage(getRouteMessage(location.pathname))
    
    // Simulate minimum loading time for smooth UX
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 300) // 300ms minimum loading time

    return () => clearTimeout(timer)
  }, [location.pathname])

  const setLoading = (loading: boolean) => {
    setIsLoading(loading)
  }

  const contextValue: RouteLoadingContextType = {
    isLoading,
    setLoading,
    loadingMessage,
    setLoadingMessage,
  }

  return (
    <RouteLoadingContext.Provider value={contextValue}>
      {children}
    </RouteLoadingContext.Provider>
  )
}