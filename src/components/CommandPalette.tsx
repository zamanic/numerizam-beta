import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogContent, TextField, List, ListItem, ListItemIcon, ListItemText, Typography, Box } from '@mui/material'
import { Dashboard, QueryStats, AdminPanelSettings, Search, Receipt, TrendingUp, AccountBalance, DocumentScanner, Person } from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouteTransition } from '../hooks/useRouteTransition'

type CommandItem = {
  id: string
  title: string
  description: string
  icon: JSX.Element
  action: () => void
  category: 'navigation' | 'reports' | 'transactions'
}

type CommandPaletteProps = {
  open: boolean
  onClose: () => void
}

const CommandPalette = ({ open, onClose }: CommandPaletteProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { navigateWithLoading } = useRouteTransition()

  // Reset search and selection when opened
  useEffect(() => {
    if (open) {
      setSearchTerm('')
      setSelectedIndex(0)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [open])

  // Command items
  const commands: CommandItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Go to main dashboard',
      icon: <Dashboard />,
      action: () => {
        navigateWithLoading('/app', 'Loading Dashboard...')
        onClose()
      },
      category: 'navigation',
    },
    {
      id: 'query',
      title: 'AI Query',
      description: 'Ask questions about your finances',
      icon: <QueryStats />,
      action: () => {
        navigateWithLoading('/app/query', 'Loading AI Query...')
        onClose()
      },
      category: 'navigation',
    },
    {
      id: 'ocr',
      title: 'OCR Upload',
      description: 'Upload and process receipts and invoices',
      icon: <DocumentScanner />,
      action: () => {
        navigateWithLoading('/app/ocr', 'Loading OCR Upload...')
        onClose()
      },
      category: 'navigation',
    },
    {
      id: 'admin',
      title: 'Admin Panel',
      description: 'Manage users and settings',
      icon: <AdminPanelSettings />,
      action: () => {
        navigateWithLoading('/app/admin', 'Loading Admin Panel...')
        onClose()
      },
      category: 'navigation',
    },
    {
      id: 'admin-dashboard',
      title: 'User Approvals',
      description: 'Approve pending accountant registrations',
      icon: <Person />,
      action: () => {
        navigateWithLoading('/app/admin-dashboard', 'Loading User Approvals...')
        onClose()
      },
      category: 'navigation',
    },
    {
      id: 'profit-loss',
      title: 'Profit & Loss',
      description: 'View profit and loss report',
      icon: <TrendingUp />,
      action: () => {
        // In a real app, this would navigate to the report
        alert('Navigating to Profit & Loss Report')
        onClose()
      },
      category: 'reports',
    },
    {
      id: 'balance-sheet',
      title: 'Balance Sheet',
      description: 'View balance sheet report',
      icon: <AccountBalance />,
      action: () => {
        // In a real app, this would navigate to the report
        alert('Navigating to Balance Sheet Report')
        onClose()
      },
      category: 'reports',
    },
    {
      id: 'recent-transactions',
      title: 'Recent Transactions',
      description: 'View recent transactions',
      icon: <Receipt />,
      action: () => {
        // In a real app, this would navigate to transactions
        alert('Navigating to Recent Transactions')
        onClose()
      },
      category: 'transactions',
    },
  ]

  // Filter commands based on search term
  const filteredCommands = commands.filter(
    (command) =>
      command.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      command.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Group commands by category
  const groupedCommands = filteredCommands.reduce<Record<string, CommandItem[]>>(
    (acc, command) => {
      if (!acc[command.category]) {
        acc[command.category] = []
      }
      acc[command.category].push(command)
      return acc
    },
    {}
  )

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prevIndex) => (prevIndex + 1) % filteredCommands.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prevIndex) => (prevIndex - 1 + filteredCommands.length) % filteredCommands.length)
        break
      case 'Enter':
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action()
        }
        break
      case 'Escape':
        onClose()
        break
      default:
        break
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          maxHeight: '70vh',
        },
      }}
    >
      <Box sx={{ p: 2, pb: 0 }}>
        <TextField
          inputRef={inputRef}
          autoFocus
          fullWidth
          placeholder="Search commands, reports, or transactions..."
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          InputProps={{
            startAdornment: <Search color="action" sx={{ mr: 1 }} />,
            sx: { borderRadius: 2 },
          }}
        />
      </Box>
      <DialogContent sx={{ pb: 2, pt: 1 }}>
        <AnimatePresence>
          {Object.entries(groupedCommands).length > 0 ? (
            Object.entries(groupedCommands).map(([category, items]) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Typography
                  variant="overline"
                  color="textSecondary"
                  sx={{ display: 'block', mt: 2, mb: 1, ml: 2 }}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Typography>
                <List disablePadding>
                  {items.map((command, _index) => {
                    const commandIndex = filteredCommands.findIndex((c) => c.id === command.id)
                    const isSelected = commandIndex === selectedIndex

                    return (
                      <ListItem
                        key={command.id}
                        component="button"
                        selected={isSelected}
                        onClick={command.action}
                        sx={{
                          borderRadius: 1,
                          mb: 0.5,
                          transition: 'all 0.2s',
                          border: 'none',
                          background: 'transparent',
                          width: '100%',
                          textAlign: 'left',
                          cursor: 'pointer',
                          '&.Mui-selected': {
                            backgroundColor: (theme) =>
                              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>{command.icon}</ListItemIcon>
                        <ListItemText
                          primary={command.title}
                          secondary={command.description}
                          primaryTypographyProps={{ fontWeight: isSelected ? 'bold' : 'normal' }}
                        />
                      </ListItem>
                    )
                  })}
                </List>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ textAlign: 'center', padding: '2rem 0' }}
            >
              <Typography color="textSecondary">No results found</Typography>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

export default CommandPalette