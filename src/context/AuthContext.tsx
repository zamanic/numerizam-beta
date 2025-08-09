import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Session, User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '../services/supabase'
import { useNavigate } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { numerizamAuthService, NumerizamUser } from '../services/numerizamAuthService'

// Types
export type UserRole = 'Viewer' | 'Accountant' | 'Admin' | 'Auditor' | 'Investor'

export type Company = {
  id: string
  name: string
  createdAt: string
  primaryCurrency: string
}

export type User = {
  id?: string
  email: string
  name: string
  role: UserRole
  company_name: string
  is_approved: boolean
  companies: Company[]
  currentCompany: Company | null
}

interface AuthContextType {
  session: Session | null
  user: User | null
  supabaseUser: SupabaseUser | null
  role: string | null
  loading: boolean
  initialLoading: boolean
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string, companyName: string, country: string, region: string) => Promise<void>
  logout: () => void
  completeOnboarding: (role: UserRole, primaryCurrency: string) => Promise<void>
  switchCompany: (companyId: string) => void
  checkApprovalStatus: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  supabaseUser: null,
  role: null,
  loading: false,
  initialLoading: true,
  isLoading: false,
  isAuthenticated: false,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  completeOnboarding: async () => {},
  switchCompany: () => {},
  checkApprovalStatus: async () => false,
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(false) // For operations like login, signup, etc.
  const [initialLoading, setInitialLoading] = useState(true) // For initial session check
  const navigate = useNavigate()

  // Default mock company for fallback scenarios
  const mockCompany: Company = {
    id: '1',
    name: 'Unknown Company',
    createdAt: new Date().toISOString(),
    primaryCurrency: 'USD',
  }

  // Helper function to create user data from Numerizam user
  const createUserData = (numerizamUser: NumerizamUser): User => {
    const userCompany: Company = {
      id: '1',
      name: numerizamUser.company_name,
      createdAt: new Date().toISOString(),
      primaryCurrency: 'USD',
    }

    return {
      id: numerizamUser.id,
      email: numerizamUser.email,
      name: numerizamUser.name,
      role: numerizamUser.role as UserRole,
      company_name: numerizamUser.company_name,
      is_approved: numerizamUser.is_approved,
      companies: [userCompany],
      currentCompany: userCompany,
    }
  }

  // Helper function to fetch and set user profile
  const fetchAndSetUserProfile = async (supabaseSession: Session | null) => {
    if (!supabaseSession) {
      setUser(null)
      setRole(null)
      return
    }

    try {
      const { user: currentUser, error } = await numerizamAuthService.getCurrentUser()
      if (!error && currentUser) {
        const userData = createUserData(currentUser)
        setUser(userData)
        setRole(currentUser.role)
        
        // Don't show approval warning for approved users
        if (!currentUser.is_approved) {
          toast.warning('Your account is pending admin approval')
        }
      } else {
        // If there's an error fetching user profile but we have a valid session,
        // create a minimal user object to prevent infinite loading
        if (supabaseSession?.user?.email) {
          const fallbackUser = {
            id: supabaseSession.user.id,
            email: supabaseSession.user.email,
            name: supabaseSession.user.user_metadata?.name || 'User',
            role: 'Accountant' as UserRole,
            company_name: 'Unknown',
            is_approved: true, // Assume approved if they have a valid session
            companies: [mockCompany],
            currentCompany: mockCompany,
          }
          setUser(fallbackUser)
          setRole('Accountant')
          console.warn('Using fallback user data due to profile fetch error:', error)
        } else {
          setUser(null)
          setRole(null)
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      
      // If there's an error but we have a valid session, create fallback user
      if (supabaseSession?.user?.email) {
        const fallbackUser = {
          id: supabaseSession.user.id,
          email: supabaseSession.user.email,
          name: supabaseSession.user.user_metadata?.name || 'User',
          role: 'Accountant' as UserRole,
          company_name: 'Unknown',
          is_approved: true, // Assume approved if they have a valid session
          companies: [mockCompany],
          currentCompany: mockCompany,
        }
        setUser(fallbackUser)
        setRole('Accountant')
        console.warn('Using fallback user data due to fetch error:', error)
      } else {
        setUser(null)
        setRole(null)
      }
    }
  }

  useEffect(() => {
    const getSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        
        if (!error && session) {
          // Check if session is still valid (not expired)
          const now = Math.floor(Date.now() / 1000)
          const expiresAt = session.expires_at || 0
          
          if (expiresAt > now) {
            setSession(session)
            setSupabaseUser(session?.user ?? null)
            
            // Get role from user metadata or fetch from profile
            const userRole = session?.user?.user_metadata?.role ?? null
            setRole(userRole)
            
            // Fetch full user profile from Numerizam service with timeout
            try {
              await Promise.race([
                fetchAndSetUserProfile(session),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Profile fetch timeout')), 10000))
              ])
            } catch (profileError) {
              console.warn('Profile fetch failed or timed out, using fallback:', profileError)
              // Create fallback user if profile fetch fails
              if (session?.user?.email) {
                const fallbackUser = {
                  id: session.user.id,
                  email: session.user.email,
                  name: session.user.user_metadata?.name || 'User',
                  role: 'Accountant' as UserRole,
                  company_name: 'Unknown Company',
                  is_approved: true, // Assume approved if they have a valid session
                  companies: [mockCompany],
                  currentCompany: mockCompany,
                }
                setUser(fallbackUser)
                setRole('Accountant')
              }
            }
          } else {
            // Session expired, clear it
            await supabase.auth.signOut()
            setSession(null)
            setSupabaseUser(null)
            setUser(null)
            setRole(null)
          }
        } else {
          setSession(null)
          setSupabaseUser(null)
          setUser(null)
          setRole(null)
        }
      } catch (error) {
        console.error('Error getting session:', error)
        setSession(null)
        setSupabaseUser(null)
        setUser(null)
        setRole(null)
      } finally {
        setInitialLoading(false)
      }
    }

    getSession()

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Handle different auth events
      if (event === 'PASSWORD_RECOVERY') {
        toast.info('Please reset your password')
        navigate('/reset-password')
      }
      
      // Handle INITIAL_SESSION - this happens when the page loads and checks for existing session
      if (event === 'INITIAL_SESSION') {
        if (session) {
          setSession(session)
          setSupabaseUser(session?.user ?? null)
          
          // Get role from user metadata
          const userRole = session?.user?.user_metadata?.role ?? null
          setRole(userRole)
          
          // Fetch profile with timeout protection
          try {
            await Promise.race([
              fetchAndSetUserProfile(session),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Profile fetch timeout')), 10000))
            ])
          } catch (profileError) {
            console.warn('Profile fetch failed or timed out in INITIAL_SESSION, using fallback:', profileError)
            // Create fallback user if profile fetch fails
            if (session?.user?.email) {
              const fallbackUser = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.name || 'User',
                role: 'Accountant' as UserRole,
                company_name: 'Unknown Company',
                is_approved: true, // Assume approved if they have a valid session
                companies: [mockCompany],
                currentCompany: mockCompany,
              }
              setUser(fallbackUser)
              setRole('Accountant')
            }
          }
          
          // For initial session, navigate to app if not on login page
          const currentPath = window.location.pathname
          if (currentPath === '/login' || currentPath === '/') {
            navigate('/app')
          }
        }
        return
      }
      
      // Only show success toast for actual sign-in events, not initial session checks
      if (event === 'SIGNED_IN') {
        // Only set session and supabaseUser if it's a real Supabase session
        if (session) {
          setSession(session)
          setSupabaseUser(session?.user ?? null)
          
          // Get role from user metadata
          const userRole = session?.user?.user_metadata?.role ?? null
          setRole(userRole)
          
          // Fetch profile with timeout protection
          try {
            await Promise.race([
              fetchAndSetUserProfile(session),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Profile fetch timeout')), 5000))
            ])
          } catch (profileError) {
            console.info('Profile fetch failed or timed out in SIGNED_IN, using fallback:', profileError)
            // Create fallback user if profile fetch fails
            if (session?.user?.email) {
              const fallbackUser = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.name || 'User',
                role: 'Accountant' as UserRole,
                company_name: 'Unknown Company',
                is_approved: true, // Assume approved if they have a valid session
                companies: [mockCompany],
                currentCompany: mockCompany,
              }
              setUser(fallbackUser)
              setRole('Accountant')
            }
          }
          
          // Only show toast and navigate if this is a fresh login (not a session restoration)
          const currentPath = window.location.pathname
          if (currentPath === '/login' || currentPath === '/') {
            toast.success('Signed in successfully')
            navigate('/app')
          }
        }
      }
      
      if (event === 'SIGNED_OUT' || !session) {
        setSession(null)
        setSupabaseUser(null)
        setUser(null)
        setRole(null)
        
        // Only redirect to login if not on public pages
        const currentPath = window.location.pathname
        const publicPaths = ['/', '/login', '/signup', '/reset-password', '/request-reset', '/demo']
        if (!publicPaths.includes(currentPath)) {
          navigate('/login')
        }
      }
      
      if (event === 'TOKEN_REFRESHED') {
        // Only call fetchAndSetUserProfile with proper Supabase session
        if (session) {
          setSession(session)
          setSupabaseUser(session?.user ?? null)
          
          // Get role from user metadata
          const userRole = session?.user?.user_metadata?.role ?? null
          setRole(userRole)
          
          // Fetch profile with timeout protection
          try {
            await Promise.race([
              fetchAndSetUserProfile(session),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Profile fetch timeout')), 5000))
            ])
          } catch (profileError) {
            console.info('Profile fetch failed or timed out in TOKEN_REFRESHED, using fallback:', profileError)
            // Create fallback user if profile fetch fails
            if (session?.user?.email) {
              const fallbackUser = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.name || 'User',
                role: 'Accountant' as UserRole,
                company_name: 'Unknown Company',
                is_approved: true, // Assume approved if they have a valid session
                companies: [mockCompany],
                currentCompany: mockCompany,
              }
              setUser(fallbackUser)
              setRole('Accountant')
            }
          }
        }
      }
    })

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [navigate])

  // Login function with Numerizam Auth Service
  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { user: _, error } = await numerizamAuthService.login(email, password)

      if (error) {
        toast.error(error)
        throw new Error(error)
      }

      // If login is successful, the auth state change handler will handle the rest
      // No need to manually set user data or navigate here
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Signup function with Numerizam Auth Service
  const signup = async (email: string, password: string, name: string, companyName: string, country: string, region: string) => {
    setLoading(true)
    try {
      const { user: newUser, error } = await numerizamAuthService.register({
        email,
        password,
        name,
        company_name: companyName,
        country,
        region,
        role: 'Accountant'
      })

      if (error) {
        toast.error(error)
        throw new Error(error)
      }

      if (newUser) {
        // Sign out immediately after registration since approval is required
        await numerizamAuthService.logout()
        
        // Show success message and redirect to login
        toast.success('Registration successful! Your account is pending admin approval. You will be notified once approved.')
        navigate('/login')
      }
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Check approval status
  const checkApprovalStatus = async (): Promise<boolean> => {
    try {
      const { user: currentUser, error } = await numerizamAuthService.getCurrentUser()
      if (error) {
        console.error('Error checking approval status:', error)
        return false
      }
      return currentUser?.is_approved || false
    } catch (error) {
      console.error('Error checking approval status:', error)
      return false
    }
  }

  // Mock complete onboarding function (keeping for compatibility)
  const completeOnboarding = async (role: UserRole, primaryCurrency: string) => {
    if (!user) return

    setLoading(true)
    try {
      // In a real app, this would update the user profile
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const updatedCompany = {
        ...user.currentCompany!,
        primaryCurrency,
      }

      const updatedUser = {
        ...user,
        role,
        currentCompany: updatedCompany,
        companies: user.companies.map((company) =>
          company.id === updatedCompany.id ? updatedCompany : company
        ),
      }

      setUser(updatedUser)
      setRole(role)
      toast.success('Onboarding completed successfully!')
      navigate('/app')
    } catch (error) {
      console.error('Onboarding error:', error)
      toast.error('Failed to complete onboarding')
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await numerizamAuthService.logout()
      setUser(null)
      setRole(null)
      setSession(null)
      setSupabaseUser(null)
      toast.success('Logged out successfully')
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to logout')
    }
  }

  // Switch company function (keeping for compatibility)
  const switchCompany = (companyId: string) => {
    if (!user) return

    const company = user.companies.find((c) => c.id === companyId)
    if (!company) return

    const updatedUser = {
      ...user,
      currentCompany: company,
    }

    setUser(updatedUser)
    toast.success(`Switched to ${company.name}`)
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        supabaseUser,
        role,
        loading,
        initialLoading,
        isLoading: loading, // Only for operations, not initial session check
        isAuthenticated: !!user && user.is_approved,
        login,
        signup,
        logout,
        completeOnboarding,
        switchCompany,
        checkApprovalStatus,
      }}
    >
      {children}
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false} 
        newestOnTop 
        closeOnClick 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
      />
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
export { AuthContext }