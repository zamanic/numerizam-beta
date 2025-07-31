import { useState, useContext } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { Container, Box, Typography, TextField, Button, Paper, Link, IconButton, InputAdornment, CircularProgress, Alert, Stepper, Step, StepLabel } from '@mui/material'
import { Visibility, VisibilityOff, Brightness4, Brightness7, ArrowBack } from '@mui/icons-material'
import { motion } from 'framer-motion'

// Context
import { ThemeContext } from '../../context/ThemeContext'
import { supabase } from '../../services/supabase'

const Signup = () => {
  const { darkMode, toggleTheme } = useContext(ThemeContext)
  const navigate = useNavigate()
  
  const [activeStep, setActiveStep] = useState(0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [country, setCountry] = useState('')
  const [region, setRegion] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            company_name: companyName,
            country,
            region
          }
        }
      })

      if (error) {
        setError(error.message)
      } else if (data.user) {
        setSuccess(true)
        // Show success message and redirect after a delay
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Account created successfully! Please check your email to confirm your account before signing in.' 
            }
          })
        }, 3000)
      }
    } catch (err) {
      console.error('Signup error:', err)
      setError('Error creating account. Please try again.')
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

          {success && (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              Account created successfully! Please check your email to confirm your account. You will be redirected to the login page shortly.
            </Alert>
          )}

          <Box sx={{ width: '100%' }}>
            {activeStep === 0 ? (
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
                  <CircularProgress size={24} />
                ) : activeStep === steps.length - 1 ? (
                  'Create Account'
                ) : (
                  'Next'
                )}
              </Button>
            </Box>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  )
}

export default Signup