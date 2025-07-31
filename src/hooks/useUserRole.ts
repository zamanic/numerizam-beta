import { useEffect, useState } from 'react'
import { numerizamAuthService } from '../services/numerizamAuthService'

export type UserRole = 'Admin' | 'Accountant' | 'Viewer' | 'Auditor' | 'Investor' | null

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRole = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const { user, error: getUserError } = await numerizamAuthService.getCurrentUser()
        
        if (getUserError) {
          setError(getUserError)
          return
        }

        if (!user) {
          setError('No user found')
          return
        }

        // The role is already included in the user object from getCurrentUser
        if (user.role) {
          setRole(user.role as UserRole)
        } else {
          setError('No role found for user')
        }
      } catch (err) {
        console.error('Error fetching user role:', err)
        setError('Failed to fetch user role')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRole()
  }, [])

  return { role, isLoading, error }
}