import { useState, useContext } from 'react'
import { Box, Typography, Paper, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, IconButton, TextField, MenuItem, Select, FormControl, InputLabel, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Card, CardContent, CircularProgress, Tooltip, InputAdornment, Divider } from '@mui/material'
import { Add, Edit, Delete, Refresh, Search, ArrowUpward, ArrowDownward, Check, Close, Business, Person, Storage, Assessment } from '@mui/icons-material'
import { motion } from 'framer-motion'
import { AuthContext } from '../context/AuthContext'

// Types
type Company = {
  id: string
  name: string
  createdAt: Date
  status: 'active' | 'inactive' | 'pending'
  plan: 'free' | 'standard' | 'premium'
  usersCount: number
}

type User = {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Accountant' | 'Viewer'
  companyId: string
  companyName: string
  lastActive: Date
}

type DataModel = {
  id: string
  name: string
  description: string
  recordCount: number
  lastUpdated: Date
}

type UsageStat = {
  label: string
  value: number
  change: number
  unit: string
}

// Mock data
const mockCompanies: Company[] = [
  { id: 'c1', name: 'Acme Corp', createdAt: new Date(2022, 1, 15), status: 'active', plan: 'premium', usersCount: 12 },
  { id: 'c2', name: 'Globex Inc', createdAt: new Date(2022, 3, 22), status: 'active', plan: 'standard', usersCount: 8 },
  { id: 'c3', name: 'Initech LLC', createdAt: new Date(2022, 5, 10), status: 'inactive', plan: 'free', usersCount: 3 },
  { id: 'c4', name: 'Umbrella Corp', createdAt: new Date(2022, 7, 5), status: 'active', plan: 'premium', usersCount: 15 },
  { id: 'c5', name: 'Stark Industries', createdAt: new Date(2022, 9, 18), status: 'pending', plan: 'standard', usersCount: 6 },
]

const mockUsers: User[] = [
  { id: 'u1', name: 'John Doe', email: 'john@acmecorp.com', role: 'Admin', companyId: 'c1', companyName: 'Acme Corp', lastActive: new Date(2023, 5, 28) },
  { id: 'u2', name: 'Jane Smith', email: 'jane@acmecorp.com', role: 'Accountant', companyId: 'c1', companyName: 'Acme Corp', lastActive: new Date(2023, 5, 27) },
  { id: 'u3', name: 'Bob Johnson', email: 'bob@globex.com', role: 'Admin', companyId: 'c2', companyName: 'Globex Inc', lastActive: new Date(2023, 5, 26) },
  { id: 'u4', name: 'Alice Williams', email: 'alice@globex.com', role: 'Viewer', companyId: 'c2', companyName: 'Globex Inc', lastActive: new Date(2023, 5, 25) },
  { id: 'u5', name: 'Charlie Brown', email: 'charlie@initech.com', role: 'Accountant', companyId: 'c3', companyName: 'Initech LLC', lastActive: new Date(2023, 5, 24) },
]

const mockDataModels: DataModel[] = [
  { id: 'm1', name: 'General Ledger', description: 'Core financial transactions', recordCount: 1245, lastUpdated: new Date(2023, 5, 28) },
  { id: 'm2', name: 'Calendar', description: 'Fiscal periods and date configurations', recordCount: 36, lastUpdated: new Date(2023, 5, 25) },
  { id: 'm3', name: 'Chart of Accounts', description: 'Account structure and hierarchy', recordCount: 87, lastUpdated: new Date(2023, 5, 27) },
  { id: 'm4', name: 'Vendors', description: 'Supplier and vendor information', recordCount: 53, lastUpdated: new Date(2023, 5, 26) },
  { id: 'm5', name: 'Customers', description: 'Client and customer records', recordCount: 128, lastUpdated: new Date(2023, 5, 28) },
]

const mockUsageStats: UsageStat[] = [
  { label: 'Total Transactions', value: 12458, change: 8.5, unit: '' },
  { label: 'Active Users', value: 42, change: 12.3, unit: '' },
  { label: 'Average Response Time', value: 0.8, change: -15.2, unit: 's' },
  { label: 'Storage Used', value: 256, change: 5.7, unit: 'MB' },
]

