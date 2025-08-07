import { useState, useContext, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { styled } from '@mui/material/styles'
import { Box, AppBar, Toolbar, IconButton, Typography, Drawer, List, Divider, ListItem, ListItemIcon, ListItemText, Avatar, Menu, MenuItem, Tooltip, useMediaQuery, useTheme } from '@mui/material'
import { Menu as MenuIcon, Dashboard, QueryStats, AdminPanelSettings, ChevronLeft, Logout, Settings, Person, Search, DocumentScanner, Psychology } from '@mui/icons-material'
import { motion } from 'framer-motion'

// Context
import { AuthContext } from '../context/AuthContext'
import { ThemeContext } from '../context/ThemeContext'

// Components
import CommandPalette from '../components/CommandPalette'
import DateRangeSelector from '../components/DateRangeSelector'
import NotificationBadge from '../components/NotificationBadge'
import LoadingSpinner from '../components/LoadingSpinner'

// Services
import { numerizamAuthService } from '../services/numerizamAuthService'

// Hooks
import { useRouteTransition } from '../hooks/useRouteTransition'

const drawerWidth = 240

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open: boolean
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}))

const AppBarStyled = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' })<{
  open: boolean
}>(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  zIndex: theme.zIndex.drawer + 1,
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}))

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}))

const MainLayout = () => {
  const { user, logout } = useContext(AuthContext)
  const { darkMode, toggleTheme } = useContext(ThemeContext)
  const navigate = useNavigate()
  const { navigateWithLoading } = useRouteTransition()
  const [open, setOpen] = useState(true)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [pendingUsersCount, setPendingUsersCount] = useState(0)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // Close drawer on mobile by default
  useEffect(() => {
    if (isMobile) {
      setOpen(false)
    }
  }, [isMobile])

  // Load pending users count for admin notification
  useEffect(() => {
    const loadPendingUsersCount = async () => {
      if (user?.role === 'Admin') {
        try {
          const { users, error } = await numerizamAuthService.getAllUsers()
          if (!error && users) {
            const pendingCount = users.filter(user => !user.is_approved).length
            setPendingUsersCount(pendingCount)
          }
        } catch (err) {
          console.error('Failed to load pending users count:', err)
        }
      }
    }

    loadPendingUsersCount()
    
    // Refresh count every 30 seconds
    const interval = setInterval(loadPendingUsersCount, 30000)
    return () => clearInterval(interval)
  }, [user?.role])

  const handleDrawerOpen = () => {
    setOpen(true)
  }

  const handleDrawerClose = () => {
    setOpen(false)
  }

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    handleClose()
    logout()
  }

  const toggleCommandPalette = () => {
    setCommandPaletteOpen(!commandPaletteOpen)
  }

  const handleNotificationClick = () => {
    navigateWithLoading('/app/admin-dashboard', 'Loading User Approvals...')
  }

  // Keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        toggleCommandPalette()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      {/* Command Palette */}
      <CommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />

      {/* Top AppBar */}
      <AppBarStyled position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 0, display: { xs: 'none', sm: 'block' } }}>
            Numerizam
          </Typography>

          {/* Command Palette Button */}
          <Tooltip title="Command Palette (Ctrl+K)">
            <IconButton
              color="inherit"
              onClick={toggleCommandPalette}
              sx={{ ml: 2, border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: 1 }}
            >
              <Search fontSize="small" sx={{ mr: 1 }} />
              <Typography variant="body2" sx={{ mr: 1, display: { xs: 'none', md: 'block' } }}>
                Search...
              </Typography>
              <Box
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '4px',
                  px: 0.5,
                  py: 0.2,
                  fontSize: '0.65rem',
                }}
              >
                ⌘K
              </Box>
            </IconButton>
          </Tooltip>

          {/* Date Range Selector */}
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <DateRangeSelector />
          </Box>

          {/* Admin Notification Badge */}
          {user?.role === 'Admin' && (
            <Box sx={{ mr: 2 }}>
              <NotificationBadge
                count={pendingUsersCount}
                onClick={handleNotificationClick}
                tooltip="Pending accountant approvals"
                color="error"
                animate={true}
              />
            </Box>
          )}

          {/* User Menu */}
          <Box>
            <Tooltip title="Account settings">
              <IconButton onClick={handleMenu} color="inherit">
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                  {user?.name?.charAt(0) || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem sx={{ pointerEvents: 'none', opacity: 0.7 }}>
                <Typography variant="body2">{user?.currentCompany?.name}</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleClose}>
                <ListItemIcon>
                  <Person fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>
              <MenuItem onClick={toggleTheme}>
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBarStyled>

      {/* Sidebar */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            zIndex: (theme) => theme.zIndex.drawer,
          },
        }}
        variant={isMobile ? 'temporary' : 'persistent'}
        anchor="left"
        open={open}
        onClose={handleDrawerClose}
      >
        <DrawerHeader>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
            Numerizam
          </Typography>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeft />
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          <ListItem button onClick={() => navigateWithLoading('/app', 'Loading Dashboard...')}>
            <ListItemIcon>
              <Dashboard />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button onClick={() => navigateWithLoading('/app/query', 'Loading AI Query...')}>
            <ListItemIcon>
              <QueryStats />
            </ListItemIcon>
            <ListItemText primary="AI Query" />
          </ListItem>
          <ListItem button onClick={() => navigateWithLoading('/app/ai', 'Loading AI Assistant...')}>
            <ListItemIcon>
              <Psychology />
            </ListItemIcon>
            <ListItemText primary="AI Assistant" />
          </ListItem>
          <ListItem button onClick={() => navigateWithLoading('/app/ocr', 'Loading OCR Upload...')}>
            <ListItemIcon>
              <DocumentScanner />
            </ListItemIcon>
            <ListItemText primary="OCR Upload" />
          </ListItem>
          {user?.role === 'Admin' && (
            <>
              <ListItem button onClick={() => navigateWithLoading('/app/admin', 'Loading Admin Panel...')}>
                <ListItemIcon>
                  <AdminPanelSettings />
                </ListItemIcon>
                <ListItemText primary="Admin Panel" />
              </ListItem>
              <ListItem button onClick={() => navigateWithLoading('/app/admin-dashboard', 'Loading User Approvals...')}>
                <ListItemIcon>
                  <Person />
                </ListItemIcon>
                <ListItemText primary="User Approvals" />
                {pendingUsersCount > 0 && (
                  <Box sx={{ ml: 1 }}>
                    <NotificationBadge
                      count={pendingUsersCount}
                      size="small"
                      color="error"
                      animate={false}
                    />
                  </Box>
                )}
              </ListItem>
            </>
          )}
        </List>
      </Drawer>

      {/* Main Content */}
      <Main open={open}>
        <DrawerHeader />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          style={{ height: '100%' }}
        >
          <Outlet />
        </motion.div>
      </Main>
    </Box>
  )
}

export default MainLayout