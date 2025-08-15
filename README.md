# Numerizam - AI-Powered Accounting Platform

Numerizam is a highly interactive, multi-tenant, AI-powered accounting platform with modular dashboards, predictive data entry, and seamless backend integration. The platform features natural language query processing powered by LangGraph AI agents for intuitive transaction entry and financial data management.

## Application Prompt for Recreation

**If you need to recreate this application, use this comprehensive prompt:**

### Core Application Requirements

Create a full-stack accounting system called "Numerizam" with the following specifications:

**Frontend (React + TypeScript + Vite):**
- Modern React 18 application with TypeScript for type safety
- Vite build system for fast development and optimized production builds
- Material-UI components combined with Tailwind CSS for styling flexibility
- Multi-page application with React Router navigation
- Key pages: Dashboard, OCR Upload, Transaction Management, Financial Reports
- Real-time data visualization using Recharts for financial analytics
- Responsive design supporting desktop and mobile devices
- Framer Motion for smooth animations and transitions

**Backend (Django + PostgreSQL):**
- Django 4.2 with Django REST Framework for robust API development
- PostgreSQL database with proper indexing and relationships
- Comprehensive data models: Companies, ChartOfAccounts, Territories, Calendar, GeneralLedger, JournalEntries
- Advanced filtering capabilities using django-filter
- Custom analytics endpoints for financial reporting
- CORS configuration for frontend-backend communication

**AI & Document Processing Integration:**
- OCR functionality for document text extraction from uploaded files (PDF, images)
- Mistral AI integration for intelligent document analysis and data extraction
- LangGraph workflow orchestration for complex AI processing pipelines
- Automated field mapping from extracted OCR data to accounting form fields
- Support for various document formats with robust error handling

**Key Features to Implement:**
1. **Multi-company Support**: Complete data isolation between different companies
2. **Chart of Accounts Management**: Hierarchical account structure with flexible categorization
3. **OCR Document Processing**: AI-powered document analysis and data extraction
4. **Transaction Management**: Double-entry bookkeeping with confirmation workflows
5. **Territory-based Tracking**: Geographic financial data organization
6. **Advanced Analytics**: P&L statements, Balance Sheets, monthly analysis reports
7. **Real-time Updates**: Live data synchronization between frontend and backend

### Development Process & Key Solutions

**Major Issues Encountered and Solutions:**

1. **OCR and AI Integration Challenges**
   - **Problem**: Complex integration between Mistral AI, OCR processing, and form field mapping
   - **Solution**: Implemented robust field mapping system with enhanced error handling and timeout management
   - **Implementation**: Created `mistralAiService.ts` with JSON extraction, `OCRUpload.tsx` with dynamic form handling

2. **Document Processing Pipeline**
   - **Problem**: Handling various document formats (PDF, images) and extracting structured data
   - **Solution**: Multi-layered processing with OCR fallback and AI enhancement
   - **Key Changes**: PDF text extraction, image OCR, AI-powered data structuring

3. **Data Structure Alignment**
   - **Problem**: Mismatch between TypeScript interfaces and actual database schema
   - **Solution**: Updated Django models to include all required fields and synchronized with frontend interfaces
   - **Files Updated**: `models.py`, TypeScript interface definitions, API serializers

4. **Field Mapping and Form Population**
   - **Problem**: Extracted OCR data not properly mapped to UI form fields
   - **Solution**: Implemented intelligent field mapping with fallback mechanisms and validation
   - **Implementation**: Dynamic form field population, data validation, error handling for missing fields

**Technology Stack & Tools Used:**
- **Frontend**: React 18, TypeScript, Vite, Material-UI (@mui/material), Tailwind CSS, React Router, Recharts, Framer Motion
- **Backend**: Django 4.2, Django REST Framework, PostgreSQL with proper indexing
- **AI/ML**: Mistral AI (@mistralai/mistralai), LangGraph (@langchain/core), OCR processing for document analysis
- **Development Tools**: ESLint, Prettier, Django testing framework
- **Database**: PostgreSQL with proper indexing and relationships (configurable for SQLite)

**API Architecture:**
- RESTful API design with comprehensive endpoints
- Natural language processing endpoints for AI-powered queries
- Advanced filtering and search capabilities
- Custom analytics endpoints for financial reporting
- Proper error handling and validation

**Security Implementation:**
- Authentication-protected endpoints
- Company-based data isolation
- Input validation and sanitization
- SQL injection protection through Django ORM
- CORS configuration for secure cross-origin requests

**Performance Optimizations:**
- Database indexing on frequently queried fields
- Query optimization using select_related and prefetch_related
- Response caching for frequently accessed data
- Efficient state management in React components

### File Structure to Create:
```
numerizam/
├── backend/
│   ├── accounting/          # Main Django app
│   │   ├── models.py       # Database models (Companies, ChartOfAccounts, etc.)
│   │   ├── api_views.py    # REST API endpoints
│   │   ├── langgraph_*.py  # AI agent implementations
│   │   └── serializers.py  # API serializers
│   ├── numerizam_project/  # Django project settings
│   ├── requirements.txt    # Python dependencies
│   └── manage.py
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── pages/             # Main application pages
│   │   ├── Dashboard.tsx   # Financial dashboard
│   │   ├── OCRUpload.tsx   # OCR document upload and processing
│   │   ├── Transactions.tsx # Transaction management
│   │   └── Reports.tsx     # Financial reports
│   ├── services/          # API services and utilities
│   │   ├── api.ts         # API communication
│   │   ├── mistralAiService.ts # Mistral AI integration
│   │   ├── ocrService.ts  # OCR processing
│   │   └── authService.ts # Authentication
│   ├── utils/             # Helper functions
│   ├── types/             # TypeScript definitions
│   ├── stores/            # Zustand state management
│   │   └── ocrStore.ts    # OCR-specific state
│   └── hooks/             # Custom React hooks
│       └── useOCRQuery.ts # OCR data fetching
├── supabase/              # Supabase edge functions (optional)
├── package.json           # Node dependencies
└── docs/                  # Documentation files
```

**Testing Strategy:**
- Comprehensive backend API testing
- Frontend component testing (OCR processing, AI integration)
- Integration testing for document processing workflows
- OCR extraction and AI data mapping accuracy testing

