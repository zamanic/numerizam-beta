import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const Unauthorized = () => {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    // Automatically redirect to root page after 5 seconds
    const redirectTimer = setTimeout(() => {
      navigate('/')
    }, 5000)

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown(prev => prev - 1)
    }, 1000)

    // Clean up timers on component unmount
    return () => {
      clearTimeout(redirectTimer)
      clearInterval(countdownInterval)
    }
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </p>
          <p className="text-sm text-amber-600 mb-4">
            Redirecting to home page in {countdown} seconds...
          </p>
          
          <div className="space-y-3">
            <Link
              to="/app"
              className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
            >
              Go to Dashboard
            </Link>
            <Link
              to="/login"
              className="block w-full text-gray-600 py-2 px-4 rounded-lg font-medium hover:text-gray-800 transition-colors text-center"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Unauthorized