import { useState, useContext, useEffect } from 'react'
import { Box, Typography, Paper, Card, CardContent, CardHeader, IconButton, Button, Menu, MenuItem, Divider, CircularProgress } from '@mui/material'
import { MoreVert, Add, ArrowUpward, ArrowDownward, BarChart, PieChart, ShowChart, Timeline } from '@mui/icons-material'
import { Responsive, WidthProvider } from 'react-grid-layout'
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell } from 'recharts'

// Context
import { AuthContext } from '../context/AuthContext'

// Extend react-grid-layout with width provider
const ResponsiveGridLayout = WidthProvider(Responsive)

// Types
type Widget = {
  id: string
  title: string
  type: 'kpi' | 'barChart' | 'lineChart' | 'pieChart' | 'healthScore'
  data?: any
  size: [number, number] // [width, height] in grid units
}

// Mock data
const mockRevenueData = [
  { month: 'Jan', value: 4000 },
  { month: 'Feb', value: 3000 },
  { month: 'Mar', value: 5000 },
  { month: 'Apr', value: 7000 },
  { month: 'May', value: 6000 },
  { month: 'Jun', value: 8000 },
]

const mockProfitData = [
  { month: 'Jan', value: 1000 },
  { month: 'Feb', value: 200 },
  { month: 'Mar', value: 1800 },
  { month: 'Apr', value: 2500 },
  { month: 'May', value: 1800 },
  { month: 'Jun', value: 2900 },
]