**Environment Configuration:**
- Separate development and production configurations
- Environment variables for API keys and database settings
- LangChain tracing configuration for AI debugging

**Deployment Considerations:**
- Environment-specific configuration
- Database migration scripts
- Static file serving
- AI service integration and API key management
- Monitoring and logging setup

This prompt captures the complete application architecture, development challenges, and solutions implemented during the creation of the Numerizam AI-powered accounting platform.

---

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

### **Environment Configuration:**

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

### Supabase Database Configuration

**Database Structure & Schema:**

The Numerizam application uses Supabase PostgreSQL with the following core tables:

```sql
-- Core Authentication & User Management
auth.users                    -- Supabase built-in authentication
user_profiles                 -- Extended user information
  ├── id (uuid, PK, FK to auth.users)
  ├── company_id (uuid, FK to companies)
  ├── territory_id (uuid, FK to territories)
  ├── role (text: 'admin', 'user', 'viewer')
  └── created_at, updated_at

-- Company & Territory Management
companies
  ├── id (uuid, PK)
  ├── name (text)
  ├── registration_number (text)
  ├── tax_id (text)
  └── created_at, updated_at

territories
  ├── id (uuid, PK)
  ├── company_id (uuid, FK to companies)
  ├── name (text)
  ├── code (text)
  └── created_at, updated_at

-- Chart of Accounts
chart_of_accounts
  ├── id (uuid, PK)
  ├── company_id (uuid, FK to companies)
  ├── account_code (text)
  ├── account_name (text)
  ├── account_type (text)
  ├── parent_account_id (uuid, FK to chart_of_accounts)
  └── created_at, updated_at

-- Transaction Management
journal_entries
  ├── id (uuid, PK)
  ├── company_id (uuid, FK to companies)
  ├── territory_id (uuid, FK to territories)
  ├── entry_date (date)
  ├── description (text)
  ├── reference_number (text)
  ├── total_amount (decimal)
  ├── status (text: 'draft', 'pending', 'approved', 'rejected')
  └── created_at, updated_at

journal_entry_lines
  ├── id (uuid, PK)
  ├── journal_entry_id (uuid, FK to journal_entries)
  ├── account_id (uuid, FK to chart_of_accounts)
  ├── debit_amount (decimal)
  ├── credit_amount (decimal)
  ├── description (text)
  └── created_at, updated_at

-- General Ledger (Computed/Materialized View)
general_ledger
  ├── id (uuid, PK)
  ├── company_id (uuid, FK to companies)
  ├── account_id (uuid, FK to chart_of_accounts)
  ├── transaction_date (date)
  ├── debit_amount (decimal)
  ├── credit_amount (decimal)
  ├── running_balance (decimal)
  └── created_at, updated_at

-- Approval System
approval_requests
  ├── id (uuid, PK)
  ├── journal_entry_id (uuid, FK to journal_entries)
  ├── requested_by (uuid, FK to auth.users)
  ├── approved_by (uuid, FK to auth.users)
  ├── status (text: 'pending', 'approved', 'rejected')
  ├── comments (text)
  └── created_at, updated_at, approved_at
```

**Row Level Security (RLS) Policies:**

```sql
-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE general_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;

-- Company-based data isolation
CREATE POLICY "Users can only access their company data" ON companies
  FOR ALL USING (
    id IN (
      SELECT company_id FROM user_profiles 
      WHERE user_profiles.id = auth.uid()
    )
  );

-- Territory-based access control
CREATE POLICY "Users can access territories in their company" ON territories
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE user_profiles.id = auth.uid()
    )
  );

-- Chart of Accounts access
CREATE POLICY "Company chart of accounts access" ON chart_of_accounts
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE user_profiles.id = auth.uid()
    )
  );

-- Journal Entries access with territory filtering
CREATE POLICY "Journal entries company and territory access" ON journal_entries
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE user_profiles.id = auth.uid()
    )
    AND (
      territory_id IN (
        SELECT territory_id FROM user_profiles 
        WHERE user_profiles.id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND role = 'admin'
      )
    )
  );

-- Admin override policies
CREATE POLICY "Admins can access all company data" ON journal_entries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND role = 'admin'
      AND company_id = journal_entries.company_id
    )
  );
```

**Recent Database Changes & Improvements:**

1. **Enhanced Territory Support (Latest)**
   - Added territory-based filtering to all financial transactions
   - Implemented hierarchical territory structure for multi-location companies
   - Updated RLS policies to support territory-level access control

2. **Approval System Integration**
   - Added approval_requests table for transaction workflow management
   - Implemented status tracking for journal entries (draft → pending → approved)
   - Added approval history and comments functionality

3. **Performance Optimizations**
   - Added composite indexes on frequently queried columns:
     ```sql
     CREATE INDEX idx_journal_entries_company_territory ON journal_entries(company_id, territory_id);
     CREATE INDEX idx_journal_entries_date_status ON journal_entries(entry_date, status);
     CREATE INDEX idx_chart_accounts_company_type ON chart_of_accounts(company_id, account_type);
     CREATE INDEX idx_general_ledger_account_date ON general_ledger(account_id, transaction_date);
     ```

4. **Data Integrity Constraints**
   - Added foreign key constraints with CASCADE options for data consistency
   - Implemented check constraints for account types and transaction statuses
   - Added triggers for automatic general ledger updates

**Foreign Key Relationships for New Tables:**

When adding new tables, follow these patterns:

```sql
-- Standard company-based table
CREATE TABLE new_table (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  territory_id uuid REFERENCES territories(id) ON DELETE SET NULL,
  -- other fields
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS and create policy
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company access for new_table" ON new_table
  FOR ALL USING (
    company_id IN (
      SELECT company_id FROM user_profiles 
      WHERE user_profiles.id = auth.uid()
    )
  );

-- Add performance indexes
CREATE INDEX idx_new_table_company ON new_table(company_id);
CREATE INDEX idx_new_table_territory ON new_table(territory_id);
```

**Supabase Edge Functions:**
- `sync-user`: Automatically creates user_profile when new user registers
- Real-time subscriptions for live data updates
- Custom authentication triggers for role-based access

**Connection Guidelines:**
- Always include `company_id` in new tables for data isolation
- Use `territory_id` for location-based filtering (nullable for company-wide data)
- Follow the UUID primary key pattern for all tables
- Implement RLS policies before adding data
- Use CASCADE deletes for dependent data, SET NULL for optional references

