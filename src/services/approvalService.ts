import { supabase } from './supabase'

export interface ApprovalRequest {
  id?: string
  user_id: string
  user_email: string
  user_name: string
  company_name: string
  requested_role: 'Accountant' | 'Auditor' | 'Admin'
  business_justification: string
  experience: string
  additional_info?: string
  status: 'pending' | 'approved' | 'rejected'
  admin_notes?: string
  created_at?: string
  updated_at?: string
  reviewed_by?: string
  reviewed_at?: string
}

export interface ApprovalNotification {
  id?: string
  admin_email: string
  request_id: string
  user_name: string
  user_email: string
  requested_role: string
  is_read: boolean
  created_at?: string
}

class ApprovalService {
  /**
   * Submit a new approval request
   */
  async submitApprovalRequest(requestData: Omit<ApprovalRequest, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<{ error: string | null }> {
    try {
      // Check if user already has a pending request
      const { data: existingRequest, error: checkError } = await supabase
        .from('approval_requests')
        .select('id, status')
        .eq('user_id', requestData.user_id)
        .eq('status', 'pending')
        .single()

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
        return { error: `Error checking existing requests: ${checkError.message}` }
      }

      if (existingRequest) {
        return { error: 'You already have a pending approval request. Please wait for admin review.' }
      }

      // Insert new approval request
      const { data: newRequest, error: insertError } = await supabase
        .from('approval_requests')
        .insert([{
          ...requestData,
          status: 'pending'
        }])
        .select()
        .single()

      if (insertError) {
        return { error: `Failed to submit request: ${insertError.message}` }
      }

      // Create notifications for all admins
      const { data: admins, error: adminError } = await supabase
        .from('numerizamauth')
        .select('email')
        .eq('role', 'Admin')
        .eq('is_approved', true)

      if (adminError) {
        console.warn('Failed to fetch admins for notifications:', adminError.message)
        // Don't fail the request if notifications fail
      } else if (admins && admins.length > 0) {
        const notifications = admins.map(admin => ({
          admin_email: admin.email,
          request_id: newRequest.id,
          user_name: requestData.user_name,
          user_email: requestData.user_email,
          requested_role: requestData.requested_role,
          is_read: false
        }))

        const { error: notificationError } = await supabase
          .from('approval_notifications')
          .insert(notifications)

        if (notificationError) {
          console.warn('Failed to create admin notifications:', notificationError.message)
          // Don't fail the request if notifications fail
        }
      }

      return { error: null }
    } catch (error) {
      return { error: `Failed to submit approval request: ${(error as Error).message}` }
    }
  }

  /**
   * Get all approval requests (admin only)
   */
  async getAllApprovalRequests(): Promise<{ requests: ApprovalRequest[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('approval_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        return { requests: [], error: error.message }
      }

      return { requests: data || [], error: null }
    } catch (error) {
      return { requests: [], error: `Failed to fetch approval requests: ${(error as Error).message}` }
    }
  }

  /**
   * Get pending approval requests (admin only)
   */
  async getPendingApprovalRequests(): Promise<{ requests: ApprovalRequest[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('approval_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) {
        return { requests: [], error: error.message }
      }

      return { requests: data || [], error: null }
    } catch (error) {
      return { requests: [], error: `Failed to fetch pending requests: ${(error as Error).message}` }
    }
  }

  /**
   * Approve an approval request (admin only)
   */
  async approveRequest(requestId: string, adminEmail: string, adminNotes?: string): Promise<{ error: string | null }> {
    try {
      // Get the request details first
      const { data: request, error: fetchError } = await supabase
        .from('approval_requests')
        .select('*')
        .eq('id', requestId)
        .single()

      if (fetchError) {
        return { error: `Failed to fetch request: ${fetchError.message}` }
      }

      // Update the approval request
      const { error: updateError } = await supabase
        .from('approval_requests')
        .update({
          status: 'approved',
          admin_notes: adminNotes,
          reviewed_by: adminEmail,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', requestId)

      if (updateError) {
        return { error: `Failed to update request: ${updateError.message}` }
      }

      // Update the user's role in numerizamauth table
      const { error: userUpdateError } = await supabase
        .from('numerizamauth')
        .update({
          role: request.requested_role,
          is_approved: true
        })
        .eq('id', request.user_id)

      if (userUpdateError) {
        return { error: `Failed to update user role: ${userUpdateError.message}` }
      }

      // Mark related notifications as read
      const { error: notificationError } = await supabase
        .from('approval_notifications')
        .update({ is_read: true })
        .eq('request_id', requestId)

      if (notificationError) {
        console.warn('Failed to update notifications:', notificationError.message)
        // Don't fail the approval if notification update fails
      }

      return { error: null }
    } catch (error) {
      return { error: `Failed to approve request: ${(error as Error).message}` }
    }
  }

  /**
   * Reject an approval request (admin only)
   */
  async rejectRequest(requestId: string, adminEmail: string, adminNotes?: string): Promise<{ error: string | null }> {
    try {
      // Update the approval request
      const { error: updateError } = await supabase
        .from('approval_requests')
        .update({
          status: 'rejected',
          admin_notes: adminNotes,
          reviewed_by: adminEmail,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', requestId)

      if (updateError) {
        return { error: `Failed to update request: ${updateError.message}` }
      }

      // Mark related notifications as read
      const { error: notificationError } = await supabase
        .from('approval_notifications')
        .update({ is_read: true })
        .eq('request_id', requestId)

      if (notificationError) {
        console.warn('Failed to update notifications:', notificationError.message)
        // Don't fail the rejection if notification update fails
      }

      return { error: null }
    } catch (error) {
      return { error: `Failed to reject request: ${(error as Error).message}` }
    }
  }

  /**
   * Get notifications for an admin
   */
  async getAdminNotifications(adminEmail: string): Promise<{ notifications: ApprovalNotification[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('approval_notifications')
        .select('*')
        .eq('admin_email', adminEmail)
        .order('created_at', { ascending: false })

      if (error) {
        return { notifications: [], error: error.message }
      }

      return { notifications: data || [], error: null }
    } catch (error) {
      return { notifications: [], error: `Failed to fetch notifications: ${(error as Error).message}` }
    }
  }

  /**
   * Get unread notification count for an admin
   */
  async getUnreadNotificationCount(adminEmail: string): Promise<{ count: number; error: string | null }> {
    try {
      const { count, error } = await supabase
        .from('approval_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('admin_email', adminEmail)
        .eq('is_read', false)

      if (error) {
        return { count: 0, error: error.message }
      }

      return { count: count || 0, error: null }
    } catch (error) {
      return { count: 0, error: `Failed to fetch notification count: ${(error as Error).message}` }
    }
  }

  /**
   * Mark notifications as read
   */
  async markNotificationsAsRead(adminEmail: string, requestIds?: string[]): Promise<{ error: string | null }> {
    try {
      let query = supabase
        .from('approval_notifications')
        .update({ is_read: true })
        .eq('admin_email', adminEmail)

      if (requestIds && requestIds.length > 0) {
        query = query.in('request_id', requestIds)
      }

      const { error } = await query

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      return { error: `Failed to mark notifications as read: ${(error as Error).message}` }
    }
  }

  /**
   * Get user's approval request status
   */
  async getUserApprovalStatus(userId: string): Promise<{ request: ApprovalRequest | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('approval_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        return { request: null, error: error.message }
      }

      return { request: data || null, error: null }
    } catch (error) {
      return { request: null, error: `Failed to fetch approval status: ${(error as Error).message}` }
    }
  }
}

export const approvalService = new ApprovalService()