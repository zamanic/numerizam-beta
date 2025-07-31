/**
 * Mock API service to simulate backend interactions
 * In a real application, this would be replaced with actual API calls
 */

// Types
export type User = {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Accountant' | 'Viewer';
  companyId: string;
};

export type Company = {
  id: string;
  name: string;
  createdAt: Date;
  currency: string;
  status: 'active' | 'inactive' | 'pending';
};

export type Transaction = {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  account: string;
  category: string;
};

export type FinancialMetric = {
  id: string;
  name: string;
  value: number;
  previousValue: number;
  change: number;
  trend: number[];
  period: string;
};

// Mock data
const mockUsers: User[] = [
  { id: 'u1', name: 'John Doe', email: 'john@example.com', role: 'Admin', companyId: 'c1' },
  { id: 'u2', name: 'Jane Smith', email: 'jane@example.com', role: 'Accountant', companyId: 'c1' },
  { id: 'u3', name: 'Bob Johnson', email: 'bob@example.com', role: 'Viewer', companyId: 'c1' },
  { id: 'u4', name: 'Alice Williams', email: 'alice@example.com', role: 'Accountant', companyId: 'c2' },
  { id: 'u5', name: 'Charlie Brown', email: 'charlie@example.com', role: 'Admin', companyId: 'c2' },
];

const mockCompanies: Company[] = [
  { id: 'c1', name: 'Acme Corp', createdAt: new Date(2022, 1, 15), currency: 'USD', status: 'active' },
  { id: 'c2', name: 'Globex Inc', createdAt: new Date(2022, 3, 22), currency: 'EUR', status: 'active' },
  { id: 'c3', name: 'Initech LLC', createdAt: new Date(2022, 5, 10), currency: 'GBP', status: 'inactive' },
];

const mockTransactions: Transaction[] = [
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
  {
    id: 't3',
    date: new Date(2023, 5, 18),
    description: 'Monthly rent',
    amount: 1800,
    type: 'debit',
    account: 'Rent Expense',
    category: 'Expense',
  },
  {
    id: 't4',
    date: new Date(2023, 5, 20),
    description: 'Client payment - XYZ Ltd',
    amount: 3500,
    type: 'credit',
    account: 'Accounts Receivable',
    category: 'Revenue',
  },
  {
    id: 't5',
    date: new Date(2023, 5, 22),
    description: 'Utility bill payment',
    amount: 320.45,
    type: 'debit',
    account: 'Utilities Expense',
    category: 'Expense',
  },
];