### Development Scripts & Commands Reference

**Essential Setup Scripts:**

1. **Database Setup & Schema Creation:**
   ```bash
   # Initial Supabase setup
   node supabase_setup.sql
   node supabase_setup_corrected.sql
   node supabase_setup_safe.sql
   
   # Schema fixes and updates
   node fix_schema.js
   node update_schema.cjs
   node schema_fixes.sql
   ```

2. **Authentication & User Management:**
   ```bash
   # Create admin users
   node create_admin_user.js
   node create_admin_simple.js
   node setup_super_admin.cjs
   
   # Authentication setup
   psql -f create_admin_auth_user.sql
   psql -f create_auth_users.sql
   psql -f numerizam_auth_functions.sql
   
   # User profile fixes
   node fix_auth_user_id.js
   psql -f fix_auth_user_id.sql
   ```

3. **Company & Territory Setup:**
   ```bash
   # Create company data
   node create_nepcs_company.cjs
   node fix_nepcs_company.cjs
   
   # Territory debugging
   node debug_territory_issue.cjs
   ```

4. **Approval System Setup:**
   ```bash
   # Approval system implementation
   node setup_approval_system.js
   node setup_approval_tables.js
   node run_approval_setup.js
   node verify_approval_setup.js
   
   # SQL setup
   psql -f approval_system_setup.sql
   ```

**Testing & Debugging Scripts:**

1. **Database Testing:**
   ```bash
   # Connection and schema testing
   node test_db_connection.js
   node check_database.js
   node check_schema.cjs
   node check_table_schema.js
   
   # Authentication testing
   node test_auth_flow.js
   node test_login.js
   node test_login_debug.js
   node test_admin_login.js
   node test_admin_login_simple.js
   ```

2. **API Testing:**
   ```bash
   # Backend API testing
   python test_backend_api.py
   python test_simple_api.py
   python test_transaction_api.py
   python test_transaction_direct.py
   
   # Frontend integration testing
   python test_frontend_payload.py
   node test_integration.js
   ```

3. **OCR & Document Processing Testing:**
   ```bash
   # OCR functionality testing
   python test_ocr.py
   python test_image.py
   python test_pdf_extraction.py
   python test_pdf_preprocessing.py
   
   # Invoice processing
   python test_invoice_sample.py
   python create_test_pdf.py
   ```

4. **Supabase Integration Testing:**
   ```bash
   # Supabase connection and functionality
   node test_supabase_connection.js
   node test_supabase_complete.js
   node debug_supabase.js
   ```

**Development Server Commands:**

1. **Frontend Development:**
   ```bash
   # Install dependencies
   npm install
   
   # Start development server
   npm run dev
   
   # Build for production
   npm run build
   
   # Preview production build
   npm run preview
   ```

2. **Backend Development:**
   ```bash
   # Navigate to backend
   cd backend
   
   # Install Python dependencies
   pip install -r requirements.txt
   
   # Run Django development server
   python manage.py runserver
   
   # Run migrations
   python manage.py makemigrations
   python manage.py migrate
   
   # Create superuser
   python manage.py createsuperuser
   
   # Start backend (Windows)
   start_backend.bat
   ```

3. **OCR Service:**
   ```bash
   # Start DOTS OCR backend
   python start_dots_ocr_backend.py
   start_dots_ocr_backend.bat
   ```

**Database Management Commands:**

1. **Schema Management:**
   ```sql
   -- Complete database reset (CAUTION: Deletes all data)
   \i complete_database_reset.sql
   
   -- Admin functions setup
   \i admin_functions.sql
   
   -- Revenue tracking functions
   \i revenue_functions.sql
   
   -- Supabase triggers
   \i supabase_auth_trigger.sql
   \i SUPABASE_TRIGGER_SETUP.md
   ```

2. **User Management:**
   ```sql
   -- Insert users directly
   \i insert_users_direct.js
   \i insert_admin_user.js
   
   -- Register admin
   \i register_admin.js
   ```

**Debugging & Troubleshooting Scripts:**

1. **Authentication Issues:**
   ```bash
   node check_auth.js
   node check_existing_users.js
   node debug_user_profile.js
   node debug_frontend_login.js
   ```

2. **LangGraph & AI Integration:**
   ```bash
   python test_langgraph.py
   node debug_langgraph.js
   ```

3. **Database Sequence Fixes:**
   ```bash
   python fix_sequence_sync.py
   ```

**Configuration Files:**

1. **Environment Setup:**
   ```bash
   # Copy environment templates
   cp .env.example .env
   cp backend/.env.example backend/.env
   
   # Configure Tailwind CSS
   # Files: tailwind.config.js, tailwind.config.cjs
   # Files: postcss.config.js, postcss.config.cjs
   ```

2. **TypeScript Configuration:**
   ```bash
   # TypeScript configs
   # Files: tsconfig.json, tsconfig.node.json
   ```

**Quick Start Command Sequence:**

```bash
# 1. Clone and setup
git clone <repository>
cd Numerizam
npm install
cd backend && pip install -r requirements.txt && cd ..

# 2. Database setup
node supabase_setup_safe.sql
node create_admin_user.js
node setup_approval_system.js

# 3. Start services
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
cd backend && python manage.py runserver

# Terminal 3: OCR Service (optional)
python start_dots_ocr_backend.py

# 4. Verify setup
node test_supabase_complete.js
node test_auth_flow.js
python test_backend_api.py
```

**Common Issue Resolution Scripts:**

1. **RLS Policy Issues:**
   ```sql
   \i fix_supabase_rls.sql
   ```

2. **Authentication Problems:**
   ```bash
   node fix_auth_user_id.js
   node debug_user_profile.js
   ```

3. **Schema Mismatches:**
   ```bash
   node fix_schema.js
   node update_schema.cjs
   ```

**Testing HTML Files:**
- `test_alert_functionality.html` - Frontend alert testing
- `index.html` - Basic HTML structure testing

**Batch Files (Windows):**
- `run.bat` - Main application launcher
- `start_backend.bat` - Backend service starter
- `start_dots_ocr_backend.bat` - OCR service starter

