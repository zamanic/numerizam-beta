import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AnimatePresence } from 'framer-motion'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import 'react-toastify/dist/ReactToastify.css'

// Import proper theme system
import { getTheme } from './styles/theme'

// Layouts
import MainLayout from './layouts/MainLayout'

// Components
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import PublicDashboard from './pages/PublicDashboard'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import ResetPassword from './pages/auth/ResetPassword'
import RequestReset from './pages/auth/RequestReset'
import Onboarding from './pages/auth/Onboarding'
import AccountantDashboard from './pages/AccountantDashboard'
import QueryPage from './pages/QueryPage'
import AdminPanel from './pages/AdminPanel'
import AdminDashboard from './pages/AdminDashboard'
import OCRUpload from './pages/OCRUpload'
import AIAssistant from './pages/AIAssistant'
import Unauthorized from './pages/Unauthorized'

// Context
import { ThemeContext } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { RouteLoadingProvider } from './context/RouteLoadingContext'

// Components
import RouteLoadingOverlay from './components/RouteLoadingOverlay'

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const location = useLocation()

  // Create QueryClient instance
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  })

  // Check for saved theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      setDarkMode(true)
      document.body.classList.add('dark-mode')
    }
  }, [])

  // Toggle theme function
  const toggleTheme = () => {
    setDarkMode(!darkMode)
    if (!darkMode) {
      document.body.classList.add('dark-mode')
      localStorage.setItem('theme', 'dark')
    } else {
      document.body.classList.remove('dark-mode')
      localStorage.setItem('theme', 'light')
    }
  }

  // Create MUI theme based on dark mode state using proper theme system
  const theme = getTheme(darkMode ? 'dark' : 'light')

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <RouteLoadingProvider>
              <RouteLoadingOverlay />
              <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
              {/* Public routes */}
              <Route path="/" element={<PublicDashboard />} />
              <Route path="/demo" element={<QueryPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/request-reset" element={<RequestReset />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Protected routes */}
              <Route path="/app" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route index element={<AccountantDashboard />} />
                <Route path="query" element={<QueryPage />} />
                <Route path="ocr" element={<OCRUpload />} />
                <Route path="ai" element={<AIAssistant />} />
                
                {/* Admin-only routes */}
                <Route path="admin" element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <AdminPanel />
                  </ProtectedRoute>
                } />
                <Route path="admin-dashboard" element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                
                {/* Accountant and Admin routes */}
                <Route path="accountant" element={
                  <ProtectedRoute allowedRoles={['Admin', 'Accountant']}>
                    <div className="p-6">
                      <h1 className="text-2xl font-bold text-gray-900 mb-4">Accountant Panel</h1>
                      <p className="text-gray-600">Welcome to the accountant dashboard. This area is restricted to accountants and administrators.</p>
                    </div>
                  </ProtectedRoute>
                } />
                
                {/* Viewer routes */}
                <Route path="viewer" element={
                  <ProtectedRoute allowedRoles={['Admin', 'Accountant', 'Viewer']}>
                    <div className="p-6">
                      <h1 className="text-2xl font-bold text-gray-900 mb-4">Viewer Panel</h1>
                      <p className="text-gray-600">Welcome to the viewer dashboard. You have read-only access to financial data.</p>
                    </div>
                  </ProtectedRoute>
                } />
                
                {/* Auditor routes */}
                <Route path="auditor" element={
                  <ProtectedRoute allowedRoles={['Admin', 'Auditor']}>
                    <div className="p-6">
                      <h1 className="text-2xl font-bold text-gray-900 mb-4">Auditor Panel</h1>
                      <p className="text-gray-600">Welcome to the auditor dashboard. You have access to audit trails and compliance reports.</p>
                    </div>
                  </ProtectedRoute>
                } />
                
                {/* Investor routes */}
                <Route path="investor" element={
                  <ProtectedRoute allowedRoles={['Admin', 'Investor']}>
                    <div className="p-6">
                      <h1 className="text-2xl font-bold text-gray-900 mb-4">Investor Panel</h1>
                      <p className="text-gray-600">Welcome to the investor dashboard. You have access to financial reports and analytics.</p>
                    </div>
                  </ProtectedRoute>
                } />
              </Route>
              </Routes>
            </AnimatePresence>
          </RouteLoadingProvider>
        </AuthProvider>
      </ThemeProvider>
    </ThemeContext.Provider>
  </QueryClientProvider>
  )
}

export default App