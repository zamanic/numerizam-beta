import { useState, useContext } from 'react'
import { useLocation, Link as RouterLink } from 'react-router-dom'
import { Container, Box, Typography, TextField, Button, Paper, Link, IconButton, InputAdornment, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material'
import { Visibility, VisibilityOff, Brightness4, Brightness7 } from '@mui/icons-material'
import { motion } from 'framer-motion'

// Context
import { AuthContext } from '../../context/AuthContext'
import { ThemeContext } from '../../context/ThemeContext'
import { numerizamAuthService } from '../../services/numerizamAuthService'

const Login = () => {
  const { login, isLoading } = useContext(AuthContext)
  const { darkMode, toggleTheme } = useContext(ThemeContext)
  const location = useLocation()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  
  // Password reset states
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [resetError, setResetError] = useState('')

  // Check if coming from demo link
  const isDemo = new URLSearchParams(location.search).get('demo') === 'true'
  
  // Check for success message from password reset
  const successMessage = location.state?.message

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await login(email, password)
    } catch (err) {
      console.error('Login error:', err)
      setError('Invalid email or password')
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  const handleDemoLogin = async () => {
    try {
      await login('demo@numerizam.com', 'demo123')
    } catch (err) {
      console.error('Demo login error:', err)
      setError('Error accessing demo account')
    }
  }

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      setResetError('Please enter your email address')
      return
    }

    setResetLoading(true)
    setResetError('')

    try {
      const { success, error } = await numerizamAuthService.resetPasswordForEmail(resetEmail)

      if (error) {
        setResetError(error)
      } else if (success) {
        setResetSuccess(true)
      }
    } catch (err) {
      setResetError('An unexpected error occurred. Please try again.')
    } finally {
      setResetLoading(false)
    }
  }

  const handleResetDialogClose = () => {
    setResetDialogOpen(false)
    setResetEmail('')
    setResetError('')
    setResetSuccess(false)
    setResetLoading(false)
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
            Welcome to Numerizam
          </Typography>

          {isDemo && (
            <Alert severity="info" sx={{ mb: 3, width: '100%' }}>
              You're viewing the demo. Click "Access Demo" to explore the platform.
            </Alert>
          )}

          {successMessage && (
            <Alert severity="success" sx={{ mb: 3, width: '100%' }}>
              {successMessage}
            </Alert>
          )}

          {error && (
            <motion.div
              animate={{ x: shake ? [-10, 10, -10, 10, 0] : 0 }}
              transition={{ duration: 0.4 }}
              style={{ width: '100%', marginBottom: '16px' }}
            >
              <Alert severity="error" sx={{ width: '100%' }}>
                {error}
              </Alert>
            </motion.div>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
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
              autoComplete="current-password"
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

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2 }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>

            {isDemo && (
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                onClick={handleDemoLogin}
                sx={{ mb: 2, py: 1.5, borderRadius: 2 }}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Access Demo'}
              </Button>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Link component={RouterLink} to="/signup" variant="body2">
                Don't have an account? Sign Up
              </Link>
              <Link component={RouterLink} to="/" variant="body2">
                Back to Home
              </Link>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Link
                component="button"
                variant="body2"
                onClick={() => setResetDialogOpen(true)}
                sx={{ cursor: 'pointer' }}
              >
                Forgot your password?
              </Link>
            </Box>
          </Box>

          {/* Password Reset Dialog */}
          <Dialog open={resetDialogOpen} onClose={handleResetDialogClose} maxWidth="sm" fullWidth>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogContent>
              {resetSuccess ? (
                <Alert severity="success" sx={{ mt: 1 }}>
                  Password reset email sent! Please check your inbox and follow the instructions to reset your password.
                </Alert>
              ) : (
                <>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2, mt: 1 }}>
                    Enter your email address and we'll send you a link to reset your password.
                  </Typography>
                  
                  {resetError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {resetError}
                    </Alert>
                  )}

                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    margin="normal"
                    disabled={resetLoading}
                  />
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleResetDialogClose} disabled={resetLoading}>
                {resetSuccess ? 'Close' : 'Cancel'}
              </Button>
              {!resetSuccess && (
                <Button
                  onClick={handlePasswordReset}
                  variant="contained"
                  disabled={resetLoading}
                >
                  {resetLoading ? <CircularProgress size={20} /> : 'Send Reset Email'}
                </Button>
              )}
            </DialogActions>
          </Dialog>
        </Paper>
      </motion.div>
    </Container>
  )
}

export default Login