These scripts and commands provide a complete toolkit for setting up, testing, debugging, and maintaining the Numerizam accounting application. Each script serves a specific purpose in the development workflow and can be referenced when building similar applications.

## 🔐 Authentication & Role-Based Access Control

### User Roles & Permissions

The Numerizam application implements a comprehensive role-based access control system with five distinct user roles, each with specific permissions and page access:

#### 1. **Admin** (Super User)
- **Email:** `shuvo@admin.com`
- **Permissions:** Complete system access with super user privileges
- **Capabilities:**
  - View and manage all application pages and features
  - Assign roles to registered users through the Admin Panel
  - Approve role change requests from users
  - Access to Admin Dashboard with user management controls
  - Full CRUD operations on all data across companies
  - System configuration and maintenance access

#### 2. **Accountant**
- **Page Access:** AI Query Page, AI OCR Upload Page, Company Financial Data
- **Capabilities:**
  - Upload company documents via OCR for automated processing
  - Use AI-powered query system for financial analysis
  - Access classified and identified financial reports for their company only
  - Generate online verifiable financial reports and ratios
  - View financial metrics specific to their assigned company
- **Restrictions:** Cannot access Admin pages or other companies' data

#### 3. **Investor**
- **Page Access:** Financial Analysis Page, Company Comparison Dashboard
- **Capabilities:**
  - View all companies' year-over-year financial data
  - Access comprehensive financial ratios and measurements
  - Compare companies across different sectors
  - Analyze economic factors affecting investments
  - AI-powered financial analysis following CFA regulations
  - IFRS and GAAP compliant financial reporting
- **Restrictions:** Cannot access Admin, Query, or OCR pages

#### 4. **Auditor**
- **Page Access:** Financial Analysis Page, Audit Compliance Page
- **Capabilities:**
  - Review tax compliance and regulatory adherence
  - Verify country-specific VAT rules compliance
  - Audit ACCA and IFRS rules implementation
  - Access financial analysis for audit purposes
  - Generate compliance reports and recommendations
- **Restrictions:** Cannot access Admin, Query, or OCR pages

#### 5. **Viewer** (Default Role)
- **Page Access:** Public Dashboard (Home Page)
- **Capabilities:**
  - View aggregated financial metrics in currency values
  - Access financial ratios and percentages (anonymized)
  - Browse public financial performance indicators
  - Register for role upgrade requests
- **Restrictions:** Limited to public information only

### Authentication Workflow

#### User Registration & Role Assignment
1. **Initial Registration:** All new users start with "Viewer" role by default
2. **Role Request:** Users can request specific roles during or after registration:
   - Accountant (for specific company)
   - Investor
   - Auditor
3. **Admin Approval:** Role change requests appear in Admin Panel for approval
4. **Access Granted:** Once approved, users gain access to role-specific pages and features

#### Role-Specific Page Access Matrix

| Role | Home/Public | Admin Panel | OCR Upload | AI Query | Financial Analysis | Audit Page |
|------|-------------|-------------|------------|----------|-------------------|------------|
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Accountant** | ✅ | ❌ | ✅ | ✅ | ✅ (Own Company) | ❌ |
| **Investor** | ✅ | ❌ | ❌ | ❌ | ✅ (All Companies) | ❌ |
| **Auditor** | ✅ | ❌ | ❌ | ❌ | ✅ (All Companies) | ✅ |
| **Viewer** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Compliance & Standards

The application ensures financial analysis and reporting comply with:
- **CFA (Chartered Financial Analyst) Regulations**
- **IFRS (International Financial Reporting Standards)**
- **GAAP (Generally Accepted Accounting Principles)**
- **ACCA (Association of Chartered Certified Accountants) Standards**
- **Country-specific VAT and Tax Regulations**

### Data Security & Isolation

- **Company Data Isolation:** Accountants can only access their assigned company's data
- **Role-based UI:** Interface dynamically adjusts based on user permissions
- **Secure Authentication:** JWT-based authentication with Supabase integration
- **Audit Trail:** All user actions are logged for compliance and security

### Default Admin Account

For initial setup and testing:
- **Email:** `shuvo@admin.com`
- **Role:** Super Admin
- **Access:** Complete system privileges

*Note: Change default admin credentials in production environments*

## 🎨 UI/UX Design & User Experience

### Design Philosophy

The Numerizam application follows a modern, professional design approach optimized for financial data visualization and document processing workflows. The interface combines Material-UI components with Tailwind CSS for a cohesive, responsive experience across all user roles.

### Visual Design System

#### **Color Palette & Theming**
- **Primary Colors:** Professional blue tones for trust and reliability
- **Secondary Colors:** Green for positive financial indicators, red for negative trends
- **Neutral Colors:** Clean grays and whites for optimal readability
- **Dark Mode Support:** Toggle-based theme switching for user preference

#### **Typography & Layout**
- **Font System:** Clean, readable fonts optimized for financial data
- **Grid Layout:** Responsive 12-column grid system using Material-UI
- **Card-based Design:** Information grouped in clean, shadowed cards
- **Consistent Spacing:** 8px base unit for uniform spacing throughout

### Page-Specific UI/UX Design

#### **1. Public Dashboard (Home Page)**
- **Hero Section:** Clean banner with key financial metrics overview
- **Metrics Display:**
  - Large, prominent cards showing currency values (USD, EUR, etc.)
  - Percentage indicators with color-coded trend arrows
  - Ratio displays with contextual tooltips
  - Interactive charts using Chart.js for visual data representation
- **Layout:** 3-column responsive grid that adapts to mobile (1-column)
- **Navigation:** Sticky header with role-based menu items

#### **2. OCR Upload Page**
- **Drag & Drop Zone:**
  - Large, dashed border area with upload icon
  - Visual feedback on hover and file selection
  - Progress indicators during upload process
  - File type validation with clear error messages
- **Document Preview:**
  - Side-by-side layout: original document vs. extracted data
  - Highlighted text regions showing OCR recognition areas
  - Confidence scores displayed as color-coded overlays
- **Processing Status:**
  - Real-time progress bar with percentage completion
  - Step-by-step processing indicators (Upload → OCR → AI Analysis → Complete)
  - Success/error notifications with actionable messages

#### **3. AI Query Page**
- **Chat Interface:**
  - WhatsApp-style message bubbles for natural conversation flow
  - User messages aligned right (blue), AI responses aligned left (gray)
  - Typing indicators during AI processing
  - Message timestamps and read receipts
