# Numerizam Accounting System - Comprehensive API Documentation

## Overview

The Numerizam Accounting System provides a powerful and flexible REST API built with Django REST Framework (DRF) and django-filter. This API allows secure, controlled access to accounting data with advanced filtering, analytics, and reporting capabilities.

## Base URL
```
http://localhost:8000/api/
```

## Authentication
The API uses Django's built-in authentication system. Include authentication headers as required by your frontend implementation.

## Core Endpoints

### 1. Companies API
**Endpoint:** `/api/companies/`

#### Available Operations:
- `GET /api/companies/` - List all companies
- `GET /api/companies/{id}/` - Get specific company
- `POST /api/companies/` - Create new company
- `PUT /api/companies/{id}/` - Update company
- `DELETE /api/companies/{id}/` - Delete company

#### Filtering Parameters:
- `company_name` - Exact match
- `company_name__icontains` - Case-insensitive contains
- `company_name__startswith` - Starts with
- `company_name__endswith` - Ends with

#### Custom Actions:
- `GET /api/companies/{id}/statistics/` - Get company statistics

#### Example Requests:
```bash
# Get all companies
GET /api/companies/

# Search companies by name
GET /api/companies/?company_name__icontains=acme

# Get company statistics
GET /api/companies/1/statistics/
```

### 2. Chart of Accounts API
**Endpoint:** `/api/chart-of-accounts/`

#### Available Operations:
- `GET /api/chart-of-accounts/` - List all accounts
- `GET /api/chart-of-accounts/{id}/` - Get specific account
- `POST /api/chart-of-accounts/` - Create new account
- `PUT /api/chart-of-accounts/{id}/` - Update account
- `DELETE /api/chart-of-accounts/{id}/` - Delete account

#### Filtering Parameters:
- `company` - Filter by company ID
- `account_key` - Exact account key
- `account_key__gte` - Account key greater than or equal
- `account_key__lte` - Account key less than or equal
- `class_name` - Account class (Assets, Liabilities, Equity, Revenue, Expenses)
- `sub_class` - Sub-class filter
- `sub_class2` - Second-level sub-class filter
- `account` - Account name filter
- `sub_account` - Sub-account filter
- `report` - Report type (Balance Sheet, Income Statement)

#### Search Fields:
- `account` - Account name
- `sub_account` - Sub-account name
- `class_name` - Account class

#### Custom Actions:
- `GET /api/chart-of-accounts/hierarchy/` - Get account hierarchy
- `GET /api/chart-of-accounts/{id}/usage/` - Get account usage statistics

#### Example Requests:
```bash
# Get all asset accounts for company 1
GET /api/chart-of-accounts/?company=1&class_name=Assets

# Search for cash accounts
GET /api/chart-of-accounts/?search=cash

# Get account hierarchy
GET /api/chart-of-accounts/hierarchy/?company=1

# Get accounts with keys between 1000-2000
GET /api/chart-of-accounts/?account_key__gte=1000&account_key__lte=2000
```

### 3. Territories API
**Endpoint:** `/api/territories/`

#### Available Operations:
- `GET /api/territories/` - List all territories
- `GET /api/territories/{id}/` - Get specific territory
- `POST /api/territories/` - Create new territory
- `PUT /api/territories/{id}/` - Update territory
- `DELETE /api/territories/{id}/` - Delete territory

#### Filtering Parameters:
- `company` - Filter by company ID
- `territory_key` - Exact territory key
- `country` - Country filter
- `country__icontains` - Country contains
- `region` - Region filter
- `region__icontains` - Region contains

#### Search Fields:
- `country` - Country name
- `region` - Region name

#### Example Requests:
```bash
# Get all territories for company 1
GET /api/territories/?company=1

# Search territories by country
GET /api/territories/?country__icontains=united

# Search territories
GET /api/territories/?search=california
```

### 4. Calendar API
**Endpoint:** `/api/calendar/`

#### Available Operations:
- `GET /api/calendar/` - List calendar entries
- `GET /api/calendar/{id}/` - Get specific calendar entry

#### Filtering Parameters:
- `company` - Filter by company ID
- `date` - Exact date
- `date__gte` - Date greater than or equal
- `date__lte` - Date less than or equal
- `date__year` - Filter by year
- `date__month` - Filter by month
- `date__day` - Filter by day
- `year` - Filter by year
- `quarter` - Filter by quarter (Q1, Q2, Q3, Q4)
- `month` - Filter by month name
- `day` - Filter by day name

