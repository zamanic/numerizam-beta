/**
 * Admin Service
 * 
 * This service handles admin panel operations including user management,
 * company management, and system statistics.
 */

import { supabase } from './supabase'
import { NumerizamUser } from './numerizamAuthService'

export interface AdminUser extends NumerizamUser {
  last_login?: string;
  auth_user_id?: string;
}

export interface Company {
  id: number;
  company_name: string;
  created_at: string;
  user_count?: number;
}

export interface UserStats {
  total_users: number;
  approved_users: number;
  pending_users: number;
  total_companies: number;
  recent_signups: number;
}

class AdminService {
  /**
   * Get all users with additional admin information
   */
  async getAllUsers(): Promise<{ users: AdminUser[]; error: string | null }> {
    try {
      const { data: users, error } = await supabase
        .from('numerizamauth')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        return { users: [], error: error.message }
      }

      return { users: users as AdminUser[], error: null }
    } catch (error) {
      return { users: [], error: `Failed to fetch users: ${(error as Error).message}` }
    }
  }

  /**
   * Get all companies with user counts
   */
  async getAllCompanies(): Promise<{ companies: Company[]; error: string | null }> {
    try {
      // First get all unique companies from the companies table
      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false })

      if (companiesError) {
        return { companies: [], error: companiesError.message }
      }

      // Get user counts for each company
      const companiesWithCounts = await Promise.all(
        (companies || []).map(async (company) => {
          const { count } = await supabase
            .from('numerizamauth')
            .select('*', { count: 'exact', head: true })
            .eq('company_name', company.company_name)

          return {
            ...company,
            user_count: count || 0
          }
        })
      )

      return { companies: companiesWithCounts, error: null }
    } catch (error) {
      return { companies: [], error: `Failed to fetch companies: ${(error as Error).message}` }
    }
  }

  /**
   * Get user statistics for dashboard
   */
  async getUserStats(): Promise<{ stats: UserStats; error: string | null }> {
    try {
      // Get total users count
      const { count: totalUsers, error: totalError } = await supabase
        .from('numerizamauth')
        .select('*', { count: 'exact', head: true })

      if (totalError) {
        return { stats: {} as UserStats, error: totalError.message }
      }

      // Get approved users count
      const { count: approvedUsers, error: approvedError } = await supabase
        .from('numerizamauth')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', true)

      if (approvedError) {
        return { stats: {} as UserStats, error: approvedError.message }
      }

      // Get pending users count
      const { count: pendingUsers, error: pendingError } = await supabase
        .from('numerizamauth')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', false)

      if (pendingError) {
        return { stats: {} as UserStats, error: pendingError.message }
      }

      // Get total companies count
      const { count: totalCompanies, error: companiesError } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true })

      if (companiesError) {
        return { stats: {} as UserStats, error: companiesError.message }
      }

      // Get recent signups (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const { count: recentSignups, error: recentError } = await supabase
        .from('numerizamauth')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString())

      if (recentError) {
        return { stats: {} as UserStats, error: recentError.message }
      }

      const stats: UserStats = {
        total_users: totalUsers || 0,
        approved_users: approvedUsers || 0,
        pending_users: pendingUsers || 0,
        total_companies: totalCompanies || 0,
        recent_signups: recentSignups || 0
      }

      return { stats, error: null }
    } catch (error) {
      return { stats: {} as UserStats, error: `Failed to fetch stats: ${(error as Error).message}` }
    }
  }

  /**
   * Approve a user
   */
  async approveUser(userId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('numerizamauth')
        .update({ 
          is_approved: true,
          updated_at: new Date().toISOString()
        })
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
   * Reject/Delete a user
   */
  async deleteUser(userId: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('numerizamauth')
        .delete()
        .eq('id', userId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: `Failed to delete user: ${(error as Error).message}` }
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(userId: string, role: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('numerizamauth')
        .update({ 
          role,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: `Failed to update user role: ${(error as Error).message}` }
    }
  }

  /**
   * Search users by name, email, or company
   */
  async searchUsers(searchTerm: string): Promise<{ users: AdminUser[]; error: string | null }> {
    try {
      const { data: users, error } = await supabase
        .from('numerizamauth')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })

      if (error) {
        return { users: [], error: error.message }
      }

      return { users: users as AdminUser[], error: null }
    } catch (error) {
      return { users: [], error: `Failed to search users: ${(error as Error).message}` }
    }
  }

  /**
   * Get users by approval status
   */
  async getUsersByStatus(isApproved: boolean): Promise<{ users: AdminUser[]; error: string | null }> {
    try {
      const { data: users, error } = await supabase
        .from('numerizamauth')
        .select('*')
        .eq('is_approved', isApproved)
        .order('created_at', { ascending: false })

      if (error) {
        return { users: [], error: error.message }
      }

      return { users: users as AdminUser[], error: null }
    } catch (error) {
      return { users: [], error: `Failed to fetch users by status: ${(error as Error).message}` }
    }
  }

  /**
   * Truncate a specific table
   * This is an admin-only operation that removes all data from a table
   */
  async truncateTable(tableName: string): Promise<{ success: boolean; error: string | null }> {
    try {
      // Only allow truncating specific tables for safety
      const allowedTables = ['calendar', 'chartofaccounts', 'generalledger', 'territory'];
      
      if (!allowedTables.includes(tableName)) {
        return { 
          success: false, 
          error: `Table '${tableName}' cannot be truncated. Only the following tables can be truncated: ${allowedTables.join(', ')}` 
        };
      }

      // Execute the truncate operation with CASCADE to handle foreign key constraints
      const { error } = await supabase.rpc('admin_truncate_table', { table_name: tableName });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: `Failed to truncate table: ${(error as Error).message}` };
    }
  }
}

export const adminService = new AdminService()