- **Query Input:**
  - Multi-line text area with auto-resize functionality
  - Suggested query templates as clickable chips
  - Voice input button for accessibility
- **Results Display:**
  - Structured data tables with sorting and filtering
  - Expandable sections for detailed financial breakdowns
  - Export buttons for CSV/PDF generation

#### **4. Financial Analysis Dashboard**
- **Metrics Grid:**
  - KPI cards with large numbers and trend indicators
  - Color-coded performance indicators (green/red/yellow)
  - Sparkline charts showing historical trends
- **Interactive Charts:**
  - Line charts for time-series financial data
  - Bar charts for comparative analysis
  - Pie charts for expense categorization
  - Zoom and pan functionality for detailed analysis
- **Comparison Tools:**
  - Side-by-side company comparison tables
  - Sector-wise performance benchmarking
  - Year-over-year growth visualization

#### **5. Admin Panel**
- **User Management Table:**
  - Sortable columns with search functionality
  - Role badges with color coding
  - Inline editing for quick updates
  - Bulk action checkboxes for mass operations
- **Approval Workflow:**
  - Notification badges showing pending requests
  - Quick approve/reject buttons with confirmation dialogs
  - User profile previews in modal windows

### Notification System

#### **Toast Notifications**
- **Success Messages:** Green background with checkmark icon
- **Error Messages:** Red background with warning icon
- **Info Messages:** Blue background with info icon
- **Warning Messages:** Yellow background with caution icon
- **Auto-dismiss:** 5-second timer with manual close option
- **Position:** Top-right corner, stacked for multiple notifications

#### **In-App Notifications**
- **Bell Icon:** Header notification center with badge count
- **Notification Panel:** Dropdown list with categorized messages
- **Real-time Updates:** WebSocket integration for instant notifications
- **Notification Types:**
  - Role approval requests (Admin)
  - Document processing completion (Accountant)
  - System maintenance alerts (All users)
  - Compliance deadline reminders (Auditor)

### Interactive Elements

#### **Form Design**
- **Input Fields:** Material-UI outlined style with floating labels
- **Validation:** Real-time validation with inline error messages
- **Submit Buttons:** Loading states with spinner animations
- **File Uploads:** Progress bars with cancel functionality

#### **Data Tables**
- **Pagination:** Bottom-aligned with page size options
- **Sorting:** Clickable column headers with sort indicators
- **Filtering:** Top-row filter inputs with debounced search
- **Row Actions:** Hover-revealed action buttons (Edit, Delete, View)

#### **Charts & Visualizations**
- **Interactive Legends:** Click to show/hide data series
- **Tooltips:** Hover information with formatted values
- **Responsive Design:** Charts adapt to container size
- **Export Options:** PNG, SVG, and PDF download buttons

### Mobile Responsiveness

#### **Breakpoint Strategy**
- **Desktop:** 1200px+ (Full feature set)
- **Tablet:** 768px-1199px (Condensed layout)
- **Mobile:** <768px (Stacked layout, simplified navigation)

#### **Mobile-Specific Features**
- **Hamburger Menu:** Collapsible navigation for small screens
- **Touch Gestures:** Swipe navigation for charts and tables
- **Optimized Forms:** Larger touch targets and simplified inputs
- **Progressive Disclosure:** Expandable sections to reduce scroll

### Accessibility Features

#### **WCAG Compliance**
- **Keyboard Navigation:** Full app navigable via keyboard
- **Screen Reader Support:** ARIA labels and semantic HTML
- **Color Contrast:** Minimum 4.5:1 ratio for text readability
- **Focus Indicators:** Clear visual focus states for all interactive elements

#### **User Preferences**
- **Font Size Controls:** User-adjustable text scaling
- **High Contrast Mode:** Enhanced visibility option
- **Reduced Motion:** Respect user's motion preferences
- **Language Support:** Multi-language interface (future enhancement)

### Performance Optimizations

#### **Loading States**
- **Skeleton Screens:** Placeholder content during data loading
- **Progressive Loading:** Critical content loads first
- **Lazy Loading:** Images and charts load on scroll
- **Caching Strategy:** Intelligent data caching for faster subsequent loads

#### **Error Handling**
- **Graceful Degradation:** Fallback content when features fail
- **Retry Mechanisms:** Automatic retry for failed network requests
- **Offline Support:** Basic functionality available without internet
- **Error Boundaries:** React error boundaries prevent app crashes

### Animation & Micro-interactions

#### **Transition Effects**
- **Page Transitions:** Smooth fade-in/out between routes
- **Modal Animations:** Scale-in effect for dialog boxes
- **Button Feedback:** Subtle press animations for user feedback
- **Loading Animations:** Smooth progress indicators and spinners

#### **Data Visualization Animations**
- **Chart Entrance:** Staggered animation for chart elements
- **Number Counters:** Animated counting for large financial figures
- **Progress Bars:** Smooth fill animations for completion status
- **Hover Effects:** Subtle scale and shadow changes on interaction

This comprehensive UI/UX design system ensures a professional, intuitive, and accessible experience for all user roles while maintaining the sophisticated appearance expected in financial applications.

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

<!-- ### CONTEXT:
### 1. Standard Chart of Accounts number (account_key), class, subclass for any given accounts for consistency:
You MUST use the following standardized Account Keys (account_key, 2nd column of the following table) which is the standardized chart of account code or number from the
following tables of Account categories: ASSETS, LIABILITIES, OWNER'S EQUITY, REVENUES, EXPENSES, OTHER INCOMES EXPENSES and TEMPORARY CLOSING ACCOUNT.
Do NOT invent new ones if you are already designating each account with a standardized chart of account number.
If a suitable account doesn't exist, use the closest match.

### ASSETS (1000-1999)
following table is the standardized classification list of assets classified by account, account_key, class, and subclass separated by pipe (|):

account|account_key|class|subclass

