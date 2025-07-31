import { useState, useRef, useEffect, useContext } from 'react'
import { Box, Typography, Paper, Grid, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress, Divider, InputAdornment, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Alert } from '@mui/material'
import { Send, Close, Check, CalendarToday, Search, ArrowForward, Save, Info } from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers'

// Import AI utilities and new services
import AccountingTable from '../components/AccountingTable'
import { saveReportResults } from '../services/langGraphSaveAPI'
import { transactionProcessingService } from '../services/transactionProcessingService'
import { supabaseAccountingService } from '../services/supabaseAccountingService'
import { AuthContext } from '../context/AuthContext'

// Types
type Transaction = {
  id: string
  date: Date
  description: string
  amount: number
  type: 'debit' | 'credit'
  account: string
  category: string
}

type JournalEntry = {
  id: string
  date: Date
  description: string
  entries: {
    account: string
    debit?: number
    credit?: number
  }[]
}

// Initial mock data (will be replaced by AI-generated transactions)
const initialTransactions: Transaction[] = [
  {
    id: 't1',
    date: new Date(2023, 5, 15),
    description: 'Client payment - ABC Corp',
    amount: 5000,
    type: 'credit',
    account: 'Accounts Receivable',
    category: 'Revenue',
  },
  {
    id: 't2',
    date: new Date(2023, 5, 16),
    description: 'Office supplies',
    amount: 250.75,
    type: 'debit',
    account: 'Office Expenses',
    category: 'Expense',
  },
]