const mockCategoryData = [
  { name: 'Sales', value: 60 },
  { name: 'Services', value: 25 },
  { name: 'Other', value: 15 },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

const AccountantDashboard = () => {
  const { user } = useContext(AuthContext)
  const [loading, setLoading] = useState(true)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [widgetMenuId, setWidgetMenuId] = useState<string | null>(null)
  const [addWidgetAnchorEl, setAddWidgetAnchorEl] = useState<null | HTMLElement>(null)
  
  // Dashboard widgets state
  const [widgets, setWidgets] = useState<Widget[]>([
    { id: 'revenue', title: 'Revenue', type: 'kpi', data: { value: 45000, change: 12.5, trend: 'up' }, size: [1, 1] },
    { id: 'expenses', title: 'Expenses', type: 'kpi', data: { value: 28000, change: 8.3, trend: 'up' }, size: [1, 1] },
    { id: 'profit', title: 'Profit', type: 'kpi', data: { value: 17000, change: 22.4, trend: 'up' }, size: [1, 1] },
    { id: 'cashflow', title: 'Cash Flow', type: 'kpi', data: { value: 12500, change: -5.2, trend: 'down' }, size: [1, 1] },
    { id: 'revenue-chart', title: 'Revenue Trend', type: 'barChart', data: mockRevenueData, size: [2, 2] },
    { id: 'profit-chart', title: 'Profit Growth', type: 'lineChart', data: mockProfitData, size: [2, 2] },
    { id: 'category-breakdown', title: 'Revenue by Category', type: 'pieChart', data: mockCategoryData, size: [2, 2] },
    { id: 'health-score', title: 'Financial Health Score', type: 'healthScore', data: { score: 85, summary: 'Strong financial position with good growth trends.' }, size: [2, 1] },
  ])

  // Layout configuration for react-grid-layout
  const [layouts, setLayouts] = useState({
    lg: [
      { i: 'revenue', x: 0, y: 0, w: 3, h: 1 },
      { i: 'expenses', x: 3, y: 0, w: 3, h: 1 },
      { i: 'profit', x: 6, y: 0, w: 3, h: 1 },
      { i: 'cashflow', x: 9, y: 0, w: 3, h: 1 },
      { i: 'revenue-chart', x: 0, y: 1, w: 6, h: 2 },
      { i: 'profit-chart', x: 6, y: 1, w: 6, h: 2 },
      { i: 'category-breakdown', x: 0, y: 3, w: 6, h: 2 },
      { i: 'health-score', x: 6, y: 3, w: 6, h: 1 },
    ],
    md: [
      { i: 'revenue', x: 0, y: 0, w: 3, h: 1 },
      { i: 'expenses', x: 3, y: 0, w: 3, h: 1 },
      { i: 'profit', x: 6, y: 0, w: 3, h: 1 },
      { i: 'cashflow', x: 9, y: 0, w: 3, h: 1 },
      { i: 'revenue-chart', x: 0, y: 1, w: 6, h: 2 },
      { i: 'profit-chart', x: 6, y: 1, w: 6, h: 2 },
      { i: 'category-breakdown', x: 0, y: 3, w: 6, h: 2 },
      { i: 'health-score', x: 6, y: 3, w: 6, h: 1 },
    ],
    sm: [
      { i: 'revenue', x: 0, y: 0, w: 3, h: 1 },
      { i: 'expenses', x: 3, y: 0, w: 3, h: 1 },
      { i: 'profit', x: 0, y: 1, w: 3, h: 1 },
      { i: 'cashflow', x: 3, y: 1, w: 3, h: 1 },
      { i: 'revenue-chart', x: 0, y: 2, w: 6, h: 2 },
      { i: 'profit-chart', x: 0, y: 4, w: 6, h: 2 },
      { i: 'category-breakdown', x: 0, y: 6, w: 6, h: 2 },
      { i: 'health-score', x: 0, y: 8, w: 6, h: 1 },
    ],
    xs: [
      { i: 'revenue', x: 0, y: 0, w: 2, h: 1 },
      { i: 'expenses', x: 2, y: 0, w: 2, h: 1 },
      { i: 'profit', x: 0, y: 1, w: 2, h: 1 },
      { i: 'cashflow', x: 2, y: 1, w: 2, h: 1 },
      { i: 'revenue-chart', x: 0, y: 2, w: 4, h: 2 },
      { i: 'profit-chart', x: 0, y: 4, w: 4, h: 2 },
      { i: 'category-breakdown', x: 0, y: 6, w: 4, h: 2 },
      { i: 'health-score', x: 0, y: 8, w: 4, h: 1 },
    ],
  })

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // Handle widget menu open
  const handleWidgetMenuOpen = (event: React.MouseEvent<HTMLElement>, widgetId: string) => {
    setAnchorEl(event.currentTarget)
    setWidgetMenuId(widgetId)
  }

  // Handle widget menu close
  const handleWidgetMenuClose = () => {
    setAnchorEl(null)
    setWidgetMenuId(null)
  }

  // Handle add widget menu open
  const handleAddWidgetMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAddWidgetAnchorEl(event.currentTarget)
  }

  // Handle add widget menu close
  const handleAddWidgetMenuClose = () => {
    setAddWidgetAnchorEl(null)
  }

  // Handle layout change
  const handleLayoutChange = (_currentLayout: any, allLayouts: any) => {
    setLayouts(allLayouts)
    // In a real app, save this to user preferences
    localStorage.setItem('dashboardLayouts', JSON.stringify(allLayouts))
  }

  // Handle widget removal
  const handleRemoveWidget = (widgetId: string) => {
    setWidgets(widgets.filter((widget) => widget.id !== widgetId))
    handleWidgetMenuClose()
  }

  // Handle widget drill down
  const handleDrillDown = (widgetId: string) => {
    // In a real app, navigate to detailed view
    alert(`Navigating to detailed view for ${widgetId}`)
    handleWidgetMenuClose()
  }

  // Render KPI widget
  const renderKpiWidget = (widget: Widget) => {
    const { data } = widget
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 2 }}>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          {widget.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
          <Typography variant="h4" component="div" fontWeight="bold">
            ${data.value.toLocaleString()}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              ml: 1,
              color: data.trend === 'up' ? 'success.main' : 'error.main',
            }}
          >
            {data.trend === 'up' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
            <Typography variant="body2" sx={{ ml: 0.5 }}>
              {Math.abs(data.change)}%
            </Typography>
          </Box>
        </Box>
      </Box>
    )
  }

  // Render bar chart widget
  const renderBarChartWidget = (widget: Widget) => {
    return (
      <Box sx={{ height: '100%', width: '100%', p: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={widget.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <RechartsTooltip formatter={(value) => [`$${value}`, 'Revenue']} />
            <Bar dataKey="value" fill="#8884d8" />
          </RechartsBarChart>
        </ResponsiveContainer>
      </Box>
    )
  }

  // Render line chart widget
  const renderLineChartWidget = (widget: Widget) => {
    return (
      <Box sx={{ height: '100%', width: '100%', p: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={widget.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <RechartsTooltip formatter={(value) => [`$${value}`, 'Profit']} />
            <Line type="monotone" dataKey="value" stroke="#82ca9d" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    )
  }

  // Render pie chart widget
  const renderPieChartWidget = (widget: Widget) => {
    return (
      <Box sx={{ height: '100%', width: '100%', p: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={widget.data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {widget.data.map((_entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip formatter={(value) => [`${value}%`, 'Percentage']} />
          </RechartsPieChart>
        </ResponsiveContainer>
      </Box>
    )
  }

  // Render health score widget
  const renderHealthScoreWidget = (widget: Widget) => {
    const { data } = widget
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 2 }}>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          {widget.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: data.score >= 80 ? 'success.main' : data.score >= 60 ? 'warning.main' : 'error.main',
              color: 'white',
              fontWeight: 'bold',
              mr: 2,
            }}
          >
            {data.score}/100
          </Box>
          <Typography variant="body1">{data.summary}</Typography>
        </Box>
        <Typography variant="caption" color="textSecondary">
          AI-generated based on your financial data
        </Typography>
      </Box>
    )
  }

  // Render widget based on type
  const renderWidget = (widget: Widget) => {
    switch (widget.type) {
      case 'kpi':
        return renderKpiWidget(widget)
      case 'barChart':
        return renderBarChartWidget(widget)
      case 'lineChart':
        return renderLineChartWidget(widget)
      case 'pieChart':
        return renderPieChartWidget(widget)
      case 'healthScore':
        return renderHealthScoreWidget(widget)
      default:
        return null
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {user?.currentCompany?.name || 'Company'} Dashboard
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleAddWidgetMenuOpen}
        >
          Add Widget
        </Button>
      </Box>

      <Paper sx={{ p: 0, borderRadius: 2, overflow: 'hidden', height: 'calc(100% - 60px)' }}>
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
          cols={{ lg: 12, md: 12, sm: 6, xs: 4 }}
          rowHeight={120}
          onLayoutChange={handleLayoutChange}
          isDraggable
          isResizable
          containerPadding={[16, 16]}
        >
          {widgets.map((widget) => (
            <Box key={widget.id} sx={{ overflow: 'hidden' }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <CardHeader
                  title={widget.title}
                  titleTypographyProps={{ variant: 'subtitle1' }}
                  sx={{ py: 1, px: 2 }}
                  action={
                    <IconButton
                      aria-label="widget menu"
                      size="small"
                      onClick={(e) => handleWidgetMenuOpen(e, widget.id)}
                    >
                      <MoreVert fontSize="small" />
                    </IconButton>
                  }
                />
                <Divider />
                <CardContent sx={{ p: 0, flexGrow: 1, overflow: 'hidden' }}>
                  {renderWidget(widget)}
                </CardContent>
              </Card>
            </Box>
          ))}
        </ResponsiveGridLayout>
      </Paper>

      {/* Widget menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleWidgetMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => widgetMenuId && handleDrillDown(widgetMenuId)}>
          View Details
        </MenuItem>
        <MenuItem onClick={() => widgetMenuId && handleRemoveWidget(widgetMenuId)}>
          Remove Widget
        </MenuItem>
      </Menu>

      {/* Add widget menu */}
      <Menu
        anchorEl={addWidgetAnchorEl}
        open={Boolean(addWidgetAnchorEl)}
        onClose={handleAddWidgetMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleAddWidgetMenuClose}>
          <BarChart sx={{ mr: 1 }} fontSize="small" /> Revenue Chart
        </MenuItem>
        <MenuItem onClick={handleAddWidgetMenuClose}>
          <ShowChart sx={{ mr: 1 }} fontSize="small" /> Expense Trend
        </MenuItem>
        <MenuItem onClick={handleAddWidgetMenuClose}>
          <PieChart sx={{ mr: 1 }} fontSize="small" /> Category Breakdown
        </MenuItem>
        <MenuItem onClick={handleAddWidgetMenuClose}>
          <Timeline sx={{ mr: 1 }} fontSize="small" /> Cash Flow Forecast
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default AccountantDashboard