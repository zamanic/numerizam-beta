# LangGraph Integration for Numerizam Accounting System

## Overview

This document outlines the LangGraph integration that has been implemented for the Numerizam Accounting Application. LangGraph serves as the "brain" that processes natural language queries and converts them into structured accounting transactions using Django ORM.

## Architecture

### LangGraph Workflow

The LangGraph agent consists of three main nodes:

1. **Parser Node**: Extracts structured information from natural language queries using an LLM
2. **Validation Node**: Validates accounts and data against the Django database
3. **Execution Node**: Creates journal entries in the database using Django ORM

### Workflow Example

**Input**: "Record a sale of $500 for cash on July 18, 2025"

**Parser Node Output**:
```json
{
  "date": "2025-07-18",
  "debit_account": "Cash",
  "credit_account": "Sales Revenue", 
  "amount": 500.00,
  "details": "Cash sale"
}
```

**Validation Node**: Checks if 'Cash' and 'Sales Revenue' exist in ChartOfAccounts for the company

**Execution Node**: Creates journal entries in GeneralLedger table

**Output**: Confirmation that the transaction has been successfully recorded

## Implementation Files

### Backend Files

1. **`accounting/langgraph_agent.py`**
   - Core LangGraph agent implementation
   - Contains the three-node workflow (Parser, Validation, Execution)
   - Handles natural language processing and database operations

2. **`accounting/langgraph_views.py`**
   - Django REST API views for LangGraph integration
   - Endpoints for processing queries, batch processing, validation, and status

3. **`accounting/urls.py`** (updated)
   - Added LangGraph API endpoints:
     - `/ai/process-query/` - Process natural language queries
     - `/ai/batch-process/` - Batch process multiple queries
     - `/ai/validate-query/` - Validate queries without execution
     - `/ai/status/` - Get agent status

4. **`test_langgraph.py`**
   - Test script to verify LangGraph functionality
   - Creates test data and runs sample queries

### Frontend Files

1. **`src/services/langGraphAPI.ts`**
   - Frontend API service for LangGraph integration
   - TypeScript interfaces and API functions

2. **`src/pages/AIAssistant.tsx`**
   - React component for AI Assistant interface
   - Allows users to input natural language queries
   - Displays validation and processing results

3. **`src/services/supabase.ts`** (updated)
   - Updated Supabase configuration to use environment variables

### Configuration Files

1. **Backend `.env`**
   - Updated with Supabase PostgreSQL connection
   - Added LangGraph and AI configuration variables

2. **Frontend `.env`**
   - Added Supabase configuration
   - Added backend API base URL

3. **`requirements.txt`** (updated)
   - Added LangGraph and AI dependencies

## API Endpoints

### POST `/api/ai/process-query/`
Process a natural language query and create accounting transactions.

**Request**:
```json
{
  "query": "Record a sale of $500 for cash on July 18, 2025",
  "company_id": 1
}
```

**Response**:
```json
{
  "success": true,
  "journal_id": 123,
  "debit_entry_id": 456,
  "credit_entry_id": 457,
  "amount": 500.0,
  "message": "Transaction recorded successfully. Journal ID: 123"
}
```

### POST `/api/ai/validate-query/`
Validate a query without executing it.

### POST `/api/ai/batch-process/`
Process multiple queries in batch (max 10 queries).

### GET `/api/ai/status/`
Get the status of the LangGraph agent.

## Features

### Natural Language Processing
- Supports various accounting transaction types
- Intelligent account mapping (e.g., "cash" → "Cash", "sales" → "Sales Revenue")
- Date parsing and validation
- Amount extraction and validation

### Database Integration
- Uses Django ORM for all database operations
- Automatic account lookup and validation
- Calendar entry creation for transaction dates
- Territory management
- Double-entry bookkeeping validation

### Error Handling
- Comprehensive validation at each step
- Detailed error messages for debugging
- Graceful handling of missing accounts or invalid data

### Frontend Integration
- Real-time status monitoring
- Query validation before execution
- Sample queries for demonstration
- Batch processing capabilities

## Usage

### Backend Setup

1. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Configure environment variables in `.env`:
```env
DATABASE_URL=postgresql://postgres:password@db.rbelmynhqpfmkmwcegrn.supabase.co:5432/postgres
SUPABASE_URL=https://rbelmynhqpfmkmwcegrn.supabase.co
SUPABASE_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

3. Run migrations and start server:
```bash
python manage.py migrate
python manage.py runserver
```

4. Test LangGraph functionality:
```bash
python test_langgraph.py
```

### Frontend Usage

1. Navigate to `/app/ai` in the application
2. Enter a natural language query
3. Optionally validate the query first
4. Process the query to create accounting transactions
5. View results and transaction details

### Sample Queries

- "Record a sale of $500 for cash on July 18, 2025"
- "Pay $200 for office supplies with cash on July 19, 2025"
- "Receive $1000 cash from customer on account on July 20, 2025"
- "Purchase inventory worth $800 on credit on July 21, 2025"

## Security Considerations

- All API endpoints require authentication
- Input validation at multiple levels
- SQL injection protection through Django ORM
- Environment variable protection for API keys

## Future Enhancements

1. **Advanced Query Types**
   - Support for complex multi-account transactions
   - Recurring transaction setup
   - Budget and forecast queries

2. **Learning Capabilities**
   - User-specific account preferences
   - Company-specific terminology learning
   - Historical transaction pattern recognition

3. **Integration Enhancements**
   - Voice input support
   - Mobile app integration
   - Third-party accounting software sync

4. **Reporting Integration**
   - Natural language report generation
   - Automated financial analysis
   - Trend identification and alerts

## Troubleshooting

### Common Issues

1. **Agent Status: Offline**
   - Check OpenAI API key configuration
   - Verify Django server is running
   - Check database connectivity

2. **Query Validation Fails**
   - Ensure chart of accounts is properly set up
   - Check account name mappings
   - Verify company ID exists

3. **Database Connection Issues**
   - Verify Supabase credentials
   - Check DATABASE_URL format
   - Ensure PostgreSQL service is running

### Debug Mode

Enable debug logging by setting `DEBUG=True` in Django settings and checking the console output for detailed error messages.

## Conclusion

The LangGraph integration transforms the Numerizam Accounting Application into an intelligent system that can understand and process natural language accounting queries. This implementation provides a solid foundation for AI-powered accounting automation while maintaining the security and reliability of traditional database operations.