import { useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useRouteLoading } from '../context/RouteLoadingContext'

interface UseRouteTransitionReturn {
  navigateWithLoading: (path: string, message?: string) => void
  showLoading: (message?: string) => void
  hideLoading: () => void
}

export const useRouteTransition = (): UseRouteTransitionReturn => {
  const navigate = useNavigate()
  const location = useLocation()
  const { setLoading, setLoadingMessage } = useRouteLoading()

  const navigateWithLoading = useCallback((path: string, message?: string) => {
    // Check if we're already on the target route
    if (location.pathname === path) {
      // If already on the same route, just show a brief loading state and return
      if (message) {
        setLoadingMessage(message)
      }
      setLoading(true)
      
      // Clear loading state after a brief moment to simulate refresh
      setTimeout(() => {
        setLoading(false)
      }, 300)
      return
    }

    if (message) {
      setLoadingMessage(message)
    }
    setLoading(true)
    
    // Small delay to show loading state before navigation
    setTimeout(() => {
      navigate(path)
    }, 100)
  }, [navigate, location.pathname, setLoading, setLoadingMessage])

  const showLoading = useCallback((message?: string) => {
    if (message) {
      setLoadingMessage(message)
    }
    setLoading(true)
  }, [setLoading, setLoadingMessage])

  const hideLoading = useCallback(() => {
    setLoading(false)
  }, [setLoading])

  return {
    navigateWithLoading,
    showLoading,
    hideLoading,
  }
}