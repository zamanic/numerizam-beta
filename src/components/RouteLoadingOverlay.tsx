import React from 'react'
import { Box, Typography, Fade, Backdrop } from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import { styled } from '@mui/material/styles'
import LoadingSpinner from './LoadingSpinner'
import { useRouteLoading } from '../context/RouteLoadingContext'

const LoadingOverlay = styled(Backdrop)(({ theme }) => ({
  zIndex: theme.zIndex.modal + 1,
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(2),
  },
}))

const LoadingContainer = styled(motion.div)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(10px)',
  minWidth: '200px',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
    minWidth: '180px',
  },
}))

const ProgressBar = styled(motion.div)(({ theme }) => ({
  width: '100%',
  height: '3px',
  backgroundColor: theme.palette.grey[200],
  borderRadius: '2px',
  overflow: 'hidden',
  marginTop: theme.spacing(2),
}))

const ProgressFill = styled(motion.div)(({ theme }) => ({
  height: '100%',
  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
  borderRadius: '2px',
}))

const RouteLoadingOverlay: React.FC = () => {
  const { isLoading, loadingMessage } = useRouteLoading()

  return (
    <AnimatePresence>
      {isLoading && (
        <LoadingOverlay open={isLoading}>
          <LoadingContainer
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ 
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1]
            }}
          >
            {/* Modern gradient spinner */}
            <LoadingSpinner 
              type="gradient" 
              size="large"
            />
            
            {/* Loading message with animation */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <Typography 
                variant="h6" 
                color="primary"
                align="center"
                sx={{ 
                  fontWeight: 600,
                  fontSize: { xs: '1rem', sm: '1.25rem' }
                }}
              >
                {loadingMessage}
              </Typography>
            </motion.div>

            {/* Animated progress bar */}
            <ProgressBar
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <ProgressFill
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ 
                  duration: 0.8,
                  ease: 'easeInOut',
                  repeat: Infinity,
                  repeatType: 'reverse'
                }}
              />
            </ProgressBar>

            {/* Subtle pulsing dots */}
            <motion.div
              style={{ 
                display: 'flex', 
                gap: '6px',
                marginTop: '8px'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#3f51b5',
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: index * 0.2,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </motion.div>
          </LoadingContainer>
        </LoadingOverlay>
      )}
    </AnimatePresence>
  )
}

export default RouteLoadingOverlay