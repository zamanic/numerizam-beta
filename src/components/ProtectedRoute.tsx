import { useContext } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export type UserRole = 'Admin' | 'Accountant' | 'Viewer' | 'Auditor' | 'Investor'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  requiresAdmin?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = [], 
  requiresAdmin = false 
}) => {
  const { user, initialLoading, session } = useContext(AuthContext)
  const location = useLocation()

  // Show loading while checking authentication
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!user && !session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If we have a session but no user profile yet, allow access (temporary fix for loading issues)
  if (session && !user) {
    return <>{children}</>
  }

  // Redirect to login if user is not approved
  if (user && !user.is_approved) {
    return <Navigate to="/login" state={{ message: 'Your account is pending approval.' }} replace />
  }

  // Check role-based access using user.role from AuthContext
  if (allowedRoles.length > 0 && user?.role && !allowedRoles.includes(user.role as UserRole)) {
    return <Navigate to="/unauthorized" replace />
  }

  // Legacy admin check (for backward compatibility)
  if (requiresAdmin && user?.role !== 'Admin') {
    return <Navigate to="/app" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute