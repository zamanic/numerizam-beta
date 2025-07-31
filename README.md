# Numerizam - AI-Powered Accounting Platform

Numerizam is a highly interactive, multi-tenant, AI-powered accounting platform with modular dashboards, predictive data entry, and seamless backend integration. The platform features natural language query processing powered by LangGraph AI agents for intuitive transaction entry and financial data management.

## 🚀 Features

### Core Functionality
- **Natural Language Transaction Processing** - Enter transactions using plain English
- **AI-Powered Query Interface** - Ask questions about your financial data in natural language
- **Multi-tenant Architecture** - Support for multiple companies and users
- **Real-time Data Processing** - Instant transaction validation and recording
- **Comprehensive Chart of Accounts** - Standardized accounting structure

### Frontend Features
- **Modern React UI** with TypeScript and Vite
- **Responsive Design** with Material-UI components
- **Interactive Dashboards** with real-time data visualization
- **Role-based Access Control** - Different views for admins, accountants, and users
- **Dark/Light Mode** toggle for user preference

### Backend Features
- **Django REST API** with comprehensive endpoints
- **LangGraph AI Integration** - Advanced natural language processing
- **SQLite Database** with Django ORM
- **Authentication & Authorization** - Secure user management
- **API Documentation** - Well-documented REST endpoints

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Material-UI (MUI)** for component library
- **React Router** for navigation
- **Recharts** for data visualization
- **Framer Motion** for animations

### Backend Stack
- **Django 4.x** with Django REST Framework
- **LangGraph** for AI-powered query processing
- **SQLite** database (easily configurable for PostgreSQL)
- **Python 3.8+** runtime environment

## 📁 Project Structure

```
numerizam/
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── pages/             # Main application pages
│   ├── services/          # API services and utilities
│   ├── utils/             # Helper functions
│   └── types/             # TypeScript definitions
├── backend/               # Django backend application
│   ├── accounting/        # Main Django app
│   │   ├── models.py      # Database models
│   │   ├── api_views.py   # REST API endpoints
│   │   ├── langgraph_*.py # AI agent implementations
│   │   └── serializers.py # API serializers
│   ├── numerizam_project/ # Django project settings
│   └── manage.py          # Django management script
├── supabase/              # Supabase edge functions (optional)
└── docs/                  # Documentation files
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or later)
- **Python** (v3.8 or later)
- **npm** or **yarn**
- **pip** (Python package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/numerizam.git
   cd numerizam
   ```

2. **Setup Backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py createsuperuser
   python manage.py runserver
   ```

3. **Setup Frontend** (in a new terminal)
   ```bash
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:8000`
   - Django Admin: `http://localhost:8000/admin`

### Environment Configuration

Create `.env` files in both root and backend directories:

**Root `.env`:**
```env
VITE_API_BASE_URL=http://localhost:8000
```

**Backend `.env`:**
```env
DEBUG=True
SECRET_KEY=your-secret-key-here
LANGCHAIN_TRACING_V2=false
```

## 🤖 AI Features

### Natural Language Query Processing
The platform uses LangGraph AI agents to process natural language queries such as:
- "Record a $500 office supplies purchase paid with cash"
- "Show me all transactions for last month"
- "Create a journal entry for rent payment"

### Supported Transaction Types
- Revenue recognition
- Expense recording
- Asset purchases
- Liability management
- Equity transactions

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
npm run test
```

## 📚 API Documentation

The backend provides comprehensive REST API endpoints:

- `/api/companies/` - Company management
- `/api/chart-of-accounts/` - Chart of accounts
- `/api/journal-entries/` - Transaction entries
- `/api/ai/process-query/` - Natural language processing
- `/api/general-ledger/` - General ledger data

## 🔧 Development

### Running in Development Mode

1. **Start Backend Server:**
   ```bash
   cd backend
   python manage.py runserver
   ```

2. **Start Frontend Development Server:**
   ```bash
   npm run dev
   ```

### Building for Production

```bash
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies and AI-powered natural language processing
- Designed for financial professionals who value efficiency and accuracy
- Inspired by the need for intuitive accounting software that understands human language