const AdminPanel = () => {
  const { user, switchCompany } = useContext(AuthContext)
  const [tabIndex, setTabIndex] = useState(0)
  const [dataModelTab, setDataModelTab] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ type: string; id: string; name: string } | null>(null)

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue)
  }

  // Handle data model tab change
  const handleDataModelTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setDataModelTab(newValue)
  }

  // Handle company switch
  const handleCompanySwitch = (companyId: string) => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      switchCompany(companyId)
      setIsLoading(false)
    }, 800)
  }

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (!itemToDelete) return

    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      // In a real app, this would call an API to delete the item
      console.log(`Deleted ${itemToDelete.type} ${itemToDelete.id}: ${itemToDelete.name}`)
      setShowDeleteDialog(false)
      setItemToDelete(null)
      setIsLoading(false)
    }, 800)
  }

  // Filter companies based on search term
  const filteredCompanies = mockCompanies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Filter users based on search term
  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Filter data models based on search term
  const filteredDataModels = mockDataModels.filter(model =>
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1, mb: { xs: 2, sm: 0 } }}>
          Admin Panel
        </Typography>

        <FormControl variant="outlined" size="small" sx={{ minWidth: 250 }}>
          <InputLabel id="company-select-label">Currently Managing</InputLabel>
          <Select
            labelId="company-select-label"
            value={user?.currentCompany?.id || ''}
            onChange={(e) => handleCompanySwitch(e.target.value)}
            label="Currently Managing"
            startAdornment={
              <InputAdornment position="start">
                <Business fontSize="small" />
              </InputAdornment>
            }
          >
            {mockCompanies.map((company) => (
              <MenuItem key={company.id} value={company.id}>
                {company.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<Business />} label="Companies" />
          <Tab icon={<Person />} label="Users" />
          <Tab icon={<Storage />} label="Data Models" />
          <Tab icon={<Assessment />} label="Usage & Health" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <TextField
              placeholder={`Search ${tabIndex === 0 ? 'companies' : tabIndex === 1 ? 'users' : tabIndex === 2 ? 'data models' : 'stats'}`}
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            {tabIndex !== 3 && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={() => alert(`Add new ${tabIndex === 0 ? 'company' : tabIndex === 1 ? 'user' : 'data model'} dialog would open here`)}
              >
                Add {tabIndex === 0 ? 'Company' : tabIndex === 1 ? 'User' : 'Record'}
              </Button>
            )}
          </Box>

          {/* Companies Tab */}
          {tabIndex === 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Company Name</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Plan</TableCell>
                    <TableCell>Users</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <CircularProgress size={40} />
                      </TableCell>
                    </TableRow>
                  ) : filteredCompanies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <Typography color="textSecondary">No companies found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCompanies.map((company) => (
                      <TableRow key={company.id} hover>
                        <TableCell>{company.name}</TableCell>
                        <TableCell>{company.createdAt.toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip
                            label={company.status}
                            size="small"
                            color={
                              company.status === 'active'
                                ? 'success'
                                : company.status === 'pending'
                                ? 'warning'
                                : 'error'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={company.plan}
                            size="small"
                            color={
                              company.plan === 'premium'
                                ? 'primary'
                                : company.plan === 'standard'
                                ? 'info'
                                : 'default'
                            }
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{company.usersCount}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => alert(`Edit ${company.name}`)}>  
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setItemToDelete({
                                  type: 'company',
                                  id: company.id,
                                  name: company.name,
                                })
                                setShowDeleteDialog(true)
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Users Tab */}
          {tabIndex === 1 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Company</TableCell>
                    <TableCell>Last Active</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <CircularProgress size={40} />
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <Typography color="textSecondary">No users found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.role}
                            size="small"
                            color={
                              user.role === 'Admin'
                                ? 'primary'
                                : user.role === 'Accountant'
                                ? 'info'
                                : 'default'
                            }
                          />
                        </TableCell>
                        <TableCell>{user.companyName}</TableCell>
                        <TableCell>{user.lastActive.toLocaleDateString()}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => alert(`Edit ${user.name}`)}>  
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setItemToDelete({
                                  type: 'user',
                                  id: user.id,
                                  name: user.name,
                                })
                                setShowDeleteDialog(true)
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Data Models Tab */}
          {tabIndex === 2 && (
            <Box>
              <Tabs
                value={dataModelTab}
                onChange={handleDataModelTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
              >
                {mockDataModels.map((model, _index) => (
                  <Tab key={model.id} label={model.name} />
                ))}
              </Tabs>

              {filteredDataModels.length > 0 && dataModelTab < filteredDataModels.length ? (
                <Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6">{filteredDataModels[dataModelTab].name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {filteredDataModels[dataModelTab].description}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                      <Chip
                        label={`${filteredDataModels[dataModelTab].recordCount} Records`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2" color="textSecondary">
                        Last updated: {filteredDataModels[dataModelTab].lastUpdated.toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Refresh />}
                      onClick={() => alert(`Refresh ${filteredDataModels[dataModelTab].name} data`)}
                    >
                      Refresh Data
                    </Button>
                    <Box>
                      <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        sx={{ mr: 1 }}
                        onClick={() => alert(`Edit schema for ${filteredDataModels[dataModelTab].name}`)}
                      >
                        Edit Schema
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => alert(`Add record to ${filteredDataModels[dataModelTab].name}`)}
                      >
                        Add Record
                      </Button>
                    </Box>
                  </Box>

                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      This is a placeholder for the data table of {filteredDataModels[dataModelTab].name}.
                      In a real application, this would display the actual records with CRUD functionality.
                    </Typography>
                    <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="body1" color="textSecondary">
                        Data Table for {filteredDataModels[dataModelTab].name}
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              ) : (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography color="textSecondary">No data models found</Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Usage & Health Tab */}
          {tabIndex === 3 && (
            <Box>
              <Grid container spacing={3}>
                {mockUsageStats.map((stat, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {stat.label}
                          </Typography>
                          <Typography variant="h4">
                            {stat.value.toLocaleString()}{stat.unit}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            {stat.change > 0 ? (
                              <ArrowUpward fontSize="small" color="success" />
                            ) : (
                              <ArrowDownward fontSize="small" color="error" />
                            )}
                            <Typography
                              variant="body2"
                              color={stat.change > 0 ? 'success.main' : 'error.main'}
                              sx={{ ml: 0.5 }}
                            >
                              {Math.abs(stat.change)}% {stat.change > 0 ? 'increase' : 'decrease'}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>

              <Divider sx={{ my: 4 }} />

              <Typography variant="h6" gutterBottom>
                System Health
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      API Performance
                    </Typography>
                    <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="body1" color="textSecondary">
                        API Performance Chart Placeholder
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Error Rates
                    </Typography>
                    <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="body1" color="textSecondary">
                        Error Rates Chart Placeholder
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {itemToDelete?.type} <strong>{itemToDelete?.name}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            startIcon={<Close />}
            onClick={() => setShowDeleteDialog(false)}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<Check />}
            onClick={handleDeleteConfirm}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AdminPanel