#### Custom Actions:
- `GET /api/calendar/date_ranges/` - Get available date ranges

#### Example Requests:
```bash
# Get calendar entries for January 2024
GET /api/calendar/?company=1&date__year=2024&date__month=1

# Get Q1 2024 entries
GET /api/calendar/?company=1&quarter=Q1&year=2024

# Get date ranges
GET /api/calendar/date_ranges/?company=1
```

### 5. General Ledger API
**Endpoint:** `/api/general-ledger/`

#### Available Operations:
- `GET /api/general-ledger/` - List ledger entries
- `GET /api/general-ledger/{id}/` - Get specific entry
- `POST /api/general-ledger/` - Create new entry
- `PUT /api/general-ledger/{id}/` - Update entry
- `DELETE /api/general-ledger/{id}/` - Delete entry

#### Filtering Parameters:
- `company` - Filter by company ID
- `account` - Filter by account ID
- `territory` - Filter by territory ID
- `calendar` - Filter by calendar ID
- `amount` - Exact amount
- `amount__gte` - Amount greater than or equal
- `amount__lte` - Amount less than or equal
- `debit_credit` - Filter by debit/credit (D/C)

#### Custom Actions:
- `GET /api/general-ledger/summary/` - Get ledger summary
- `GET /api/general-ledger/monthly_analysis/` - Get monthly analysis
- `GET /api/general-ledger/account_balances/` - Get account balances
- `GET /api/general-ledger/export_csv/` - Export to CSV

#### Example Requests:
```bash
# Get all entries for account 1000
GET /api/general-ledger/?account__account_key=1000

# Get entries with amounts > 1000
GET /api/general-ledger/?amount__gte=1000

# Get debit entries only
GET /api/general-ledger/?debit_credit=D

# Get monthly analysis
GET /api/general-ledger/monthly_analysis/?company=1&year=2024

# Get account balances
GET /api/general-ledger/account_balances/?company=1
```

### 6. Journal Entries API
**Endpoint:** `/api/journal-entries/`

#### Available Operations:
- `GET /api/journal-entries/` - List journal entries
- `GET /api/journal-entries/{id}/` - Get specific entry
- `POST /api/journal-entries/` - Create new entry
- `PUT /api/journal-entries/{id}/` - Update entry
- `DELETE /api/journal-entries/{id}/` - Delete entry

#### Filtering Parameters:
- `company` - Filter by company ID
- `entry_date` - Exact date
- `entry_date__gte` - Date greater than or equal
- `entry_date__lte` - Date less than or equal
- `reference` - Reference filter
- `reference__icontains` - Reference contains
- `description` - Description filter
- `description__icontains` - Description contains
- `total_amount` - Exact total amount
- `total_amount__gte` - Total amount greater than or equal
- `total_amount__lte` - Total amount less than or equal

#### Search Fields:
- `reference` - Entry reference
- `description` - Entry description

#### Example Requests:
```bash
# Get entries for date range
GET /api/journal-entries/?entry_date__gte=2024-01-01&entry_date__lte=2024-01-31

# Search by description
GET /api/journal-entries/?search=payment

# Get large transactions
GET /api/journal-entries/?total_amount__gte=10000
```

### 7. Financial Analysis API
**Endpoint:** `/api/financial-analysis/`

#### Custom Actions:
- `GET /api/financial-analysis/profit_loss/` - Generate Profit & Loss statement
- `GET /api/financial-analysis/balance_sheet/` - Generate Balance Sheet

#### Profit & Loss Parameters:
- `company` - Company ID (required)
- `start_date` - Start date (required)
- `end_date` - End date (required)
- `territory` - Territory filter (optional)

#### Balance Sheet Parameters:
- `company` - Company ID (required)
- `as_of_date` - As of date (required)
- `territory` - Territory filter (optional)

#### Example Requests:
```bash
# Get P&L for 2024
GET /api/financial-analysis/profit_loss/?company=1&start_date=2024-01-01&end_date=2024-12-31

# Get Balance Sheet as of Dec 31, 2024
GET /api/financial-analysis/balance_sheet/?company=1&as_of_date=2024-12-31

# Get P&L for specific territory
GET /api/financial-analysis/profit_loss/?company=1&start_date=2024-01-01&end_date=2024-12-31&territory=1
```

## Advanced Query Features

