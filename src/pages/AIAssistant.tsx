import React, { useState, useRef, useEffect } from 'react';
import {
  Typography,
  Paper,
  Container,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
} from '@mui/material';
import {
  Send,
  SmartToy,
  Person,
  ExpandMore,
  AccountBalance,
  TrendingUp,
  Receipt,
  Calculate,
  Help,
  Lightbulb,
  AutoAwesome,
  Clear,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
}

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI Accounting Assistant. I can help you with transaction processing, financial analysis, report generation, and answering accounting questions. How can I assist you today?',
      timestamp: new Date(),
      suggestions: [
        'Process a sales transaction',
        'Generate a profit & loss report',
        'Explain double-entry bookkeeping',
        'Help with chart of accounts setup'
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActions: QuickAction[] = [
    {
      title: 'Transaction Processing',
      description: 'Process sales, purchases, and journal entries',
      icon: <Receipt color="primary" />,
      action: 'I need help processing a transaction'
    },
    {
      title: 'Financial Reports',
      description: 'Generate P&L, balance sheet, and custom reports',
      icon: <TrendingUp color="primary" />,
      action: 'Generate a financial report'
    },
    {
      title: 'Account Setup',
      description: 'Set up chart of accounts and company structure',
      icon: <AccountBalance color="primary" />,
      action: 'Help me set up my chart of accounts'
    },
    {
      title: 'Calculations',
      description: 'Financial calculations and ratio analysis',
      icon: <Calculate color="primary" />,
      action: 'Help me with financial calculations'
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response (in a real app, this would call the AI service)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateAIResponse(inputValue),
        timestamp: new Date(),
        suggestions: generateSuggestions(inputValue)
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const generateAIResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('transaction') || lowerInput.includes('entry')) {
      return 'I can help you process transactions! For transaction processing, I need details like:\n\n• Date of transaction\n• Description\n• Accounts involved\n• Amounts (debit/credit)\n• Supporting documents\n\nWould you like to use the Query Page for natural language transaction processing, or would you prefer to enter the details manually?';
    }
    
    if (lowerInput.includes('report') || lowerInput.includes('p&l') || lowerInput.includes('balance sheet')) {
      return 'I can help generate various financial reports:\n\n• Profit & Loss Statement\n• Balance Sheet\n• Cash Flow Statement\n• Trial Balance\n• Custom Reports\n\nWhat type of report would you like to generate? Please specify the date range and any filters you need.';
    }
    
    if (lowerInput.includes('chart of accounts') || lowerInput.includes('setup')) {
      return 'Setting up a chart of accounts is crucial for proper bookkeeping. Here\'s what I recommend:\n\n• Assets (1000-1999): Cash, Accounts Receivable, Inventory\n• Liabilities (2000-2999): Accounts Payable, Loans\n• Equity (3000-3999): Owner\'s Equity, Retained Earnings\n• Revenue (4000-4999): Sales, Service Revenue\n• Expenses (5000-5999): Operating Expenses\n\nWould you like me to help you create specific accounts for your business?';
    }
    
    if (lowerInput.includes('calculate') || lowerInput.includes('ratio')) {
      return 'I can help with various financial calculations:\n\n• Financial Ratios (Liquidity, Profitability, Leverage)\n• Depreciation Calculations\n• Interest Calculations\n• Tax Calculations\n• Break-even Analysis\n\nWhat specific calculation do you need help with?';
    }
    
    return 'I understand you need assistance with accounting. I can help with:\n\n• Transaction processing and journal entries\n• Financial report generation\n• Chart of accounts setup\n• Financial calculations and analysis\n• Accounting principles and best practices\n\nCould you provide more specific details about what you\'d like to accomplish?';
  };

  const generateSuggestions = (input: string): string[] => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('transaction')) {
      return [
        'Go to Query Page for natural language processing',
        'Show me transaction templates',
        'Explain double-entry bookkeeping'
      ];
    }
    
    if (lowerInput.includes('report')) {
      return [
        'Generate this month\'s P&L',
        'Show balance sheet as of today',
        'Create custom date range report'
      ];
    }
    
    return [
      'Show me quick actions',
      'Explain accounting basics',
      'Help with specific calculation'
    ];
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const clearChat = () => {
    setMessages([messages[0]]); // Keep the initial welcome message
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Quick Actions Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, height: 'fit-content', mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AutoAwesome sx={{ mr: 1 }} />
              Quick Actions
            </Typography>
            <List>
              {quickActions.map((action, index) => (
                <ListItem
                  key={index}
                  button
                  onClick={() => handleQuickAction(action.action)}
                  sx={{ 
                    borderRadius: 1, 
                    mb: 1,
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <ListItemIcon>{action.icon}</ListItemIcon>
                  <ListItemText
                    primary={action.title}
                    secondary={action.description}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Help Section */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Help sx={{ mr: 1 }} />
              Tips
            </Typography>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="body2">How to ask questions</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="caption">
                  Be specific about what you need. Include dates, amounts, and account names when relevant.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="body2">Transaction processing</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="caption">
                  Use natural language like "Record a $500 sale to ABC Company on January 15th"
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Paper>
        </Grid>

        {/* Main Chat Interface */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
            {/* Chat Header */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <SmartToy />
                </Avatar>
                <Box>
                  <Typography variant="h6">AI Accounting Assistant</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Powered by advanced AI • Always available
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={clearChat} title="Clear chat">
                <Clear />
              </IconButton>
            </Box>

            {/* Messages Area */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                        mb: 2
                      }}
                    >
                      <Card
                        sx={{
                          maxWidth: '70%',
                          bgcolor: message.type === 'user' ? 'primary.main' : 'background.paper',
                          color: message.type === 'user' ? 'primary.contrastText' : 'text.primary'
                        }}
                      >
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                            <Avatar
                              sx={{
                                width: 24,
                                height: 24,
                                mr: 1,
                                bgcolor: message.type === 'user' ? 'primary.dark' : 'secondary.main'
                              }}
                            >
                              {message.type === 'user' ? <Person fontSize="small" /> : <SmartToy fontSize="small" />}
                            </Avatar>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                              {message.content}
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>
                            {message.timestamp.toLocaleTimeString()}
                          </Typography>
                          
                          {/* Suggestions */}
                          {message.suggestions && message.suggestions.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                                Suggested actions:
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {message.suggestions.map((suggestion, index) => (
                                  <Chip
                                    key={index}
                                    label={suggestion}
                                    size="small"
                                    variant="outlined"
                                    clickable
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    sx={{ fontSize: '0.75rem' }}
                                  />
                                ))}
                              </Box>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Box>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                  <Card sx={{ bgcolor: 'background.paper' }}>
                    <CardContent sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ mr: 2 }}>
                        <LoadingSpinner type="dots" size="small" />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        AI is thinking...
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              )}
              
              <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={3}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask me anything about accounting, transactions, reports, or financial analysis..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isLoading}
                />
                <Button
                  variant="contained"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  sx={{ minWidth: 'auto', px: 2 }}
                >
                  <Send />
                </Button>
              </Box>
              
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="caption">
                  <Lightbulb sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                  Pro tip: For actual transaction processing, use the Query Page for natural language processing with real AI integration.
                </Typography>
              </Alert>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AIAssistant;