Cash|1000|Asset|Current Asset
Cash in Hand|1000|Asset|Current Asset
Cash at Bank - Checking|1001|Asset|Current Asset
Cash at Bank - Savings|1002|Asset|Current Asset
Petty Cash|1003|Asset|Current Asset
Cash equivalents|1004|Asset|Current Asset
Accounts Receivable|1010|Asset|Current Asset
Allowance for Doubtful Debts|1011|Asset|Current Asset
Allowance for doubtful accounts|1011|Asset|Current Asset
Legal fees receivable|1012|Asset|Current Asset
Interest receivable|1013|Asset|Current Asset
Rent receivable|1014|Asset|Current Asset
Notes receivable|1015|Asset|Current Asset
Short-term investments|1016|Asset|Current Asset
Fair value adjustment, securities (S-T)|1017|Asset|Current Asset
Merchandise inventory|1020|Asset|Current Asset
Inventory - Raw Materials|1020|Asset|Current Asset
Raw materials inventory|1020|Asset|Current Asset
Inventory - Finished Goods|1021|Asset|Current Asset
Finished goods inventory|1021|Asset|Current Asset
Goods in process inventory|1022|Asset|Current Asset
Office supplies|1030|Asset|Current Asset
Store supplies|1031|Asset|Current Asset
Prepaid Expenses|1030|Asset|Current Asset
Prepaid insurance|1032|Asset|Current Asset
Prepaid interest|1033|Asset|Current Asset
Prepaid rent|1034|Asset|Current Asset
Advance to Suppliers|1040|Asset|Current Asset
Input GST - CGST|1050|Asset|Current Asset
Input GST - SGST|1051|Asset|Current Asset
Input GST - IGST|1052|Asset|Current Asset
Long-term investments|1100|Asset|Long-term Asset
Fair value adjustment, securities (L-T)|1101|Asset|Long-term Asset
Investment in|1102|Asset|Long-term Asset
Bond sinking fund|1103|Asset|Long-term Asset
Furniture and Fixtures|1200|Asset|Fixed Asset
Furniture|1200|Asset|Fixed Asset
Office Equipment|1201|Asset|Fixed Asset
Store equipment|1202|Asset|Fixed Asset
Computers & Accessories|1202|Asset|Fixed Asset
Machinery|1203|Asset|Fixed Asset
Buildings|1203|Asset|Fixed Asset
Building|1203|Asset|Fixed Asset
Land|1204|Asset|Fixed Asset
Land improvements|1205|Asset|Fixed Asset
Vehicles|1205|Asset|Fixed Asset
Automobiles|1206|Asset|Fixed Asset
Trucks|1207|Asset|Fixed Asset
Boats|1208|Asset|Fixed Asset
Professional library|1209|Asset|Fixed Asset
Law library|1210|Asset|Fixed Asset
Accumulated Depreciation|1210|Asset|Fixed Asset
Accumulated depreciation-Automobiles|1211|Asset|Fixed Asset
Accumulated depreciation-Trucks|1212|Asset|Fixed Asset
Accumulated depreciation-Boats|1213|Asset|Fixed Asset
Accumulated depreciation-Professional library|1214|Asset|Fixed Asset
Accumulated depreciation-Law library|1215|Asset|Fixed Asset
Accumulated depreciation-Furniture|1216|Asset|Fixed Asset
Accumulated depreciation-Office equipment|1217|Asset|Fixed Asset
Accumulated depreciation-Store equipment|1218|Asset|Fixed Asset
Accumulated depreciation-Machinery|1219|Asset|Fixed Asset
Accumulated depreciation-Building|1220|Asset|Fixed Asset
Accumulated depreciation-Land improvements|1221|Asset|Fixed Asset
Mineral deposit|1300|Asset|Natural Resource
Accumulated depletion-Mineral deposit|1301|Asset|Natural Resource
Patents|1400|Asset|Intangible Asset
Leasehold|1401|Asset|Intangible Asset
Franchise|1402|Asset|Intangible Asset
Copyrights|1403|Asset|Intangible Asset
Leasehold improvements|1404|Asset|Intangible Asset
Licenses|1405|Asset|Intangible Asset
Accumulated amortization|1410|Asset|Intangible Asset

### LIABILITIES (2000-2999)
following is the standardized list of liabilities classified by account, account_key, class, and subclass separated by pipe (|):

account|account_key|class|subclass

Accounts Payable|2000|Liability|Current Liability
Insurance payable|2001|Liability|Current Liability
Interest payable|2002|Liability|Current Liability
Legal fees payable|2003|Liability|Current Liability
Office salaries payable|2004|Liability|Current Liability
Rent payable|2005|Liability|Current Liability
Salaries Payable|2002|Liability|Current Liability
Salaries payable|2002|Liability|Current Liability
Wages payable|2006|Liability|Current Liability
Accrued payroll payable|2007|Liability|Current Liability
Accrued Expenses|2001|Liability|Current Liability
Estimated warranty liability|2008|Liability|Current Liability
Income taxes payable|2009|Liability|Current Liability
Common dividend payable|2010|Liability|Current Liability
Preferred dividend payable|2011|Liability|Current Liability
State unemployment taxes payable|2012|Liability|Current Liability
Employee federal income taxes payable|2013|Liability|Current Liability
Employee medical insurance payable|2014|Liability|Current Liability
Employee retirement program payable|2015|Liability|Current Liability
Employee union dues payable|2016|Liability|Current Liability
Federal unemployment taxes payable|2017|Liability|Current Liability
FICA taxes payable|2018|Liability|Current Liability
Estimated vacation pay liability|2019|Liability|Current Liability
GST Payable - CGST|2003|Liability|Current Liability
GST Payable - SGST|2004|Liability|Current Liability
GST Payable - IGST|2005|Liability|Current Liability
TDS Payable|2006|Liability|Current Liability
Unearned consulting fees|2020|Liability|Current Liability
Unearned legal fees|2021|Liability|Current Liability
Unearned property management fees|2022|Liability|Current Liability
Unearned fees|2023|Liability|Current Liability
Unearned janitorial revenue|2024|Liability|Current Liability
Unearned Revenue|2007|Liability|Current Liability
Unearned revenue|2007|Liability|Current Liability
Unearned rent|2025|Liability|Current Liability
Short-term notes payable|2030|Liability|Current Liability
Discount on short-term notes payable|2031|Liability|Current Liability
Notes payable|2032|Liability|Current Liability
Loan Payable - Current|2010|Liability|Current Liability
Long-term notes payable|2100|Liability|Long Term Liability
Discount on long-term notes payable|2101|Liability|Long Term Liability
Long-term lease liability|2102|Liability|Long Term Liability
Lease Liability|2101|Liability|Long Term Liability
Bonds payable|2103|Liability|Long Term Liability
Discount on bonds payable|2104|Liability|Long Term Liability
Premium on bonds payable|2105|Liability|Long Term Liability
Deferred income tax liability|2106|Liability|Long Term Liability
Loan Payable - Long-term|2100|Liability|Long Term Liability
Security Deposit Received|2102|Liability|Long Term Liability

