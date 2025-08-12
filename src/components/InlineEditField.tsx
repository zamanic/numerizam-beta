import React, { useState, useEffect, useRef } from 'react'
import {
  TextField,
  Box,
  IconButton,
  Tooltip,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  InputAdornment,
} from '@mui/material'
import {
  Edit,
  Check,
  Close,
  Warning,
  CheckCircle,
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'

interface InlineEditFieldProps {
  value: string | number | null | undefined
  onSave: (value: string | number) => void
  onCancel?: () => void
  type?: 'text' | 'number' | 'select' | 'currency'
  options?: { value: string | number; label: string }[]
  placeholder?: string
  label?: string
  required?: boolean
  validation?: (value: string | number) => string | null
  disabled?: boolean
  multiline?: boolean
  rows?: number
  prefix?: string
  suffix?: string
  className?: string
  size?: 'small' | 'medium'
  fullWidth?: boolean
  autoFocus?: boolean
}

export const InlineEditField: React.FC<InlineEditFieldProps> = ({
  value,
  onSave,
  onCancel,
  type = 'text',
  options = [],
  placeholder,
  label,
  required = false,
  validation,
  disabled = false,
  multiline = false,
  rows = 1,
  prefix,
  suffix,
  className = '',
  size = 'small',
  fullWidth = true,
  autoFocus = true,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [isModified, setIsModified] = useState(false)
  const [isValidated, setIsValidated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const inputRef = useRef<any>(null)

  useEffect(() => {
    setEditValue(value || '')
    setIsModified(false)
    setIsValidated(false)
    setError(null)
  }, [value])

  useEffect(() => {
    if (isEditing && autoFocus && inputRef.current) {
      // Use setTimeout to ensure the TextField is fully rendered
      setTimeout(() => {
        if (inputRef.current) {
          // For Material-UI TextField, focus the component
          if (inputRef.current.focus) {
            inputRef.current.focus()
          }
          // Try to access the underlying input element for select
          const inputElement = inputRef.current.querySelector?.('input') || 
                              inputRef.current.getElementsByTagName?.('input')?.[0]
          if (inputElement && type === 'text' && inputElement.select) {
            inputElement.select()
          }
        }
      }, 0)
    }
  }, [isEditing, autoFocus, type])

  const handleEdit = () => {
    if (disabled) return
    setIsEditing(true)
    setEditValue(value || '')
    setIsModified(false)
    setError(null)
  }

  const handleSave = () => {
    // Validate if validation function is provided
    if (validation) {
      const validationError = validation(editValue)
      if (validationError) {
        setError(validationError)
        return
      }
    }

    // Check required field
    if (required && (!editValue || editValue.toString().trim() === '')) {
      setError('This field is required')
      return
    }

    onSave(editValue)
    setIsEditing(false)
    setIsModified(false)
    setIsValidated(true)
    setError(null)

    // Show validation indicator for 2 seconds
    setTimeout(() => {
      setIsValidated(false)
    }, 2000)
  }

  const handleCancel = () => {
    setEditValue(value || '')
    setIsEditing(false)
    setIsModified(false)
    setError(null)
    if (onCancel) {
      onCancel()
    }
  }

  const handleChange = (newValue: string | number) => {
    setEditValue(newValue)
    setIsModified(newValue !== (value || ''))
    setError(null)

    // Real-time validation
    if (validation) {
      const validationError = validation(newValue)
      setError(validationError)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !multiline) {
      event.preventDefault()
      handleSave()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      handleCancel()
    }
  }

  const formatDisplayValue = (val: string | number | null | undefined) => {
    // Handle null, undefined, or empty values
    if (val === null || val === undefined || val === '') {
      return '-'
    }
    
    if (type === 'currency' && typeof val === 'number') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(val)
    }
    
    return val.toString()
  }

  const getInputAdornment = () => {
    const adornments: any = {}
    
    if (prefix) {
      adornments.startAdornment = (
        <InputAdornment position="start">{prefix}</InputAdornment>
      )
    }
    
    if (suffix) {
      adornments.endAdornment = (
        <InputAdornment position="end">{suffix}</InputAdornment>
      )
    }
    
    if (type === 'currency' && !prefix) {
      adornments.startAdornment = (
        <InputAdornment position="start">$</InputAdornment>
      )
    }
    
    return adornments
  }

  if (isEditing) {
    return (
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className={`inline-edit-container ${className}`}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {label && (
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              {label}
            </Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            {type === 'select' ? (
              <FormControl size={size} fullWidth={fullWidth} error={!!error}>
                <Select
                  value={editValue}
                  onChange={(e) => handleChange(e.target.value)}
                  className={`${isModified ? 'modified-indicator' : ''} ${
                    error ? 'error-shake' : ''
                  }`}
                >
                  {options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <TextField
                ref={inputRef}
                value={editValue}
                onChange={(e) => handleChange(
                  type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
                )}
                onKeyDown={handleKeyDown}
                type={type === 'currency' ? 'number' : type}
                placeholder={placeholder}
                size={size}
                fullWidth={fullWidth}
                multiline={multiline}
                rows={rows}
                error={!!error}
                helperText={error}
                disabled={disabled}
                InputProps={getInputAdornment()}
                className={`edit-mode ${isModified ? 'modified-indicator' : ''} ${
                  error ? 'error-shake' : ''
                }`}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.edit-mode': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1E40AF',
                        borderWidth: '2px',
                        boxShadow: '0 0 0 3px rgba(30, 64, 175, 0.1)',
                      },
                    },
                  },
                }}
              />
            )}
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Tooltip title="Save changes">
                <IconButton
                  size="small"
                  onClick={handleSave}
                  color="primary"
                  disabled={!!error}
                  className="hover-lift"
                >
                  <Check fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Cancel changes">
                <IconButton
                  size="small"
                  onClick={handleCancel}
                  color="default"
                  className="hover-lift"
                >
                  <Close fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Typography
              variant="caption"
              color="error"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}
            >
              <Warning fontSize="small" />
              {error}
            </Typography>
          </motion.div>
        )}
      </motion.div>
    )
  }

  return (
    <Box
      className={`inline-display-container ${className} hover-lift`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={handleEdit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        padding: '8px 12px',
        borderRadius: 1,
        cursor: disabled ? 'default' : 'pointer',
        backgroundColor: isHovered && !disabled ? 'rgba(30, 64, 175, 0.04)' : 'transparent',
        transition: 'all 0.2s ease-in-out',
        position: 'relative',
        minHeight: '40px',
        border: '1px solid transparent',
        '&:hover': {
          borderColor: disabled ? 'transparent' : 'rgba(30, 64, 175, 0.2)',
        },
      }}
    >
      {label && (
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
          {label}
        </Typography>
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography
          variant="body2"
          sx={{
            flex: 1,
            fontFamily: type === 'number' || type === 'currency' ? 'monospace' : 'inherit',
            color: disabled ? 'text.disabled' : 'text.primary',
          }}
        >
          {formatDisplayValue(value)}
        </Typography>
        
        <AnimatePresence>
          {isValidated && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="success-bounce"
            >
              <Chip
                icon={<CheckCircle />}
                label="Saved"
                size="small"
                color="success"
                variant="outlined"
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {isHovered && !disabled && !isValidated && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Tooltip title="Double-click to edit">
              <IconButton size="small" onClick={handleEdit} className="hover-lift">
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
          </motion.div>
        )}
        
        {isModified && (
          <Box className="modified-indicator" />
        )}
      </Box>
    </Box>
  )
}

export default InlineEditField