### 1. Filtering
Use URL parameters to filter results:
```bash
# Multiple filters
GET /api/chart-of-accounts/?company=1&class_name=Assets&account_key__gte=1000

# Date range filtering
GET /api/general-ledger/?calendar__date__gte=2024-01-01&calendar__date__lte=2024-12-31

# Text filtering
GET /api/chart-of-accounts/?account__icontains=cash
```

### 2. Searching
Use the `search` parameter for full-text search:
```bash
# Search across multiple fields
GET /api/chart-of-accounts/?search=receivable

# Search journal entries
GET /api/journal-entries/?search=payment
```

### 3. Ordering
Use the `ordering` parameter to sort results:
```bash
# Sort by account key
GET /api/chart-of-accounts/?ordering=account_key

# Sort by date (descending)
GET /api/general-ledger/?ordering=-calendar__date

# Multiple sort fields
GET /api/general-ledger/?ordering=account__account_key,calendar__date
```

### 4. Pagination
Control pagination with `page` and `page_size`:
```bash
# Get page 2 with 50 items per page
GET /api/general-ledger/?page=2&page_size=50

# Get first 10 items
GET /api/chart-of-accounts/?page_size=10
```

## Response Formats

### Standard List Response
```json
{
    "count": 150,
    "next": "http://localhost:8000/api/chart-of-accounts/?page=2",
    "previous": null,
    "results": [
        {
            "id": 1,
            "account_key": 1000,
            "class_name": "Assets",
            "account": "Cash",
            // ... other fields
        }
    ]
}
```

### Error Response
```json
{
    "detail": "Not found."
}
```

### Validation Error Response
```json
{
    "field_name": [
        "This field is required."
    ]
}
```

## Analytics Examples

### 1. Account Analysis
```bash
# Get all cash accounts
GET /api/chart-of-accounts/?search=cash&company=1

# Get account hierarchy
GET /api/chart-of-accounts/hierarchy/?company=1

# Get account usage statistics
GET /api/chart-of-accounts/1/usage/
```

### 2. Financial Reporting
```bash
# Monthly P&L analysis
GET /api/financial-analysis/profit_loss/?company=1&start_date=2024-01-01&end_date=2024-01-31

# Year-end Balance Sheet
GET /api/financial-analysis/balance_sheet/?company=1&as_of_date=2024-12-31

# Account balances
GET /api/general-ledger/account_balances/?company=1
```

### 3. Transaction Analysis
```bash
# Large transactions
GET /api/general-ledger/?amount__gte=10000&company=1

# Monthly transaction summary
GET /api/general-ledger/monthly_analysis/?company=1&year=2024

# Debit vs Credit analysis
GET /api/general-ledger/?debit_credit=D&company=1
```

## Security Features

1. **Authentication Required**: All endpoints require proper authentication
2. **Company-based Filtering**: Data is automatically filtered by company access
3. **Input Validation**: All inputs are validated using Django serializers
4. **SQL Injection Protection**: Django ORM provides automatic protection
5. **Rate Limiting**: API includes throttling to prevent abuse

## Performance Optimization

1. **Database Indexing**: Proper indexes on frequently queried fields
2. **Query Optimization**: Efficient database queries using select_related and prefetch_related
3. **Pagination**: Large datasets are paginated to improve performance
4. **Caching**: Response caching for frequently accessed data

## Export Capabilities

### CSV Export
```bash
# Export general ledger to CSV
GET /api/general-ledger/export_csv/?company=1&format=csv

# Export with filters
GET /api/general-ledger/export_csv/?company=1&account__class_name=Assets&format=csv
```

## Testing the API

Use the provided test script to verify API functionality:
```bash
cd backend
python test_comprehensive_api.py
```

This will test all endpoints, filtering capabilities, analytics features, and ensure the API is working correctly.

## Integration with Frontend

The API is designed to work seamlessly with the React frontend. Use the existing API service layer to make requests:

```javascript
// Example frontend usage
const accounts = await apiService.get('/chart-of-accounts/', {
    params: {
        company: companyId,
        class_name: 'Assets',
        search: 'cash'
    }
});

const profitLoss = await apiService.get('/financial-analysis/profit_loss/', {
    params: {
        company: companyId,
        start_date: '2024-01-01',
        end_date: '2024-12-31'
    }
});
```

This comprehensive API provides all the analytical capabilities you need while maintaining security and performance.