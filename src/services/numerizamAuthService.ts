/**
 * Numerizam Authentication Service
 * 
 * This service handles authentication using Supabase's built-in auth system
 * combined with the custom numerizamauth table for user profiles.
 */

import { supabase } from './supabase'

export interface NumerizamUser {
  id?: string;
  name: string;
  email: string;
  password?: string; // Not used for auth, handled by Supabase Auth
  company_name: string;
  country?: string;
  region?: string;
  role: 'Admin' | 'Accountant' | 'Viewer' | 'Auditor' | 'Investor';
  is_approved: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RegisterUserData {
  email: string;
  password: string;
  name: string;
  company_name: string;
  country: string;
  region: string;
  role: 'Admin' | 'Accountant' | 'Viewer' | 'Auditor' | 'Investor';
}

class NumerizamAuthService {
  /**
   * Login user using Supabase Auth and fetch profile from numerizamauth
   */
  async login(email: string, password: string): Promise<{ user: NumerizamUser | null; error: string | null }> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) {
        return { user: null, error: authError.message }
      }

      if (!authData.user) {
        return { user: null, error: 'Authentication failed' }
      }

      // Then fetch user profile from numerizamauth table using email
      const { data: userProfile, error: profileError } = await supabase
        .from('numerizamauth')
        .select('*')
        .eq('email', email)
        .single()

      if (profileError) {
        return { user: null, error: `Profile not found: ${profileError.message}` }
      }

      if (!userProfile.is_approved) {
        // Sign out the user since they're not approved
        await supabase.auth.signOut()
        return { user: null, error: 'Your account is pending admin approval. Please wait for approval before logging in.' }
      }

      return { user: userProfile as NumerizamUser, error: null }
    } catch (error) {
      return { user: null, error: `Login failed: ${(error as Error).message}` }
    }
  }

  /**
   * Register a new user with Supabase Auth (trigger will handle numerizamauth creation)
   */
  async register(userData: RegisterUserData): Promise<{ user: NumerizamUser | null; error: string | null }> {
    try {
      // Create user in Supabase Auth - the trigger will automatically create the profile
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.name,
            company_name: userData.company_name,
            country: userData.country,
            region: userData.region
          }
        }
      })

      if (authError) {
        return { user: null, error: authError.message }
      }

      if (!authData.user) {
        return { user: null, error: 'User registration failed' }
      }

      // The trigger should have created the profile automatically
      // We'll return a basic user object since the trigger handles the creation
      const basicUser: NumerizamUser = {
        name: userData.name,
        email: userData.email,
        company_name: userData.company_name,
        role: userData.role,
        is_approved: false // Will be set by trigger based on email
      }

      return { user: basicUser, error: null }
    } catch (error) {
      return { user: null, error: `Registration failed: ${(error as Error).message}` }
    }
  }

  /**
   * Send password reset email
   */
  async resetPasswordForEmail(email: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: `Password reset failed: ${(error as Error).message}` }
    }
  }

  /**
   * Update user password (used after password reset)
   */
  async updatePassword(newPassword: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: `Password update failed: ${(error as Error).message}` }
    }
  }

  /**
   * Get current authenticated user with profile data
   */
  async getCurrentUser(): Promise<{ user: NumerizamUser | null; error: string | null }> {
    try {
      // Get current auth user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

      if (authError || !authUser) {
        return { user: null, error: 'No authenticated user' }
      }

      // Fetch user profile from numerizamauth table using email
      const { data: userProfile, error: profileError } = await supabase
        .from('numerizamauth')
        .select('*')
        .eq('email', authUser.email)
        .single()

      if (profileError) {
        return { user: null, error: `Profile not found: ${profileError.message}` }
      }

      return { user: userProfile as NumerizamUser, error: null }
    } catch (error) {
      return { user: null, error: `Failed to get current user: ${(error as Error).message}` }
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: `Logout failed: ${(error as Error).message}` }
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      return !!(session?.user)
    } catch (error) {
      console.error('Error checking authentication:', error)
      return false
    }
  }

  /**
   * Get all users (Admin only)
   */
  async getAllUsers(): Promise<{ users: NumerizamUser[]; error: string | null }> {
    try {
      const { data: users, error } = await supabase
        .from('numerizamauth')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        return { users: [], error: error.message }
      }

      return { users: users as NumerizamUser[], error: null }
    } catch (error) {
      return { users: [], error: `Failed to fetch users: ${(error as Error).message}` }
    }
  }

  /**
   * Approve a user (Admin only)
   */
  async approveUser(userId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('numerizamauth')
        .update({ is_approved: true })
        .eq('id', userId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: `Failed to approve user: ${(error as Error).message}` }
    }
  }

  /**
   * Reject a user (Admin only) - removes both profile and auth user
   */
  async rejectUser(userId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      // First get the user to find their auth_user_id
      const { data: user, error: fetchError } = await supabase
        .from('numerizamauth')
        .select('auth_user_id')
        .eq('id', userId)
        .single()

      if (fetchError || !user) {
        return { success: false, error: 'User not found' }
      }

      // Delete from numerizamauth table
      const { error: deleteProfileError } = await supabase
        .from('numerizamauth')
        .delete()
        .eq('id', userId)

      if (deleteProfileError) {
        return { success: false, error: deleteProfileError.message }
      }

      // Note: Deleting from auth.users requires admin privileges
      // This would typically be done via a Supabase Edge Function or RPC
      // For now, we'll just delete the profile

      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: `Failed to reject user: ${(error as Error).message}` }
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

export const numerizamAuthService = new NumerizamAuthService()