### OWNER'S EQUITY (3000-3999)
following is the standardized list of owner's equity classified by account, account_key, class, and subclass separated by pipe (|):

account|account_key|class|subclass

Capital|3000|Owner's Equity|Owner's Equity
Owner's Capital|3000|Owner's Equity|Owner's Equity
Withdrawals|3001|Owner's Equity|Owner's Equity
Drawings / Withdrawal|3004|Owner's Equity|Owner's Equity
Partner's Capital A/c|3001|Owner's Equity|Owner's Equity
Common stock, BDTk. par value|3010|Owner's Equity|Stockholder's Equity
Common stock, no-par value|3011|Owner's Equity|Stockholder's Equity
Common stock, BDTk. stated value|3012|Owner's Equity|Stockholder's Equity
Common stock dividend distributable|3013|Owner's Equity|Stockholder's Equity
Share Capital|3002|Owner's Equity|Stockholder's Equity
Paid-in capital in excess of par value, Common stock|3020|Owner's Equity|Stockholder's Equity
Paid-in capital in excess of stated value, No-par common stock|3021|Owner's Equity|Stockholder's Equity
Paid-in capital from retirement of common stock|3022|Owner's Equity|Stockholder's Equity
Paid-in capital, Treasury stock|3023|Owner's Equity|Stockholder's Equity
Preferred stock|3030|Owner's Equity|Stockholder's Equity
Paid-in capital in excess of par value, Preferred stock|3031|Owner's Equity|Stockholder's Equity
Retained Earnings|3003|Owner's Equity|Owner's Equity
Cash dividends (or Dividends)|3040|Owner's Equity|Owner's Equity
Stock dividends|3041|Owner's Equity|Owner's Equity
Treasury stock, Common|3050|Owner's Equity|Stockholder's Equity
Current Year Profit/Loss|3005|Owner's Equity|Owner's Equity
Reserves and Surplus|3006|Owner's Equity|Owner's Equity
Unrealized gain Equity|3060|Owner's Equity|Owner's Equity
Unrealized loss-Equity|3061|Owner's Equity|Owner's Equity

### REVENUES (4000-4999)
following is the standardized list of revenues classified by account, account_key, class, and subclass separated by pipe (|):

account|account_key|class|subclass

Fees earned|4000|Revenue|Operating Revenue
Services revenue|4001|Revenue|Operating Revenue
Sales Revenue - Services|4001|Revenue|Operating Revenue
Commissions earned|4002|Revenue|Operating Revenue
Commission Income|4005|Revenue|Operating Revenue
Rent revenue (or Rent earned)|4003|Revenue|Operating Revenue
Dividends revenue (or Dividend earned)|4004|Revenue|Non-Operating Revenue
Earnings from investment in|4005|Revenue|Non-Operating Revenue
Interest revenue (or Interest earned)|4004|Revenue|Non-Operating Revenue
Interest Income|4004|Revenue|Non-Operating Revenue
Sinking fund earnings|4006|Revenue|Non-Operating Revenue
Sales|4000|Revenue|Operating Revenue
Sales Revenue - Goods|4000|Revenue|Operating Revenue
Export Sales|4002|Revenue|Operating Revenue
Sales returns and allowances|4010|Revenue|Operating Revenue
Sales discounts|4011|Revenue|Operating Revenue
Other Operating Income|4003|Revenue|Operating Revenue
Discount Received|4006|Revenue|Non-Operating Revenue
Gain on Sale of Asset|4007|Revenue|Non-Operating Revenue

### EXPENSES (5000-5999)
following is the standardized list of expenses classified by account, account_key, class, and subclass separated by pipe (|):

account|account_key|class|subclass

