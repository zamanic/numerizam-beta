import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRouteLoading } from '../context/RouteLoadingContext'

interface UseRouteTransitionReturn {
  navigateWithLoading: (path: string, message?: string) => void
  showLoading: (message?: string) => void
  hideLoading: () => void
}

export const useRouteTransition = (): UseRouteTransitionReturn => {
  const navigate = useNavigate()
  const { setLoading, setLoadingMessage } = useRouteLoading()

  const navigateWithLoading = useCallback((path: string, message?: string) => {
    if (message) {
      setLoadingMessage(message)
    }
    setLoading(true)
    
    // Small delay to show loading state before navigation
    setTimeout(() => {
      navigate(path)
    }, 100)
  }, [navigate, setLoading, setLoadingMessage])

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