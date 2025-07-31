# Numerizam Django Backend

This is the Django backend for the Numerizam Accounting Application. It provides a RESTful API for managing accounting data including companies, chart of accounts, territories, calendar entries, and general ledger transactions.

## Features

- **Complete Accounting Models**: Company, Chart of Accounts, Territory, Calendar, General Ledger, and Journal Entry models
- **RESTful API**: Full CRUD operations for all accounting entities
- **Financial Reporting**: Built-in endpoints for Profit & Loss, Balance Sheet, and Trial Balance reports
- **Transaction Processing**: AI-compatible transaction processing endpoints
- **Bulk Operations**: Support for bulk transaction creation
- **Admin Interface**: Django admin interface for data management
- **Comprehensive Testing**: Full test coverage for models, views, and API endpoints

## Models

### Company
- Represents companies in the accounting system
- Fields: company_id (PK), company_name, created_at

### ChartOfAccounts
- Defines the account structure for each company
- Fields: company (FK), account_key, report, class_name, sub_class, sub_class2, account, sub_account
- Unique constraint: (company, account_key)

### Territory
- Geographical territories for organizing transactions
- Fields: company (FK), territory_key, country, region
- Unique constraint: (company, territory_key)

### Calendar
- Standardized date entries with hierarchical time periods
- Fields: company (FK), date, year, quarter, month, day
- Unique constraint: (company, date)

### GeneralLedger
- Individual transaction entries
- Fields: entry_no (PK), company (FK), date (FK), territory (FK), account (FK), details, amount, transaction_type, reference_number
- Additional fields: created_at, updated_at

### JournalEntry
- Groups related ledger entries together
- Fields: journal_id (PK), company (FK), date (FK), description, reference_number, created_at, created_by
- Methods: total_debits, total_credits, is_balanced, get_balance_difference

## API Endpoints

### Core Data Management
- `GET/POST /api/companies/` - Company management
- `GET/POST /api/chart-of-accounts/` - Chart of accounts management
- `GET/POST /api/territories/` - Territory management
- `GET/POST /api/calendar/` - Calendar entries management
- `GET/POST /api/general-ledger/` - General ledger entries
- `GET/POST /api/journal-entries/` - Journal entries

### Transaction Processing
- `POST /api/transactions/process/` - Process AI-generated transaction payloads
- `POST /api/transactions/bulk-create/` - Create multiple transactions in bulk

### Financial Reports
- `GET /api/reports/profit-loss/` - Profit & Loss report
- `GET /api/reports/balance-sheet/` - Balance Sheet report
- `GET /api/reports/trial-balance/` - Trial Balance report

## Installation

1. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Create a superuser:**
   ```bash
   python manage.py createsuperuser
   ```

6. **Run the development server:**
   ```bash
   python manage.py runserver
   ```

## Configuration

### Database
By default, the application uses SQLite for development. For production, configure PostgreSQL or MySQL in your `.env` file:

```env
# PostgreSQL
DATABASE_URL=postgresql://username:password@localhost:5432/numerizam_db

# MySQL
DATABASE_URL=mysql://username:password@localhost:3306/numerizam_db
```

### CORS
The application is configured to allow requests from the React frontend running on `http://localhost:5173`. Update `CORS_ALLOWED_ORIGINS` in `settings.py` for production.

## Usage Examples

### Processing AI Transactions
```python
import requests

# Process a transaction from AI
data = {
    "company_data": {"Company": "Acme Corp"},
    "calendar_data": {"Date": "2024-01-15"},
    "chart_of_accounts_data": {
        "Report": "Balance Sheet",
        "Class": "Assets",
        "SubClass": "Current Assets",
        "SubClass2": "Cash",
        "Account": "Cash in Bank",
        "SubAccount": "Checking Account"
    },
    "general_ledger_entries": [
        {
            "Account_key": 1000,
            "Amount": 1500.00,
            "Type": "DEBIT",
            "Details": "Cash received from customer"
        },
        {
            "Account_key": 4000,
            "Amount": 1500.00,
            "Type": "CREDIT",
            "Details": "Sales revenue"
        }
    ]
}

response = requests.post('http://localhost:8000/api/transactions/process/', json=data)
print(response.json())
```

### Generating Reports
```python
# Get Profit & Loss report
params = {
    'company_id': 1,
    'start_date': '2024-01-01',
    'end_date': '2024-12-31'
}
response = requests.get('http://localhost:8000/api/reports/profit-loss/', params=params)
print(response.json())
```

## Testing

Run the test suite:
```bash
python manage.py test
```

Run specific test modules:
```bash
python manage.py test accounting.tests.CompanyModelTest
python manage.py test accounting.tests.AccountingAPITest
```

## Admin Interface

Access the Django admin interface at `http://localhost:8000/admin/` to manage data through a web interface.

## Production Deployment

1. **Set DEBUG=False** in your environment variables
2. **Configure a production database** (PostgreSQL/MySQL)
3. **Set up static file serving** with WhiteNoise (included)
4. **Configure ALLOWED_HOSTS** for your domain
5. **Use a production WSGI server** like Gunicorn (included in requirements)

Example production command:
```bash
gunicorn numerizam_project.wsgi:application --bind 0.0.0.0:8000
```

## Integration with Frontend

This backend is designed to work seamlessly with the React frontend. The transaction processing endpoint (`/api/transactions/process/`) accepts the exact format generated by the AI system in the frontend.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

This project is part of the Numerizam Accounting Application.