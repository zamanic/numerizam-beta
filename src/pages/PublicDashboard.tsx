import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Grid, Card, CardContent, Typography, Button, Box, AppBar, Toolbar, IconButton, useTheme } from '@mui/material'
import { Brightness4, Brightness7, TrendingUp, AccountBalance, ShowChart, ArrowUpward, ArrowDownward } from '@mui/icons-material'
import { motion } from 'framer-motion'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

// Context
import { useContext } from 'react'
import { ThemeContext } from '../context/ThemeContext'

// Mock data for KPI cards
const kpiData = [
  {
    title: 'Average Profit Margin',
    value: 24.8,
    change: 3.2,
    trend: 'up',
    data: [
      { name: 'Q1', value: 20.1 },
      { name: 'Q2', value: 21.5 },
      { name: 'Q3', value: 23.2 },
      { name: 'Q4', value: 24.8 },
    ],
  },
  {
    title: 'Industry Revenue Growth',
    value: 12.5,
    change: -1.8,
    trend: 'down',
    data: [
      { name: 'Q1', value: 15.2 },
      { name: 'Q2', value: 14.8 },
      { name: 'Q3', value: 13.7 },
      { name: 'Q4', value: 12.5 },
    ],
  },
  {
    title: 'Average Cash Flow',
    value: 42.3,
    change: 5.7,
    trend: 'up',
    data: [
      { name: 'Q1', value: 35.1 },
      { name: 'Q2', value: 37.8 },
      { name: 'Q3', value: 40.2 },
      { name: 'Q4', value: 42.3 },
    ],
  },
  {
    title: 'Debt-to-Equity Ratio',
    value: 1.2,
    change: -0.3,
    trend: 'down',
    data: [
      { name: 'Q1', value: 1.6 },
      { name: 'Q2', value: 1.5 },
      { name: 'Q3', value: 1.3 },
      { name: 'Q4', value: 1.2 },
    ],
  },
]

const PublicDashboard = () => {
  const { darkMode, toggleTheme } = useContext(ThemeContext)
  const navigate = useNavigate()
  const theme = useTheme()
  const [counters, setCounters] = useState<number[]>(kpiData.map(() => 0))

  // Animate counters on load
  useEffect(() => {
    const interval = setInterval(() => {
      setCounters((prev) =>
        prev.map((count, index) => {
          const target = kpiData[index].value
          if (count >= target) return target
          return count + target / 50
        })
      )
    }, 20)

    return () => clearInterval(interval)
  }, [])

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Public Navbar */}
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Numerizam
          </Typography>
          <Button color="inherit" onClick={() => navigate('/login')} sx={{ mr: 2 }}>
            Login
          </Button>
          <Button variant="contained" color="primary" onClick={() => navigate('/signup')}>
            Sign Up
          </Button>
          <IconButton sx={{ ml: 2 }} onClick={toggleTheme} color="inherit">
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          py: 8,
          textAlign: 'center',
          background: darkMode
            ? 'linear-gradient(180deg, rgba(25,25,25,1) 0%, rgba(40,40,40,1) 100%)'
            : 'linear-gradient(180deg, rgba(245,245,245,1) 0%, rgba(255,255,255,1) 100%)',
        }}
      >
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
              AI-Powered Accounting
            </Typography>
            <Typography variant="h5" color="textSecondary" paragraph>
              Transform your financial data into actionable insights with our intelligent accounting platform.
            </Typography>
            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => navigate('/login?demo=true')}
                sx={{ mr: 2, px: 4, py: 1.5, borderRadius: 2 }}
              >
                Explore Demo Dashboard
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                onClick={() => navigate('/signup')}
                sx={{ px: 4, py: 1.5, borderRadius: 2 }}
              >
                Start Free Trial
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* KPI Dashboard Preview */}
      <Box sx={{ py: 8 }}>
        <Container>
          <Typography variant="h4" component="h2" gutterBottom textAlign="center" sx={{ mb: 4 }}>
            Industry Financial Insights
          </Typography>

          <Grid container spacing={3}>
            {kpiData.map((kpi, index) => (
              <Grid item xs={12} sm={6} md={3} key={kpi.title}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card
                    elevation={3}
                    sx={{
                      height: '100%',
                      borderRadius: 2,
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)',
                      },
                    }}
                  >
                    <CardContent>
                      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                        {kpi.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
                        <Typography variant="h4" component="div" fontWeight="bold">
                          {counters[index].toFixed(1)}%
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            ml: 1,
                            color: kpi.trend === 'up' ? 'success.main' : 'error.main',
                          }}
                        >
                          {kpi.trend === 'up' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
                          <Typography variant="body2" sx={{ ml: 0.5 }}>
                            {Math.abs(kpi.change).toFixed(1)}%
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        vs. Last Quarter
                      </Typography>

                      {/* Mini chart */}
                      <Box sx={{ height: 60 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={kpi.data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke={kpi.trend === 'up' ? theme.palette.success.main : theme.palette.error.main}
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Feature highlights */}
          <Box sx={{ mt: 8 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <TrendingUp sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Predictive Analytics
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      AI-powered forecasting helps you anticipate financial trends and make proactive decisions.
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
              <Grid item xs={12} md={4}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <AccountBalance sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Multi-Tenant Architecture
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Securely manage multiple companies with isolated data and customized reporting.
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
              <Grid item xs={12} md={4}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <ShowChart sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Customizable Dashboards
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Build your perfect financial command center with drag-and-drop widgets and interactive charts.
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            </Grid>
          </Box>

          {/* CTA */}
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Typography variant="h5" gutterBottom>
                Ready to transform your financial management?
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => navigate('/signup')}
                sx={{ mt: 2, px: 4, py: 1.5, borderRadius: 2 }}
              >
                Get Started Today
              </Button>
            </motion.div>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 4,
          mt: 'auto',
          backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)',
        }}
      >
        <Container>
          <Typography variant="body2" color="textSecondary" align="center">
            © {new Date().getFullYear()} Numerizam. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  )
}

export default PublicDashboard