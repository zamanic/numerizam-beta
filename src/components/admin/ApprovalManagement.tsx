import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Badge,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Divider
} from '@mui/material'
import {
  CheckCircle,
  Cancel,
  Visibility,
  Notifications,
  Person,
  Business,
  AccessTime,
  Email
} from '@mui/icons-material'
import { approvalService, ApprovalRequest, ApprovalNotification } from '../../services/approvalService'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`approval-tabpanel-${index}`}
      aria-labelledby={`approval-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

const ApprovalManagement: React.FC = () => {
  const { user } = useAuth()
  const [currentTab, setCurrentTab] = useState(0)
  const [requests, setRequests] = useState<ApprovalRequest[]>([])
  const [notifications, setNotifications] = useState<ApprovalNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'view'>('view')
  const [adminNotes, setAdminNotes] = useState('')
  const [processing, setProcessing] = useState(false)
  const [tablesExist, setTablesExist] = useState(false)

  useEffect(() => {
    if (user?.email) {
      loadData()
      loadNotifications()
      loadUnreadCount()
    }
  }, [user?.email])

  const loadData = async () => {
    setLoading(true)
    try {
      const { requests: allRequests, error } = await approvalService.getAllApprovalRequests()
      if (error) {
        toast.error(`Failed to load approval requests: ${error}`)
        if (error.includes('does not exist')) {
          setTablesExist(false)
        }
      } else {
        setRequests(allRequests)
        setTablesExist(true)
      }
    } catch (error) {
      toast.error('Failed to load approval requests')
      setTablesExist(false)
    } finally {
      setLoading(false)
    }
  }

  const loadNotifications = async () => {
    if (!user?.email) return
    
    try {
      const { notifications: userNotifications, error } = await approvalService.getAdminNotifications(user.email)
      if (error) {
        console.warn('Failed to load notifications:', error)
        if (error.includes('does not exist')) {
          setTablesExist(false)
        }
      } else {
        setNotifications(userNotifications)
        setTablesExist(true)
      }
    } catch (error) {
      console.warn('Failed to load notifications:', error)
      setTablesExist(false)
    }
  }

  const loadUnreadCount = async () => {
    if (!user?.email) return
    
    try {
      const { count, error } = await approvalService.getUnreadNotificationCount(user.email)
      if (error) {
        console.warn('Failed to load unread count:', error)
      } else {
        setUnreadCount(count)
      }
    } catch (error) {
      console.warn('Failed to load unread count')
    }
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    // Ensure the tab value is valid (0 or 1)
    if (newValue >= 0 && newValue <= 1) {
      setCurrentTab(newValue)
      if (newValue === 1 && user?.email && tablesExist) {
        // Mark notifications as read when viewing notifications tab
        approvalService.markNotificationsAsRead(user.email)
        setUnreadCount(0)
      }
    }
  }

  const handleAction = (request: ApprovalRequest, action: 'approve' | 'reject' | 'view') => {
    setSelectedRequest(request)
    setActionType(action)
    setAdminNotes('')
    setDialogOpen(true)
  }

  const handleConfirmAction = async () => {
    if (!selectedRequest || !user?.email) return

    setProcessing(true)
    try {
      let error: string | null = null

      if (actionType === 'approve') {
        const result = await approvalService.approveRequest(
          selectedRequest.id!,
          user.email,
          adminNotes
        )
        error = result.error
      } else if (actionType === 'reject') {
        const result = await approvalService.rejectRequest(
          selectedRequest.id!,
          user.email,
          adminNotes
        )
        error = result.error
      }

      if (error) {
        toast.error(`Failed to ${actionType} request: ${error}`)
      } else {
        toast.success(`Request ${actionType}d successfully`)
        setDialogOpen(false)
        loadData()
        loadNotifications()
        loadUnreadCount()
      }
    } catch (error) {
      toast.error(`Failed to ${actionType} request`)
    } finally {
      setProcessing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'approved':
        return 'success'
      case 'rejected':
        return 'error'
      default:
        return 'default'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const pendingRequests = requests.filter(req => req.status === 'pending')

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Loading approval requests...</Typography>
      </Box>
    )
  }

  if (!tablesExist) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Approval Management
        </Typography>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Database Setup Required
          </Typography>
          <Typography>
            The approval system tables are not set up in your database. Please run the approval system setup script to create the required tables.
          </Typography>
          <Typography sx={{ mt: 1 }}>
            Required tables: <code>approval_requests</code>, <code>approval_notifications</code>
          </Typography>
        </Alert>
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Approval Management
      </Typography>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <Person />
                Approval Requests
                {pendingRequests.length > 0 && (
                  <Badge badgeContent={pendingRequests.length} color="error" />
                )}
              </Box>
            }
          />
          <Tab
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <Notifications />
                Notifications
                {unreadCount > 0 && (
                  <Badge badgeContent={unreadCount} color="error" />
                )}
              </Box>
            }
          />
        </Tabs>

        <TabPanel value={currentTab} index={0}>
          {requests.length === 0 ? (
            <Alert severity="info">No approval requests found.</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Company</TableCell>
                    <TableCell>Requested Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.user_name}</TableCell>
                      <TableCell>{request.user_email}</TableCell>
                      <TableCell>{request.company_name}</TableCell>
                      <TableCell>
                        <Chip
                          label={request.requested_role}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={request.status}
                          size="small"
                          color={getStatusColor(request.status) as any}
                        />
                      </TableCell>
                      <TableCell>
                        {request.created_at && formatDate(request.created_at)}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleAction(request, 'view')}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          {request.status === 'pending' && (
                            <>
                              <Tooltip title="Approve">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleAction(request, 'approve')}
                                >
                                  <CheckCircle />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleAction(request, 'reject')}
                                >
                                  <Cancel />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        <TabPanel value={currentTab} index={1}>
          {notifications.length === 0 ? (
            <Alert severity="info">No notifications found.</Alert>
          ) : (
            <Grid container spacing={2}>
              {notifications.map((notification) => (
                <Grid item xs={12} md={6} key={notification.id}>
                  <Card variant={notification.is_read ? "outlined" : "elevation"}>
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Email color={notification.is_read ? "disabled" : "primary"} />
                        <Typography variant="h6" color={notification.is_read ? "text.secondary" : "primary"}>
                          New Approval Request
                        </Typography>
                        {!notification.is_read && (
                          <Chip label="New" size="small" color="error" />
                        )}
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>User:</strong> {notification.user_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Email:</strong> {notification.user_email}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Requested Role:</strong> {notification.requested_role}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Received:</strong> {notification.created_at && formatDate(notification.created_at)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
      </Paper>

      {/* Action Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {actionType === 'view' && 'Request Details'}
          {actionType === 'approve' && 'Approve Request'}
          {actionType === 'reject' && 'Reject Request'}
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    User Information
                  </Typography>
                  <Typography><strong>Name:</strong> {selectedRequest.user_name}</Typography>
                  <Typography><strong>Email:</strong> {selectedRequest.user_email}</Typography>
                  <Typography><strong>Company:</strong> {selectedRequest.company_name}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Request Details
                  </Typography>
                  <Typography><strong>Requested Role:</strong> {selectedRequest.requested_role}</Typography>
                  <Typography><strong>Status:</strong> {selectedRequest.status}</Typography>
                  <Typography><strong>Submitted:</strong> {selectedRequest.created_at && formatDate(selectedRequest.created_at)}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Business Justification
              </Typography>
              <Typography paragraph>{selectedRequest.business_justification}</Typography>

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Experience
              </Typography>
              <Typography paragraph>{selectedRequest.experience}</Typography>

              {selectedRequest.additional_info && (
                <>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Additional Information
                  </Typography>
                  <Typography paragraph>{selectedRequest.additional_info}</Typography>
                </>
              )}

              {selectedRequest.admin_notes && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Admin Notes
                  </Typography>
                  <Typography paragraph>{selectedRequest.admin_notes}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Reviewed by: {selectedRequest.reviewed_by} on {selectedRequest.reviewed_at && formatDate(selectedRequest.reviewed_at)}
                  </Typography>
                </>
              )}

              {(actionType === 'approve' || actionType === 'reject') && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Admin Notes (Optional)"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add any notes about your decision..."
                  />
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            {actionType === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {actionType !== 'view' && (
            <Button
              onClick={handleConfirmAction}
              disabled={processing}
              color={actionType === 'approve' ? 'success' : 'error'}
              variant="contained"
            >
              {processing ? 'Processing...' : actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ApprovalManagement