const QueryPage = () => {
  const { user, session } = useContext(AuthContext)
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [query, setQuery] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const [searchTerm, setSearchTerm] = useState('')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [currentJournalEntry, setCurrentJournalEntry] = useState<JournalEntry | null>(null)
  const [queryType, setQueryType] = useState<'reporting' | 'transactional'>('transactional')
  const [error, setError] = useState('')
  const [reportData, setReportData] = useState<any>(null)
  const queryInputRef = useRef<HTMLTextAreaElement>(null)

  // Check if this is demo mode
  const isDemoMode = window.location.pathname === '/demo'

  // Simple authentication check - if we have a session or user, allow access
  const isAuthenticated = user || session

  // Check if user is approved (only if we have user data)
  if (!isDemoMode && user && !user.is_approved) {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Your account is pending admin approval. Please wait for approval to access the query page.
        </Alert>
        <Typography variant="body1" color="textSecondary">
          Contact your administrator if you have been waiting for an extended period.
        </Typography>
      </Box>
    )
  }

  // Filter transactions based on search term and selected date
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.account.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDate = selectedDate
      ? transaction.date.toDateString() === selectedDate.toDateString()
      : true

    return matchesSearch && matchesDate
  })

  // Focus on query input when component mounts
  useEffect(() => {
    if (queryInputRef.current) {
      queryInputRef.current.focus()
    }
  }, [])

  // Handle query submission
  const handleSubmitQuery = async () => {
    if (!query.trim()) return
    
    // In demo mode, don't require user authentication
    if (!isDemoMode && !user) {
      setError('User not authenticated')
      return
    }

    setIsProcessing(true)
    setError('')
    setReportData(null)

    try {
      // For demo mode, use mock data instead of actual API call
      if (isDemoMode) {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Create a mock journal entry based on the query
        const mockJournalEntry: JournalEntry = {
          id: `demo-j${transactions.length + 1}`,
          date: new Date(),
          description: `Demo Transaction: ${query}`,
          entries: [
            {
              account: '1000 - Cash',
              debit: 1000,
              credit: undefined,
            },
            {
              account: '4000 - Sales Revenue',
              debit: undefined,
              credit: 1000,
            }
          ]
        }
        
        setCurrentJournalEntry(mockJournalEntry)
        setShowConfirmDialog(true)
        return
      }

      // Use the new transaction processing service for authenticated users
      const userId = user?.id || session?.user?.id
      if (!userId) {
        setError('User ID not found in session')
        return
      }

      const result = await transactionProcessingService.processQuery(
        query,
        user?.company_name || 'Unknown Company',
        'Unknown Country', // Default value since user doesn't have country property
        'Unknown Region',   // Default value since user doesn't have region property
        userId
      )

      if (result.success && result.data?.transactions && result.data.transactions.length > 0) {
        // Convert the first transaction to journal entry format for confirmation dialog
        const firstTransaction = result.data.transactions[0]
        
        const journalEntry: JournalEntry = {
          id: `j${transactions.length + 1}`,
          date: new Date(firstTransaction.calendar_data.date),
          description: firstTransaction.general_ledger_entries[0]?.details || 'AI Generated Transaction',
          entries: firstTransaction.general_ledger_entries.map(entry => ({
            account: `${entry.account_key} - ${getAccountName(entry.account_key)}`,
            debit: entry.type === 'Debit' ? entry.amount : undefined,
            credit: entry.type === 'Credit' ? entry.amount : undefined,
          }))
        }
        
        setCurrentJournalEntry(journalEntry)
        setShowConfirmDialog(true)
      } else if (result.error) {
        setError(result.error)
      } else {
        setError('No valid transactions found in the response')
      }
    } catch (err) {
      setError(`An error occurred: ${(err as Error).message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  // Helper function to get account name from account key
  const getAccountName = (accountKey: number): string => {
    const accountMap: { [key: number]: string } = {
      1000: 'Cash',
      1100: 'Accounts Receivable',
      2000: 'Accounts Payable',
      3000: 'Owner Capital',
      4000: 'Sales Revenue',
      5000: 'Cost of Goods Sold',
    }
    return accountMap[accountKey] || 'Unknown Account'
  }

  // Handle confirmation of journal entry
  const handleConfirmEntry = async () => {
    if (!currentJournalEntry) return
    
    // In demo mode, don't require user authentication
    if (!isDemoMode && !user) return

    setIsProcessing(true)
    setError('')

    try {
      // For demo mode, just add to local transactions without saving to database
      if (isDemoMode) {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Create new transactions from journal entry data for local display
        const newTransactions: Transaction[] = currentJournalEntry.entries.map((entry, index) => ({
          id: `demo-t${transactions.length + index + 1}`,
          date: currentJournalEntry.date,
          description: currentJournalEntry.description,
          amount: entry.debit || entry.credit || 0,
          type: entry.debit ? 'debit' : 'credit',
          account: entry.account,
          category: entry.debit ? 'Expense' : 'Revenue',
        }))

        // Add new transactions to the list
        setTransactions([...newTransactions, ...transactions])
        
        // Show demo success message
        alert('Demo transaction added successfully! (This is a demo - no data was saved to the database)')
        
        // Clear the form
        setShowConfirmDialog(false)
        setCurrentJournalEntry(null)
        setQuery('')
        setIsProcessing(false)
        return
      }

      // Process the transaction data using the new service for authenticated users
      const transactionData = {
        company_data: {
          company_name: user?.company_name || 'Unknown Company'
        },
        territory_data: {
          country: 'Unknown Country', // Default value since user doesn't have country property
          region: 'Unknown Region'    // Default value since user doesn't have region property
        },
        calendar_data: {
          date: currentJournalEntry.date.toISOString().split('T')[0],
          year: currentJournalEntry.date.getFullYear(),
          quarter: `Q${Math.ceil((currentJournalEntry.date.getMonth() + 1) / 3)}`,
          month: currentJournalEntry.date.toLocaleString('default', { month: 'long' }),
          day: currentJournalEntry.date.toLocaleString('default', { weekday: 'long' })
        },
        chart_of_accounts_data: currentJournalEntry.entries.map(entry => {
          const accountKeyMatch = entry.account.match(/^(\d+)/);
          const accountKey = accountKeyMatch ? parseInt(accountKeyMatch[1]) : 1000;
          
          return {
            account_key: accountKey,
            report: "Balance Sheet",
            class: "Assets",
            subclass: "Current Assets",
            subclass2: "Current Assets",
            account: getAccountName(accountKey),
            subaccount: getAccountName(accountKey)
          }
        }),
        general_ledger_entries: currentJournalEntry.entries.map(entry => {
          const accountKeyMatch = entry.account.match(/^(\d+)/);
          const accountKey = accountKeyMatch ? parseInt(accountKeyMatch[1]) : 1000;
          
          return {
            account_key: accountKey,
            details: currentJournalEntry.description,
            amount: entry.debit || entry.credit || 0,
            type: (entry.debit ? 'Debit' : 'Credit') as 'Debit' | 'Credit'
          }
        })
      }

      // Save using the supabase accounting service directly
      const result = await supabaseAccountingService.saveTransactionData(user?.id || '', transactionData)

      if (result.success) {
        // Create new transactions from journal entry data for local display
        const newTransactions: Transaction[] = currentJournalEntry.entries.map((entry, index) => ({
          id: `t${transactions.length + index + 1}`,
          date: currentJournalEntry.date,
          description: currentJournalEntry.description,
          amount: entry.debit || entry.credit || 0,
          type: entry.debit ? 'debit' : 'credit',
          account: entry.account,
          category: entry.debit ? 'Expense' : 'Revenue',
        }))

        // Add new transactions to the list
        setTransactions([...newTransactions, ...transactions])
        
        // Show success message
        alert(`Transaction saved successfully to Supabase! Entry numbers: ${result.entryNumbers?.join(', ') || 'N/A'}`)
        
        // Clear the form
        setShowConfirmDialog(false)
        setCurrentJournalEntry(null)
        setQuery('')
      } else {
        throw new Error(result.error || 'Failed to save transaction to database')
      }
    } catch (err) {
      setError(`Failed to save transaction: ${(err as Error).message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle saving report results to database
  const handleSaveReport = async () => {
    if (!reportData) return

    setIsProcessing(true)
    setError('')

    try {
      const saveResponse = await saveReportResults(
        1, // company_id - you might want to get this from user context
        query, // original query text
        reportData,
        {
          user: 'Frontend User',
          query_type: 'report'
        }
      );

      if (saveResponse.success) {
        alert(`Report query logged successfully! Log ID: ${saveResponse.log_id}`)
      } else {
        throw new Error('Failed to save report to database')
      }
    } catch (err) {
      setError(`Failed to save report: ${(err as Error).message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle editing amounts in the dialog
  const handleAmountEdit = (index: number, field: 'debit' | 'credit', value: string) => {
    if (!currentJournalEntry) return
    
    const numValue = parseFloat(value) || 0
    const updatedEntries = [...currentJournalEntry.entries]
    
    if (field === 'debit') {
      updatedEntries[index] = { ...updatedEntries[index], debit: numValue, credit: undefined }
    } else {
      updatedEntries[index] = { ...updatedEntries[index], credit: numValue, debit: undefined }
    }
    
    setCurrentJournalEntry({
      ...currentJournalEntry,
      entries: updatedEntries
    })
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <Alert 
          severity="info" 
          sx={{ mb: 2, borderRadius: 2 }}
          icon={<Info />}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Typography variant="body2">
              <strong>Demo Mode:</strong> You're exploring the AI Query Assistant. Transactions won't be saved to the database.
            </Typography>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => window.location.href = '/login'}
              sx={{ ml: 2 }}
            >
              Sign In for Full Access
            </Button>
          </Box>
        </Alert>
      )}
      
      <Typography variant="h4" component="h1" gutterBottom>
        AI Query Assistant
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Ask questions about your finances or record transactions using natural language.
      </Typography>

      <Grid container spacing={3} sx={{ flexGrow: 1 }}>
        {/* Left side - Transaction Feed */}
        <Grid item xs={12} md={7} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Paper sx={{ p: 2, borderRadius: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                Transaction Feed
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Filter by date"
                  value={selectedDate}
                  onChange={(newValue) => setSelectedDate(newValue)}
                  slotProps={{ 
                    textField: { 
                      size: 'small',
                      sx: { width: 180 },
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarToday fontSize="small" />
                          </InputAdornment>
                        ),
                      } 
                    } 
                  }}
                />
              </LocalizationProvider>
              <TextField
                placeholder="Search transactions"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ ml: 2, width: 200 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Account</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="center">Type</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <AnimatePresence>
                    {filteredTransactions.map((transaction) => (
                      <motion.tr
                        key={transaction.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ display: 'table-row' }}
                      >
                        <TableCell>{transaction.date.toLocaleDateString()}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>{transaction.account}</TableCell>
                        <TableCell align="right">${transaction.amount.toFixed(2)}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={transaction.type}
                            size="small"
                            color={transaction.type === 'credit' ? 'success' : 'error'}
                            variant="outlined"
                          />
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </TableContainer>

            {filteredTransactions.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="textSecondary">No transactions found</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right side - AI Copilot */}
        <Grid item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
          >
            <Typography variant="h6" gutterBottom>
              AI Copilot
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Ask me to record transactions, analyze data, or answer financial questions.
            </Typography>

            <Box sx={{ flexGrow: 1, mb: 2, overflow: 'auto' }}>
              {/* This would contain conversation history in a real app */}
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, mb: 2 }}>
                <Typography variant="body2" fontWeight="medium">
                  Try asking:
                </Typography>
                <Box
                  component={motion.div}
                  whileHover={{ scale: 1.02 }}
                  sx={{ p: 1, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1, mt: 1 }}
                  onClick={() => setQuery('Record a sale of $500 for consulting services')}
                >
                  <Typography variant="body2">"Record a sale of $500 for consulting services"</Typography>
                </Box>
                <Box
                  component={motion.div}
                  whileHover={{ scale: 1.02 }}
                  sx={{ p: 1, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, borderRadius: 1, mt: 1 }}
                  onClick={() => setQuery('Enter an office supplies expense of $250')}
                >
                  <Typography variant="body2">"Enter an office supplies expense of $250"</Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Query Type Selector */}
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel component="legend">Query Type</FormLabel>
              <RadioGroup
                row
                value={queryType}
                onChange={(e) => setQueryType(e.target.value as 'reporting' | 'transactional')}
              >
                <FormControlLabel
                  value="reporting"
                  control={<Radio />}
                  label="Get a Report"
                />
                <FormControlLabel
                  value="transactional"
                  control={<Radio />}
                  label="Enter a Transaction"
                />
              </RadioGroup>
            </FormControl>

            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <TextField
                inputRef={queryInputRef}
                fullWidth
                multiline
                rows={3}
                placeholder={
                  queryType === 'reporting'
                    ? 'e.g., Show me the P&L for last year'
                    : 'e.g., On May 1, 2025, we paid $2000 for rent.'
                }
                variant="outlined"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isProcessing}
              />
              <Button
                variant="contained"
                color="primary"
                endIcon={<Send />}
                onClick={handleSubmitQuery}
                disabled={!query.trim() || isProcessing}
                sx={{ ml: 1, height: 56 }}
              >
                {isProcessing ? <CircularProgress size={24} /> : 'Send'}
              </Button>
            </Box>

            {/* Error Display */}
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            {/* Report Data Display */}
            {reportData && (
              <Paper sx={{ mt: 2, p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Financial Report
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Save />}
                    onClick={handleSaveReport}
                    disabled={isProcessing}
                  >
                    {isProcessing ? <CircularProgress size={20} /> : 'Save Report'}
                  </Button>
                </Box>
                <AccountingTable data={reportData} />
              </Paper>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Journal Entry Confirmation Dialog */}
      <Dialog 
        open={showConfirmDialog} 
        onClose={() => setShowConfirmDialog(false)} 
        maxWidth="md" 
        fullWidth
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
        disableEnforceFocus={false}
        disableAutoFocus={false}
        keepMounted={false}
        BackdropProps={{
          'aria-hidden': undefined
        }}
      >
        <DialogTitle id="dialog-title">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Confirm Transaction Entry</Typography>
            <Typography variant="body2" color="text.secondary">
              Review and edit amounts if needed
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent id="dialog-description">
          {currentJournalEntry && (
            <Box>
              <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {currentJournalEntry.description}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Date: {currentJournalEntry.date.toLocaleDateString()}
                </Typography>
              </Box>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Account</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Debit Amount</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Credit Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentJournalEntry.entries.map((entry, index) => (
                      <TableRow key={index} hover>
                        <TableCell sx={{ fontWeight: 'medium', minWidth: 200 }}>
                          {entry.account}
                        </TableCell>
                        <TableCell align="center" sx={{ width: 150 }}>
                          {entry.debit !== undefined ? (
                            <TextField
                              type="number"
                              size="small"
                              value={entry.debit}
                              onChange={(e) => handleAmountEdit(index, 'debit', e.target.value)}
                              InputProps={{
                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                              }}
                              sx={{ width: 120 }}
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          )}
                        </TableCell>
                        <TableCell align="center" sx={{ width: 150 }}>
                          {entry.credit !== undefined ? (
                            <TextField
                              type="number"
                              size="small"
                              value={entry.credit}
                              onChange={(e) => handleAmountEdit(index, 'credit', e.target.value)}
                              InputProps={{
                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                              }}
                              sx={{ width: 120 }}
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Balance Check */}
              <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                  <ArrowForward color="action" sx={{ mr: 1 }} />
                  Total Debits: $
                  {currentJournalEntry.entries
                    .reduce((sum, entry) => sum + (entry.debit || 0), 0)
                    .toFixed(2)}
                  {' | '}
                  Total Credits: $
                  {currentJournalEntry.entries
                    .reduce((sum, entry) => sum + (entry.credit || 0), 0)
                    .toFixed(2)}
                </Typography>
                {Math.abs(
                  currentJournalEntry.entries.reduce((sum, entry) => sum + (entry.debit || 0), 0) -
                  currentJournalEntry.entries.reduce((sum, entry) => sum + (entry.credit || 0), 0)
                ) > 0.01 && (
                  <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                    ⚠️ Warning: Debits and Credits must be equal for a valid journal entry
                  </Typography>
                )}
              </Box>

              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                <Typography variant="body2">
                  This will create {currentJournalEntry.entries.length} new transactions in your ledger.
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            startIcon={<Close />}
            onClick={() => {
              setShowConfirmDialog(false)
              setCurrentJournalEntry(null)
            }}
            size="large"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Check />}
            onClick={handleConfirmEntry}
            size="large"
            disabled={
              !currentJournalEntry ||
              Math.abs(
                currentJournalEntry.entries.reduce((sum, entry) => sum + (entry.debit || 0), 0) -
                currentJournalEntry.entries.reduce((sum, entry) => sum + (entry.credit || 0), 0)
              ) > 0.01
            }
          >
            Confirm & Save Transaction
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default QueryPage