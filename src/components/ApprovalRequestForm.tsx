import { useState, useContext } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper
} from '@mui/material'
import { Send, Business, Person, Description } from '@mui/icons-material'
import { motion } from 'framer-motion'
import { AuthContext } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'
import { approvalService } from '../services/approvalService'

interface ApprovalRequestFormProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

const ApprovalRequestForm = ({ open, onClose, onSuccess }: ApprovalRequestFormProps) => {
  const { user } = useContext(AuthContext)
  const [requestedRole, setRequestedRole] = useState<'Accountant' | 'Auditor' | 'Admin'>('Accountant')
  const [businessJustification, setBusinessJustification] = useState('')
  const [experience, setExperience] = useState('')
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    if (!businessJustification.trim()) {
      setError('Please provide a business justification for your request')
      return
    }

    if (!experience.trim()) {
      setError('Please describe your relevant experience')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const { error: submitError } = await approvalService.submitApprovalRequest({
        user_id: user?.id || '',
        user_email: user?.email || '',
        user_name: user?.name || '',
        company_name: user?.company_name || '',
        requested_role: requestedRole,
        business_justification: businessJustification,
        experience,
        additional_info: additionalInfo
      })

      if (submitError) {
        setError(submitError)
      } else {
        setSuccess(true)
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 2000)
      }
    } catch (err) {
      setError('Failed to submit approval request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setError('')
      setSuccess(false)
      setBusinessJustification('')
      setExperience('')
      setAdditionalInfo('')
      onClose()
    }
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'Accountant':
        return 'Access to financial data entry, reporting, and basic analytics'
      case 'Auditor':
        return 'Read-only access to all financial records for audit purposes'
      case 'Admin':
        return 'Full system access including user management and system configuration'
      default:
        return ''
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Accountant':
        return 'primary'
      case 'Auditor':
        return 'secondary'
      case 'Admin':
        return 'error'
      default:
        return 'default'
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Person color="primary" />
          <Typography variant="h6">Request Role Approval</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Submit a request to upgrade your account permissions
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Your approval request has been submitted successfully! An admin will review your request shortly.
          </Alert>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Box sx={{ mb: 3 }}>
            <Paper sx={{ p: 2, bgcolor: 'background.default', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Business fontSize="small" />
                Current Account Information
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Name:</strong> {user?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Email:</strong> {user?.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Company:</strong> {user?.company_name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Current Role:</strong> <Chip label={user?.role} size="small" />
              </Typography>
            </Paper>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Requested Role</InputLabel>
              <Select
                value={requestedRole}
                label="Requested Role"
                onChange={(e) => setRequestedRole(e.target.value as 'Accountant' | 'Auditor' | 'Admin')}
                disabled={isSubmitting}
              >
                <MenuItem value="Accountant">
                  <Box>
                    <Typography variant="body1">Accountant</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Financial data entry and reporting access
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="Auditor">
                  <Box>
                    <Typography variant="body1">Auditor</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Read-only access for audit purposes
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="Admin">
                  <Box>
                    <Typography variant="body1">Admin</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Full system access and user management
                    </Typography>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mb: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                <Chip 
                  label={requestedRole} 
                  color={getRoleColor(requestedRole) as any} 
                  size="small" 
                  sx={{ mr: 1 }} 
                />
                Role Permissions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {getRoleDescription(requestedRole)}
              </Typography>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Business Justification"
              placeholder="Explain why you need this role and how it will benefit your work..."
              value={businessJustification}
              onChange={(e) => setBusinessJustification(e.target.value)}
              disabled={isSubmitting}
              sx={{ mb: 2 }}
              required
              InputProps={{
                startAdornment: <Description sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Relevant Experience"
              placeholder="Describe your experience with accounting, auditing, or system administration..."
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              disabled={isSubmitting}
              sx={{ mb: 2 }}
              required
            />

            <TextField
              fullWidth
              multiline
              rows={2}
              label="Additional Information (Optional)"
              placeholder="Any additional information that supports your request..."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              disabled={isSubmitting}
            />
          </Box>
        </motion.div>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={handleClose} 
          disabled={isSubmitting}
          color="inherit"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting || success}
          startIcon={isSubmitting ? <LoadingSpinner type="circular" size="small" /> : <Send />}
          sx={{ minWidth: 120 }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ApprovalRequestForm