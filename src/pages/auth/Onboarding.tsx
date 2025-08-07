import { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Box, Typography, Button, Paper, FormControl, InputLabel, Select, MenuItem, Alert } from '@mui/material'
import { motion } from 'framer-motion'

// Context
import { AuthContext, UserRole } from '../../context/AuthContext'

// Components
import LoadingSpinner from '../../components/LoadingSpinner'

const currencies = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'INR', name: 'Indian Rupee' },
  { code: 'BRL', name: 'Brazilian Real' },
  { code: 'MXN', name: 'Mexican Peso' },
]

const Onboarding = () => {
  const { user, completeOnboarding, isLoading, isAuthenticated } = useContext(AuthContext)
  const navigate = useNavigate()
  
  const [role, setRole] = useState<UserRole>('Accountant')
  const [currency, setCurrency] = useState('USD')
  const [error, setError] = useState('')

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isLoading, isAuthenticated, navigate])

  const handleSubmit = async () => {
    try {
      await completeOnboarding(role, currency)
      // Redirect happens in AuthContext
    } catch (err) {
      console.error('Onboarding error:', err)
      setError('Error completing setup. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <LoadingSpinner type="gradient" size="large" />
      </Container>
    )
  }

  return (
    <Container component="main" maxWidth="sm" sx={{ py: 8 }}>
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
          <Typography component="h1" variant="h5" sx={{ mb: 1 }}>
            Welcome to Numerizam!
          </Typography>
          
          <Typography variant="body1" color="textSecondary" sx={{ mb: 4, textAlign: 'center' }}>
            Let's set up your account for {user?.currentCompany?.name || 'your company'}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ width: '100%', mb: 4 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="role-label">Your Role</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                value={role}
                label="Your Role"
                onChange={(e) => setRole(e.target.value as UserRole)}
              >
                <MenuItem value="Viewer">Viewer (Read-only access)</MenuItem>
                <MenuItem value="Accountant">Accountant (Standard access)</MenuItem>
                <MenuItem value="Admin">Administrator (Full access)</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="currency-label">Primary Currency</InputLabel>
              <Select
                labelId="currency-label"
                id="currency"
                value={currency}
                label="Primary Currency"
                onChange={(e) => setCurrency(e.target.value)}
              >
                {currencies.map((curr) => (
                  <MenuItem key={curr.code} value={curr.code}>
                    {curr.code} - {curr.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleSubmit}
              disabled={isLoading}
              sx={{ py: 1.5, px: 4, borderRadius: 2 }}
            >
              {isLoading ? <LoadingSpinner type="circular" size="small" /> : 'Complete Setup'}
            </Button>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  )
}

export default Onboarding