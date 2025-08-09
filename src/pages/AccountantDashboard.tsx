import { useState, useEffect } from 'react'
import { Box, Typography, Paper, Card, CardContent, CardHeader, IconButton, Button, Menu, MenuItem, Divider, Tabs, Tab, useTheme, useMediaQuery } from '@mui/material'
import { MoreVert, Add, ArrowUpward, ArrowDownward, BarChart, PieChart, ShowChart, Timeline, Dashboard, DataUsage, Assessment as ReportIcon } from '@mui/icons-material'
import { Responsive, WidthProvider } from 'react-grid-layout'
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, Legend } from 'recharts'

// Import react-grid-layout CSS
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

// Context
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import LiveDataDashboard from '../components/LiveDataDashboard'
import IncomeStatementGenerator from '../components/IncomeStatementGenerator'

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
  const { user } = useAuth()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))
  
  const [loading, setLoading] = useState(true)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [widgetMenuId, setWidgetMenuId] = useState<string | null>(null)
  const [addWidgetAnchorEl, setAddWidgetAnchorEl] = useState<null | HTMLElement>(null)
  const [currentTab, setCurrentTab] = useState(0)
  
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
      { i: 'revenue', x: 0, y: 0, w: 3, h: 1, minW: 2, minH: 1 },
      { i: 'expenses', x: 3, y: 0, w: 3, h: 1, minW: 2, minH: 1 },
      { i: 'profit', x: 6, y: 0, w: 3, h: 1, minW: 2, minH: 1 },
      { i: 'cashflow', x: 9, y: 0, w: 3, h: 1, minW: 2, minH: 1 },
      { i: 'revenue-chart', x: 0, y: 1, w: 6, h: 3, minW: 4, minH: 2 },
      { i: 'profit-chart', x: 6, y: 1, w: 6, h: 3, minW: 4, minH: 2 },
      { i: 'category-breakdown', x: 0, y: 4, w: 6, h: 3, minW: 4, minH: 2 },
      { i: 'health-score', x: 6, y: 4, w: 6, h: 2, minW: 4, minH: 1 },
    ],
    md: [
      { i: 'revenue', x: 0, y: 0, w: 3, h: 1, minW: 2, minH: 1 },
      { i: 'expenses', x: 3, y: 0, w: 3, h: 1, minW: 2, minH: 1 },
      { i: 'profit', x: 6, y: 0, w: 3, h: 1, minW: 2, minH: 1 },
      { i: 'cashflow', x: 9, y: 0, w: 3, h: 1, minW: 2, minH: 1 },
      { i: 'revenue-chart', x: 0, y: 1, w: 6, h: 3, minW: 4, minH: 2 },
      { i: 'profit-chart', x: 6, y: 1, w: 6, h: 3, minW: 4, minH: 2 },
      { i: 'category-breakdown', x: 0, y: 4, w: 6, h: 3, minW: 4, minH: 2 },
      { i: 'health-score', x: 6, y: 4, w: 6, h: 2, minW: 4, minH: 1 },
    ],
    sm: [
      { i: 'revenue', x: 0, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
      { i: 'expenses', x: 3, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
      { i: 'profit', x: 0, y: 2, w: 3, h: 2, minW: 2, minH: 2 },
      { i: 'cashflow', x: 3, y: 2, w: 3, h: 2, minW: 2, minH: 2 },
      { i: 'revenue-chart', x: 0, y: 4, w: 6, h: 4, minW: 4, minH: 3 },
      { i: 'profit-chart', x: 0, y: 8, w: 6, h: 4, minW: 4, minH: 3 },
      { i: 'category-breakdown', x: 0, y: 12, w: 6, h: 4, minW: 4, minH: 3 },
      { i: 'health-score', x: 0, y: 16, w: 6, h: 2, minW: 4, minH: 2 },
    ],
    xs: [
      { i: 'revenue', x: 0, y: 0, w: 4, h: 3, minW: 4, minH: 3 },
      { i: 'expenses', x: 0, y: 3, w: 4, h: 3, minW: 4, minH: 3 },
      { i: 'profit', x: 0, y: 6, w: 4, h: 3, minW: 4, minH: 3 },
      { i: 'cashflow', x: 0, y: 9, w: 4, h: 3, minW: 4, minH: 3 },
      { i: 'revenue-chart', x: 0, y: 12, w: 4, h: 5, minW: 4, minH: 4 },
      { i: 'profit-chart', x: 0, y: 17, w: 4, h: 5, minW: 4, minH: 4 },
      { i: 'category-breakdown', x: 0, y: 22, w: 4, h: 5, minW: 4, minH: 4 },
      { i: 'health-score', x: 0, y: 27, w: 4, h: 4, minW: 4, minH: 3 },
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

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue)
  }

  // Render KPI widget with improved mobile responsiveness
  const renderKpiWidget = (widget: Widget) => {
    const { data } = widget
    const isPositive = data.trend === 'up'
    
    return (
      <Box sx={{ 
        p: isMobile ? 2 : 2, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        minHeight: isMobile ? 180 : 140,
        overflow: 'hidden'
      }}>
        <Typography 
          variant={isMobile ? "body1" : "subtitle2"} 
          color="text.secondary" 
          sx={{ 
            mb: 1,
            fontSize: isMobile ? '1rem' : '0.875rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {widget.title}
        </Typography>
        <Typography 
          variant={isMobile ? "h4" : "h4"} 
          component="div" 
          sx={{ 
            fontWeight: 'bold',
            mb: 1.5,
            fontSize: isMobile ? '1.75rem' : '1.5rem',
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: 'primary.main'
          }}
        >
          ${data.value.toLocaleString()}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {isPositive ? (
            <ArrowUpward sx={{ 
              color: 'success.main', 
              fontSize: isMobile ? '1.25rem' : '1.25rem' 
            }} />
          ) : (
            <ArrowDownward sx={{ 
              color: 'error.main', 
              fontSize: isMobile ? '1.25rem' : '1.25rem' 
            }} />
          )}
          <Typography 
            variant={isMobile ? "body2" : "body2"} 
            color={isPositive ? 'success.main' : 'error.main'}
            sx={{ 
              fontWeight: 600,
              fontSize: isMobile ? '0.875rem' : '0.875rem'
            }}
          >
            {Math.abs(data.change)}%
          </Typography>
        </Box>
      </Box>
    )
  }

  // Render bar chart widget with improved mobile responsiveness
  const renderBarChartWidget = (widget: Widget) => {
    return (
      <Box sx={{ 
        height: '100%', 
        width: '100%', 
        minHeight: isMobile ? 200 : 250,
        p: 1 
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={widget.data} margin={{ 
            top: 20, 
            right: isMobile ? 5 : 30, 
            left: isMobile ? 5 : 20, 
            bottom: 5 
          }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              fontSize={isMobile ? 10 : 12}
              angle={isMobile ? -45 : 0}
              textAnchor={isMobile ? 'end' : 'middle'}
              height={isMobile ? 60 : 30}
            />
            <YAxis 
              fontSize={isMobile ? 10 : 12}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <RechartsTooltip formatter={(value) => [`$${value}`, 'Revenue']} />
            <Bar dataKey="value" fill="#8884d8" />
          </RechartsBarChart>
        </ResponsiveContainer>
      </Box>
    )
  }

  // Render line chart widget with improved mobile responsiveness
  const renderLineChartWidget = (widget: Widget) => {
    return (
      <Box sx={{ 
        height: '100%', 
        width: '100%', 
        minHeight: isMobile ? 200 : 250,
        p: 1 
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={widget.data} margin={{ 
            top: 20, 
            right: isMobile ? 5 : 30, 
            left: isMobile ? 5 : 20, 
            bottom: 5 
          }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              fontSize={isMobile ? 10 : 12}
              angle={isMobile ? -45 : 0}
              textAnchor={isMobile ? 'end' : 'middle'}
              height={isMobile ? 60 : 30}
            />
            <YAxis 
              fontSize={isMobile ? 10 : 12}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <RechartsTooltip formatter={(value) => [`$${value}`, 'Profit']} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#82ca9d" 
              strokeWidth={2} 
              dot={{ r: isMobile ? 3 : 4 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    )
  }

  // Render Pie Chart widget with improved mobile responsiveness and labels
  const renderPieChartWidget = (widget: Widget) => {
    const data = widget.data
    
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
      const RADIAN = Math.PI / 180
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5
      const x = cx + radius * Math.cos(-midAngle * RADIAN)
      const y = cy + radius * Math.sin(-midAngle * RADIAN)

      return (
        <text 
          x={x} 
          y={y} 
          fill="white" 
          textAnchor={x > cx ? 'start' : 'end'} 
          dominantBaseline="central"
          fontSize={isMobile ? 12 : 14}
          fontWeight="bold"
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      )
    }

    return (
      <Box sx={{ 
        height: '100%', 
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: isMobile ? 300 : 250,
        p: 1
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={isMobile ? 80 : 100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((_entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip 
              formatter={(value: any) => [`${value}%`, 'Percentage']}
            />
            <Legend 
              wrapperStyle={{
                fontSize: isMobile ? '12px' : '14px',
                paddingTop: '10px'
              }}
            />
          </RechartsPieChart>
        </ResponsiveContainer>
      </Box>
    )
  }

  // Render health score widget with improved mobile responsiveness
  const renderHealthScoreWidget = (widget: Widget) => {
    const { data } = widget
    return (
      <Box sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        p: isMobile ? 1.5 : 2,
        minHeight: isMobile ? 120 : 140
      }}>
        <Typography 
          variant={isMobile ? "body2" : "h6"} 
          color="textSecondary" 
          gutterBottom
          sx={{ fontSize: isMobile ? '0.875rem' : '1.25rem' }}
        >
          {widget.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box
            sx={{
              width: isMobile ? 50 : 60,
              height: isMobile ? 50 : 60,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: data.score >= 80 ? 'success.main' : data.score >= 60 ? 'warning.main' : 'error.main',
              color: 'white',
              fontWeight: 'bold',
              mr: 2,
              fontSize: isMobile ? '0.75rem' : '0.875rem'
            }}
          >
            {data.score}/100
          </Box>
          <Typography 
            variant={isMobile ? "body2" : "body1"}
            sx={{ fontSize: isMobile ? '0.75rem' : '1rem' }}
          >
            {data.summary}
          </Typography>
        </Box>
        <Typography 
          variant="caption" 
          color="textSecondary"
          sx={{ fontSize: isMobile ? '0.6rem' : '0.75rem' }}
        >
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
        <LoadingSpinner type="gradient" size="large" message="Loading dashboard..." />
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', pb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {user?.currentCompany?.name || 'Company'} Dashboard
        </Typography>
        {currentTab === 0 && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleAddWidgetMenuOpen}
          >
            Add Widget
          </Button>
        )}
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="dashboard tabs">
          <Tab icon={<Dashboard />} label="Demo Dashboard" />
          <Tab icon={<DataUsage />} label="Live Data Dashboard" />
          <Tab icon={<ReportIcon />} label="Income Statement" />
        </Tabs>
      </Box>

      {currentTab === 0 ? (
        <Paper sx={{ p: 0, borderRadius: 2, minHeight: '80vh' }}>
          <ResponsiveGridLayout
            className="layout"
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
            cols={{ lg: 12, md: 12, sm: 6, xs: 4 }}
            rowHeight={isMobile ? 80 : 120}
            onLayoutChange={handleLayoutChange}
            isDraggable
            isResizable
            containerPadding={[16, 16]}
            margin={[16, 16]}
            compactType="vertical"
            preventCollision={false}
            style={{ position: 'relative', zIndex: 1, minHeight: '100%' }}
          >
            {widgets.map((widget) => (
              <Box key={widget.id} sx={{ width: '100%', height: '100%' }}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  minHeight: isMobile ? 200 : 140,
                  boxShadow: 2,
                  '&:hover': {
                    boxShadow: 4,
                  }
                }}>
                  {widget.type !== 'kpi' && (
                    <>
                      <CardHeader
                        title={widget.title}
                        titleTypographyProps={{ 
                          variant: isMobile ? 'body2' : 'subtitle1',
                          sx: { 
                            fontSize: isMobile ? '0.75rem' : '1rem',
                            fontWeight: 600
                          }
                        }}
                        sx={{ py: isMobile ? 0.5 : 1, px: isMobile ? 1 : 2, minHeight: isMobile ? 36 : 48 }}
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
                    </>
                  )}
                  <CardContent sx={{ 
                    p: widget.type === 'kpi' ? 0 : (isMobile ? 0.5 : 1), 
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative'
                  }}>
                    <IconButton
                      aria-label="widget menu"
                      size="small"
                      onClick={(e) => handleWidgetMenuOpen(e, widget.id)}
                      sx={{ 
                        position: 'absolute', 
                        top: isMobile ? 4 : 8, 
                        right: isMobile ? 4 : 8, 
                        zIndex: 1,
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.05)' 
                          : 'rgba(0, 0, 0, 0.04)',
                        border: theme.palette.mode === 'dark' 
                          ? '1px solid rgba(255, 255, 255, 0.12)' 
                          : '1px solid rgba(0, 0, 0, 0.12)',
                        borderRadius: '4px',
                        width: '24px',
                        height: '24px',
                        '&:hover': {
                          backgroundColor: theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.08)' 
                            : 'rgba(0, 0, 0, 0.08)',
                        }
                      }}
                    >
                      <MoreVert 
                        fontSize="small" 
                        sx={{ 
                          color: theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.7)' 
                            : 'rgba(0, 0, 0, 0.6)',
                          fontSize: '16px'
                        }} 
                      />
                    </IconButton>
                    {renderWidget(widget)}
                  </CardContent>
                </Card>
              </Box>
            ))}
          </ResponsiveGridLayout>
        </Paper>
      ) : currentTab === 1 ? (
        <Box sx={{ minHeight: '80vh' }}>
          <LiveDataDashboard />
        </Box>
      ) : (
        <Box sx={{ minHeight: '80vh' }}>
          <IncomeStatementGenerator />
        </Box>
      )}

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