const mockFinancialMetrics: FinancialMetric[] = [
  {
    id: 'm1',
    name: 'Revenue',
    value: 125000,
    previousValue: 115000,
    change: 0.087,
    trend: [110000, 112000, 118000, 115000, 125000],
    period: 'This Quarter',
  },
  {
    id: 'm2',
    name: 'Expenses',
    value: 78500,
    previousValue: 82000,
    change: -0.043,
    trend: [85000, 83000, 80000, 82000, 78500],
    period: 'This Quarter',
  },
  {
    id: 'm3',
    name: 'Profit',
    value: 46500,
    previousValue: 33000,
    change: 0.409,
    trend: [25000, 29000, 38000, 33000, 46500],
    period: 'This Quarter',
  },
  {
    id: 'm4',
    name: 'Cash Flow',
    value: 35000,
    previousValue: 28000,
    change: 0.25,
    trend: [22000, 25000, 30000, 28000, 35000],
    period: 'This Quarter',
  },
];

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API service
export const api = {
  // Auth
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    await delay(800); // Simulate network delay
    
    const user = mockUsers.find(u => u.email === email);
    if (!user || password !== 'password') { // In a real app, we'd check hashed passwords
      throw new Error('Invalid email or password');
    }
    
    return {
      user,
      token: 'mock-jwt-token',
    };
  },
  
  signup: async (email: string, _password: string, companyName: string): Promise<{ user: User; company: Company; token: string }> => {
    await delay(1000); // Simulate network delay
    
    // Check if user already exists
    if (mockUsers.some(u => u.email === email)) {
      throw new Error('User with this email already exists');
    }
    
    // Create new company
    const newCompany: Company = {
      id: `c${mockCompanies.length + 1}`,
      name: companyName,
      createdAt: new Date(),
      currency: 'USD',
      status: 'active',
    };
    
    // Create new user
    const newUser: User = {
      id: `u${mockUsers.length + 1}`,
      name: email.split('@')[0], // Use part of email as name
      email,
      role: 'Admin', // Default role for new signup
      companyId: newCompany.id,
    };
    
    // In a real app, we would save these to a database
    mockCompanies.push(newCompany);
    mockUsers.push(newUser);
    
    return {
      user: newUser,
      company: newCompany,
      token: 'mock-jwt-token',
    };
  },
  
  completeOnboarding: async (userId: string, role: 'Admin' | 'Accountant' | 'Viewer', currency: string): Promise<{ user: User; company: Company }> => {
    await delay(800); // Simulate network delay
    
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    // Update user role
    mockUsers[userIndex].role = role;
    
    const companyIndex = mockCompanies.findIndex(c => c.id === mockUsers[userIndex].companyId);
    if (companyIndex === -1) {
      throw new Error('Company not found');
    }
    
    // Update company currency
    mockCompanies[companyIndex].currency = currency;
    
    return {
      user: mockUsers[userIndex],
      company: mockCompanies[companyIndex],
    };
  },
  
  // User
  getCurrentUser: async (_token: string): Promise<User> => {
    await delay(500); // Simulate network delay
    
    // In a real app, we would decode the JWT token
    // For this mock, we'll just return the first user
    return mockUsers[0];
  },
  
  // Companies
  getUserCompanies: async (userId: string): Promise<Company[]> => {
    await delay(700); // Simulate network delay
    
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    return mockCompanies.filter(c => c.id === user.companyId);
  },
  
  getCompany: async (companyId: string): Promise<Company> => {
    await delay(500); // Simulate network delay
    
    const company = mockCompanies.find(c => c.id === companyId);
    if (!company) {
      throw new Error('Company not found');
    }
    
    return company;
  },
  
  // Transactions
  getTransactions: async (_companyId: string, filters?: { startDate?: Date; endDate?: Date; account?: string; category?: string }): Promise<Transaction[]> => {
    await delay(800); // Simulate network delay
    
    let filtered = [...mockTransactions];
    
    if (filters) {
      if (filters.startDate) {
        filtered = filtered.filter(t => t.date >= filters.startDate!);
      }
      
      if (filters.endDate) {
        filtered = filtered.filter(t => t.date <= filters.endDate!);
      }
      
      if (filters.account) {
        filtered = filtered.filter(t => t.account === filters.account);
      }
      
      if (filters.category) {
        filtered = filtered.filter(t => t.category === filters.category);
      }
    }
    
    return filtered;
  },
  
  addTransaction: async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
    await delay(800); // Simulate network delay
    
    const newTransaction: Transaction = {
      ...transaction,
      id: `t${mockTransactions.length + 1}`,
    };
    
    mockTransactions.push(newTransaction);
    
    return newTransaction;
  },
  
  // Financial Metrics
  getFinancialMetrics: async (_companyId: string, period: string): Promise<FinancialMetric[]> => {
    await delay(900); // Simulate network delay
    
    // In a real app, we would filter by company ID and period
    return mockFinancialMetrics.map(metric => ({
      ...metric,
      period,
    }));
  },
  
  getFinancialHealthScore: async (_companyId: string): Promise<{ score: number; summary: string }> => {
    await delay(1200); // Simulate network delay
    
    // In a real app, this would be calculated based on various financial metrics
    return {
      score: 85,
      summary: 'Your company is in good financial health with strong revenue growth and improving profit margins. Consider optimizing cash flow management to further strengthen your position.',
    };
  },
};