import React from 'react'
import { Badge, IconButton, Tooltip } from '@mui/material'
import { Notifications, NotificationsActive } from '@mui/icons-material'
import { motion } from 'framer-motion'
import { styled } from '@mui/material/styles'

const AnimatedBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    fontWeight: 'bold',
    fontSize: '0.75rem',
    minWidth: '20px',
    height: '20px',
    borderRadius: '10px',
    border: `2px solid ${theme.palette.background.paper}`,
    boxShadow: theme.shadows[2],
  },
}))

const PulsingIconButton = styled(IconButton)(({ theme }) => ({
  '&.pulsing': {
    animation: 'pulse 2s infinite',
  },
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)',
      boxShadow: `0 0 0 0 ${theme.palette.primary.main}40`,
    },
    '70%': {
      transform: 'scale(1.05)',
      boxShadow: `0 0 0 10px ${theme.palette.primary.main}00`,
    },
    '100%': {
      transform: 'scale(1)',
      boxShadow: `0 0 0 0 ${theme.palette.primary.main}00`,
    },
  },
}))

export interface NotificationBadgeProps {
  count: number
  onClick?: () => void
  tooltip?: string
  maxCount?: number
  showZero?: boolean
  animate?: boolean
  size?: 'small' | 'medium' | 'large'
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  onClick,
  tooltip = 'Notifications',
  maxCount = 99,
  showZero = false,
  animate = true,
  size = 'medium',
  color = 'error',
}) => {
  const displayCount = count > maxCount ? `${maxCount}+` : count.toString()
  const hasNotifications = count > 0
  const shouldShowBadge = hasNotifications || showZero

  const getIconSize = () => {
    switch (size) {
      case 'small': return 'small' as const
      case 'large': return 'large' as const
      default: return 'medium' as const
    }
  }

  const badgeContent = shouldShowBadge ? displayCount : undefined

  return (
    <Tooltip title={`${tooltip} (${count})`} arrow>
      <motion.div
        initial={animate ? { scale: 0.8, opacity: 0 } : undefined}
        animate={animate ? { scale: 1, opacity: 1 } : undefined}
        whileHover={animate ? { scale: 1.05 } : undefined}
        whileTap={animate ? { scale: 0.95 } : undefined}
        transition={{ duration: 0.2 }}
      >
        <AnimatedBadge
          badgeContent={badgeContent}
          color={color}
          overlap="circular"
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          sx={{
            '& .MuiBadge-badge': {
              animation: hasNotifications && animate ? 'bounce 0.6s ease-in-out' : 'none',
              '@keyframes bounce': {
                '0%, 20%, 53%, 80%, 100%': {
                  transform: 'translate(50%, -50%) scale(1)',
                },
                '40%, 43%': {
                  transform: 'translate(50%, -50%) scale(1.2)',
                },
                '70%': {
                  transform: 'translate(50%, -50%) scale(1.1)',
                },
                '90%': {
                  transform: 'translate(50%, -50%) scale(1.05)',
                },
              },
            },
          }}
        >
          <PulsingIconButton
            onClick={onClick}
            size={getIconSize()}
            className={hasNotifications && animate ? 'pulsing' : ''}
            sx={{
              color: hasNotifications ? 'primary.main' : 'text.secondary',
              transition: 'color 0.3s ease',
            }}
          >
            {hasNotifications ? (
              <NotificationsActive />
            ) : (
              <Notifications />
            )}
          </PulsingIconButton>
        </AnimatedBadge>
      </motion.div>
    </Tooltip>
  )
}

export default NotificationBadge