Cost of Goods Sold (COGS)|5000|Expense|Cost of Sales
Cost of goods sold|5000|Expense|Cost of Sales
Purchases|5001|Expense|Cost of Sales
Purchases - Materials|5001|Expense|Cost of Sales
Purchases returns and allowances|5002|Expense|Cost of Sales
Purchases discounts|5003|Expense|Cost of Sales
Transportation-in|5004|Expense|Cost of Sales
Freight & Shipping Inward|5002|Expense|Cost of Sales
Raw materials purchases|5005|Expense|Cost of Sales
Freight-in on raw materials|5006|Expense|Cost of Sales
Packaging Costs|5003|Expense|Cost of Sales
Factory payroll|5100|Expense|Manufacturing
Direct labor|5101|Expense|Manufacturing
Factory overhead|5102|Expense|Manufacturing
Indirect materials|5103|Expense|Manufacturing
Indirect labor|5104|Expense|Manufacturing
Factory insurance expired|5105|Expense|Manufacturing
Factory supervision|5106|Expense|Manufacturing
Factory supplies used|5107|Expense|Manufacturing
Factory utilities|5108|Expense|Manufacturing
Miscellaneous production costs|5109|Expense|Manufacturing
Property taxes on factory building|5110|Expense|Manufacturing
Property taxes on factory equipment|5111|Expense|Manufacturing
Rent on factory building|5112|Expense|Manufacturing
Repairs, factory equipment|5113|Expense|Manufacturing
Small tools written off|5114|Expense|Manufacturing
Depreciation of factory building|5115|Expense|Manufacturing
Depreciation of factory equipment|5116|Expense|Manufacturing
Direct material quantity variance|5120|Expense|Manufacturing
Direct material price variance|5121|Expense|Manufacturing
Direct labor quantity variance|5122|Expense|Manufacturing
Direct labor price variance|5123|Expense|Manufacturing
Factory overhead volume variance|5124|Expense|Manufacturing
Factory overhead controllable variance|5125|Expense|Manufacturing
Rent Expense|5100|Expense|Operating Expense
Rent expense-Office space|5101|Expense|Operating Expense
Rent expense-Selling space|5102|Expense|Operating Expense
Salaries and Wages|5101|Expense|Operating Expense
Office salaries expense|5200|Expense|Operating Expense
Sales salaries expense|5201|Expense|Operating Expense
Salaries expense|5202|Expense|Operating Expense
wages expense|5203|Expense|Operating Expense
Employee Benefits|5102|Expense|Operating Expense
Employees' benefits expense|5102|Expense|Operating Expense
Payroll taxes expense|5204|Expense|Operating Expense
Office Supplies|5103|Expense|Operating Expense
Office supplies expense|5103|Expense|Operating Expense
Store supplies expense|5104|Expense|Operating Expense
supplies expense|5105|Expense|Operating Expense
Utilities|5104|Expense|Operating Expense
Utilities expense|5104|Expense|Operating Expense
Telephone & Internet|5105|Expense|Operating Expense
Telephone expense|5105|Expense|Operating Expense
Postage & Courier|5106|Expense|Operating Expense
Postage expense|5106|Expense|Operating Expense
Repairs and Maintenance|5107|Expense|Operating Expense
Repairs expense|5107|Expense|Operating Expense
Printing & Stationery|5108|Expense|Operating Expense
Insurance Expense|5109|Expense|Operating Expense
Insurance expense|5109|Expense|Operating Expense
Insurance expense Delivery equipment|5110|Expense|Operating Expense
Insurance expense-Office equipment|5111|Expense|Operating Expense
Bank Charges|5110|Expense|Operating Expense
Professional Fees|5111|Expense|Operating Expense
Legal fees expense|5112|Expense|Operating Expense
Audit Fees|5112|Expense|Operating Expense
Depreciation Expense|5113|Expense|Operating Expense
Amortization expense|5114|Expense|Operating Expense
Depletion expense|5115|Expense|Operating Expense
Depreciation expense-Boats|5116|Expense|Operating Expense
Depreciation expense-Automobiles|5117|Expense|Operating Expense
Depreciation expense Building|5118|Expense|Operating Expense
Depreciation expense-Land improvements|5119|Expense|Operating Expense
Depreciation expense-Law library|5120|Expense|Operating Expense
Depreciation expense Trucks|5121|Expense|Operating Expense
Depreciation expense-equipment|5122|Expense|Operating Expense
Software Subscriptions|5114|Expense|Operating Expense
Miscellaneous Expenses|5115|Expense|Operating Expense
Miscellaneous expenses|5115|Expense|Operating Expense
Press rental expense|5130|Expense|Operating Expense
Truck rental expense|5131|Expense|Operating Expense
Rental expense|5132|Expense|Operating Expense
Advertising & Promotion|5200|Expense|Selling Expense
Advertising expense|5200|Expense|Selling Expense
Travel & Entertainment|5201|Expense|Selling Expense
Travel and entertainment expense|5201|Expense|Selling Expense
Commission to Agents|5202|Expense|Selling Expense
Customer Discounts Allowed|5203|Expense|Selling Expense
Bad debts expense|5210|Expense|Selling Expense
Blueprinting expense|5211|Expense|Selling Expense
Boat expense|5212|Expense|Selling Expense
Collection expense|5213|Expense|Selling Expense
Concessions expense|5214|Expense|Selling Expense
Credit card expense|5215|Expense|Selling Expense
Delivery expense|5216|Expense|Selling Expense
Dumping expense|5217|Expense|Selling Expense
Equipment expense|5218|Expense|Selling Expense
Food and drinks expense|5219|Expense|Selling Expense
Gas and oil expense|5220|Expense|Selling Expense
General and administrative expense|5221|Expense|Administrative Expense
Janitorial expense|5222|Expense|Operating Expense
Mileage expense|5223|Expense|Selling Expense
Mower and tools expense|5224|Expense|Operating Expense
Operating expense|5225|Expense|Operating Expense
Organization expense|5226|Expense|Operating Expense
Permits expense|5227|Expense|Operating Expense
Property taxes expense|5228|Expense|Operating Expense
Selling expense|5229|Expense|Selling Expense
Warranty expense|5230|Expense|Operating Expense
Interest Expense|5300|Expense|Non-Operating Expense
Interest expense|5300|Expense|Non-Operating Expense
Finance Charges|5301|Expense|Non-Operating Expense
Foreign Exchange Loss|5302|Expense|Non-Operating Expense
Cash over and short|5310|Expense|Non-Operating Expense
Discounts lost|5311|Expense|Non-Operating Expense
Factoring fee expense|5312|Expense|Non-Operating Expense
Income taxes expense|5400|Expense|Tax Expense

### OTHER INCOMES EXPENSES (6000-6999)
following is the standardized list of other income/expenses classified by account, account_key, class, and subclass separated by pipe (|):

account|account_key|class|subclass

Gain on retirement of bonds|6000|Other Income|Extraordinary Item
Gain on sale of machinery|6001|Other Income|Extraordinary Item
Gain on sale of investments|6002|Other Income|Extraordinary Item
Gain on sale of trucks|6003|Other Income|Extraordinary Item
Gain on|6004|Other Income|Extraordinary Item
Foreign exchange gain or loss|6010|Other Income|Extraordinary Item
Loss on disposal of machinery|6100|Other Expense|Extraordinary Item
Loss on exchange of equipment|6101|Other Expense|Extraordinary Item
Loss on exchange of|6102|Other Expense|Extraordinary Item
Loss on sale of notes|6103|Other Expense|Extraordinary Item
Loss on retirement of bonds|6104|Other Expense|Extraordinary Item
Loss on sale of investments|6105|Other Expense|Extraordinary Item
Loss on sale of machinery|6106|Other Expense|Extraordinary Item
Loss on|6107|Other Expense|Extraordinary Item
Unrealized gain-Income|6200|Other Income|Extraordinary Item
Unrealized loss-Income|6201|Other Expense|Extraordinary Item
Impairment gain|6202|Other Income|Extraordinary Item
Impairment loss|6203|Other Expense|Extraordinary Item

### TEMPORARY CLOSING ACCOUNT (9000-9999)
following is the standardized list of temporary closing account summary classified by account, account_key, class, and subclass separated by pipe (|):

account|account_key|class|subclass

Income summary | 9000 | Temporary | Closing Account
Manufacturing summary | 9001 | Temporary | Closing Account -->
