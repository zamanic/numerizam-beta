import React from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'
import { motion } from 'framer-motion'
import { styled, keyframes } from '@mui/material/styles'

// Keyframe animations
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.7; }
`

const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
  40%, 43% { transform: translateY(-30px); }
  70% { transform: translateY(-15px); }
  90% { transform: translateY(-4px); }
`

const wave = keyframes`
  0%, 60%, 100% { transform: initial; }
  30% { transform: translateY(-15px); }
`

// Styled components for different spinner types
const SpinnerContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(2),
}))

const DotsContainer = styled(Box)({
  display: 'flex',
  gap: '8px',
})

const Dot = styled(Box)<{ delay: number }>(({ theme, delay }) => ({
  width: 12,
  height: 12,
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  animation: `${bounce} 1.4s ease-in-out ${delay}s infinite both`,
}))

const WaveDot = styled(Box)<{ delay: number }>(({ theme, delay }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  animation: `${wave} 1.2s ease-in-out ${delay}s infinite`,
}))

const PulseCircle = styled(Box)(({ theme }) => ({
  width: 60,
  height: 60,
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  animation: `${pulse} 1.5s ease-in-out infinite`,
  opacity: 0.6,
}))

const SpinnerRing = styled(Box)(({ theme }) => ({
  width: 50,
  height: 50,
  border: `4px solid ${theme.palette.grey[200]}`,
  borderTop: `4px solid ${theme.palette.primary.main}`,
  borderRadius: '50%',
  animation: `${spin} 1s linear infinite`,
}))

const GradientSpinner = styled(Box)(({ theme }) => ({
  width: 50,
  height: 50,
  borderRadius: '50%',
  background: `conic-gradient(from 0deg, transparent, ${theme.palette.primary.main})`,
  animation: `${spin} 1s linear infinite`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '4px',
    left: '4px',
    right: '4px',
    bottom: '4px',
    borderRadius: '50%',
    backgroundColor: theme.palette.background.paper,
  },
  position: 'relative',
}))

export interface LoadingSpinnerProps {
  type?: 'circular' | 'dots' | 'wave' | 'pulse' | 'ring' | 'gradient'
  size?: 'small' | 'medium' | 'large'
  message?: string
  color?: 'primary' | 'secondary' | 'inherit'
  fullScreen?: boolean
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  type = 'circular',
  size = 'medium',
  message,
  color = 'primary',
  fullScreen = false,
}) => {
  const getSizeValue = () => {
    switch (size) {
      case 'small': return 30
      case 'large': return 60
      default: return 40
    }
  }

  const renderSpinner = () => {
    switch (type) {
      case 'dots':
        return (
          <DotsContainer>
            <Dot delay={0} />
            <Dot delay={0.1} />
            <Dot delay={0.2} />
          </DotsContainer>
        )
      
      case 'wave':
        return (
          <DotsContainer>
            {[0, 0.1, 0.2, 0.3, 0.4].map((delay, index) => (
              <WaveDot key={index} delay={delay} />
            ))}
          </DotsContainer>
        )
      
      case 'pulse':
        return <PulseCircle />
      
      case 'ring':
        return <SpinnerRing />
      
      case 'gradient':
        return <GradientSpinner />
      
      default:
        return (
          <CircularProgress 
            size={getSizeValue()} 
            color={color}
            thickness={4}
          />
        )
    }
  }

  const containerProps = fullScreen ? {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 9999,
  } : {
    padding: 2,
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <SpinnerContainer sx={containerProps}>
        {renderSpinner()}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <Typography 
              variant="body2" 
              color="textSecondary" 
              align="center"
              sx={{ mt: 1 }}
            >
              {message}
            </Typography>
          </motion.div>
        )}
      </SpinnerContainer>
    </motion.div>
  )
}

export default LoadingSpinner