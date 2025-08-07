import React, { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  IconButton,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  ArrowBack,
  Brightness4,
  Brightness7,
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { numerizamAuthService } from '../../services/numerizamAuthService'
import { useTheme } from '../../context/ThemeContext'
import LoadingSpinner from '../../components/LoadingSpinner'
import ApprovalRequestForm from '../../components/ApprovalRequestForm'

const Signup = () => {
  const navigate = useNavigate()
  const { darkMode, toggleTheme } = useTheme()
  
  const [activeStep, setActiveStep] = useState(0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [country, setCountry] = useState('')
  const [region, setRegion] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showApprovalForm, setShowApprovalForm] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const steps = ['Account Details', 'Personal Information', 'Company Information']

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate first step - Account Details
      if (!email || !password || !confirmPassword) {
        setError('Please fill in all fields')
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters')
        return
      }
      setError('')
      setActiveStep(1)
    } else if (activeStep === 1) {
      // Validate second step - Personal Information
      if (!name || !country || !region) {
        setError('Please fill in all fields')
        return
      }
      setError('')
      setActiveStep(2)
    } else {
      // Final step - submit
      handleSubmit()
    }
  }

  const handleBack = () => {
    setActiveStep(activeStep - 1)
    setError('')
  }

  const handleSubmit = async () => {
    if (!companyName) {
      setError('Please enter your company name')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      const { data, error } = await numerizamAuthService.register({
        email,
        password,
        name,
        companyName,
        country,
        region,
      })

      if (error) {
        setError(error)
      } else {
        setSuccess(true)
        if (data?.user?.id) {
          setUserId(data.user.id)
          // Show approval form instead of redirecting immediately
          setTimeout(() => {
            setShowApprovalForm(true)
          }, 2000)
        } else {
          // Fallback: redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login')
          }, 3000)
        }
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container component="main" maxWidth="xs" sx={{ py: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
          }}
        >
          <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
            <IconButton onClick={toggleTheme} size="small">
              {darkMode ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
            </IconButton>
          </Box>

          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Create Your Account
          </Typography>

          <Stepper activeStep={activeStep} sx={{ width: '100%', mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && !showApprovalForm && (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              Account created successfully! Please check your email to confirm your account. 
              {userId ? ' Next, you can request approval to become an accountant.' : ' You will be redirected to the login page shortly.'}
            </Alert>
          )}

          <Box sx={{ width: '100%' }}>
            {showApprovalForm && userId ? (
              <ApprovalRequestForm 
                userId={userId}
                userEmail={email}
                userName={name}
                companyName={companyName}
                onSuccess={() => {
                  setTimeout(() => {
                    navigate('/login', {
                      state: {
                        message: 'Approval request submitted successfully! Please wait for admin approval before signing in.'
                      }
                    })
                  }, 2000)
                }}
                onSkip={() => {
                  navigate('/login', {
                    state: {
                      message: 'Account created successfully! You can request approval later from your profile.'
                    }
                  })
                }}
              />
            ) : activeStep === 0 ? (
              // Step 1: Account Details
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </motion.div>
            ) : activeStep === 1 ? (
              // Step 2: Personal Information
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  autoComplete="name"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  helperText="Your full name as an accountant"
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="country"
                  label="Country"
                  name="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  helperText="Country where your company operates"
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="region"
                  label="Region"
                  name="region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  helperText="Geographic region (e.g., Asia, Europe, North America)"
                />
              </motion.div>
            ) : (
              // Step 3: Company Information
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="companyName"
                  label="Company Name"
                  name="companyName"
                  autoFocus
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  helperText="This will be your primary company for accounting"
                />
              </motion.div>
            )}

            {!showApprovalForm && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                {activeStep > 0 ? (
                  <Button onClick={handleBack} startIcon={<ArrowBack />}>
                    Back
                  </Button>
                ) : (
                  <Link component={RouterLink} to="/login" variant="body2">
                    Already have an account? Sign in
                  </Link>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  disabled={isLoading}
                  sx={{ py: 1, px: 3, borderRadius: 2 }}
                >
                  {isLoading ? (
                    <LoadingSpinner type="circular" size="small" />
                  ) : activeStep === steps.length - 1 ? (
                    'Create Account'
                  ) : (
                    'Next'
                  )}
                </Button>
              </Box>
            )}
          </Box>
        </Paper>
      </motion.div>
    </Container>
  )
}

export default Signup