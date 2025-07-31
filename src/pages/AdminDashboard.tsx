import { useState, useEffect, useContext } from 'react'
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Button, 
  Chip, 
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent
} from '@mui/material'
import { Check, Close, Person, Business, LocationOn } from '@mui/icons-material'
import { motion } from 'framer-motion'

import { AuthContext } from '../context/AuthContext'
import { numerizamAuthService, NumerizamUser } from '../services/numerizamAuthService'

const AdminDashboard = () => {
  const { user } = useContext(AuthContext)
  const [pendingUsers, setPendingUsers] = useState<NumerizamUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedUser, setSelectedUser] = useState<NumerizamUser | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve')

  // Check if user is admin
  if (user?.role !== 'Admin') {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Access denied. Admin privileges required.
        </Alert>
        <Typography variant="body1" color="textSecondary">
          You do not have permission to access this page.
        </Typography>
      </Box>
    )
  }

  useEffect(() => {
    loadPendingUsers()
  }, [])

  const loadPendingUsers = async () => {
    setIsLoading(true)
    setError('')
    try {
      const { users, error } = await numerizamAuthService.getAllUsers()
      if (error) {
        throw new Error(error)
      }
      // Filter for pending users (not approved)
      const pending = users.filter(user => !user.is_approved)
      setPendingUsers(pending)
    } catch (err) {
      setError(`Failed to load pending users: ${(err as Error).message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveUser = async (userId: string) => {
    if (!user) return
    
    try {
      const { success, error } = await numerizamAuthService.approveUser(userId)
      if (error) {
        throw new Error(error)
      }
      if (success) {
        await loadPendingUsers() // Refresh the list
        setShowConfirmDialog(false)
        setSelectedUser(null)
      }
    } catch (err) {
      setError(`Failed to approve user: ${(err as Error).message}`)
    }
  }

  const handleRejectUser = async (userId: string) => {
    if (!user) return
    
    try {
      const { success, error } = await numerizamAuthService.rejectUser(userId)
      if (error) {
        throw new Error(error)
      }
      if (success) {
        await loadPendingUsers() // Refresh the list
        setShowConfirmDialog(false)
        setSelectedUser(null)
      }
    } catch (err) {
      setError(`Failed to reject user: ${(err as Error).message}`)
    }
  }

  const openConfirmDialog = (user: NumerizamUser, action: 'approve' | 'reject') => {
    setSelectedUser(user)
    setActionType(action)
    setShowConfirmDialog(true)
  }

  const handleConfirmAction = () => {
    if (!selectedUser || !selectedUser.id) return
    
    if (actionType === 'approve') {
      handleApproveUser(selectedUser.id)
    } else {
      handleRejectUser(selectedUser.id)
    }
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Manage accountant registrations and approve access to the system.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Person sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h6">{pendingUsers.length}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Pending Approvals
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ flexGrow: 1, p: 2, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Pending Accountant Registrations
        </Typography>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : pendingUsers.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="textSecondary">
              No pending registrations at this time.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Registration Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingUsers.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ display: 'table-row' }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Person sx={{ mr: 1, color: 'text.secondary' }} />
                        {user.name}
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Business sx={{ mr: 1, color: 'text.secondary' }} />
                        {user.company_name}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                        {user.country || 'Unknown'}, {user.region || 'Unknown'}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label="Pending" 
                        color="warning" 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<Check />}
                          onClick={() => openConfirmDialog(user, 'approve')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<Close />}
                          onClick={() => openConfirmDialog(user, 'reject')}
                        >
                          Reject
                        </Button>
                      </Box>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">
          {actionType === 'approve' ? 'Approve' : 'Reject'} Accountant Registration
        </DialogTitle>
        <DialogContent id="confirm-dialog-description">
          <Typography>
            Are you sure you want to {actionType} the registration for{' '}
            <strong>{selectedUser?.name}</strong> from{' '}
            <strong>{selectedUser?.company_name}</strong>?
          </Typography>
          {actionType === 'approve' && (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              This will grant them access to the query page and accounting features.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            color={actionType === 'approve' ? 'success' : 'error'}
            variant="contained"
          >
            {actionType === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AdminDashboard