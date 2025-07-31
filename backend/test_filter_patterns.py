#!/usr/bin/env python3
"""
Test script for the updated GeneralLedger filter patterns.
Tests the specific query examples requested by the user.
"""

import os
import sys
import django
import requests
import json

# Add the backend directory to Python path
sys.path.append('d:/Projects/Accounting/Numerizam/backend')
os.chdir('d:/Projects/Accounting/Numerizam/backend')

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'numerizam_project.settings')
django.setup()

def test_filter_patterns():
    """Test the updated GeneralLedger filter patterns."""
    base_url = 'http://127.0.0.1:8000/api'
    
    print('🧪 Testing Updated GeneralLedger Filter Patterns...')
    print()
    
    # Test cases matching user's examples
    test_cases = [
        {
            'name': 'Basic GL Query (Select * from GL)',
            'url': f'{base_url}/general-ledger/',
            'description': 'GET /api/general-ledger/'
        },
        {
            'name': 'Account and Territory Filter',
            'url': f'{base_url}/general-ledger/?account=10&territory=3&amount__gt=100000',
            'description': 'WHERE Account_key = 10 AND Territory_key = 3 AND Amount > 100000'
        },
        {
            'name': 'Date Range Filter',
            'url': f'{base_url}/general-ledger/?date_after=2019-01-01&date_before=2019-01-31',
            'description': 'WHERE Date BETWEEN 2019-01-01 AND 2019-01-31'
        },
        {
            'name': 'Details Filter',
            'url': f'{base_url}/general-ledger/?details=Salaries',
            'description': 'WHERE Details = Salaries'
        },
        {
            'name': 'Amount Filters',
            'url': f'{base_url}/general-ledger/?amount__gt=1000&amount__lt=50000',
            'description': 'WHERE Amount > 1000 AND Amount < 50000'
        },
        {
            'name': 'Company Filter',
            'url': f'{base_url}/general-ledger/?company=1',
            'description': 'WHERE Company = 1'
        },
        {
            'name': 'Year Filter',
            'url': f'{base_url}/general-ledger/?year=2019',
            'description': 'WHERE Year = 2019'
        },
        {
            'name': 'Debit/Credit Filter',
            'url': f'{base_url}/general-ledger/?transaction_type=DEBIT',
            'description': 'WHERE transaction_type = DEBIT'
        },
        {
            'name': 'Debit/Credit Filter (Alias)',
            'url': f'{base_url}/general-ledger/?debit_credit=CREDIT',
            'description': 'WHERE transaction_type = CREDIT (using alias)'
        }
    ]
    
    success_count = 0
    total_count = len(test_cases)
    
    for test in test_cases:
        try:
            response = requests.get(test['url'], timeout=5)
            if response.status_code == 200:
                data = response.json()
                print(f'✅ {test["name"]}')
                print(f'   URL: {test["url"]}')
                print(f'   SQL: {test["description"]}')
                print(f'   Status: {response.status_code} - Filter Available')
                print()
                success_count += 1
            else:
                print(f'❌ {test["name"]} - Status: {response.status_code}')
        except Exception as e:
            print(f'❌ {test["name"]} - Error: {str(e)}')
    
    print(f'✅ Filter testing completed! {success_count}/{total_count} tests passed.')
    
    # Test filter availability through OPTIONS request
    print('\n🔍 Testing Filter Availability...')
    try:
        response = requests.options(f'{base_url}/general-ledger/')
        if response.status_code == 200:
            print('✅ OPTIONS request successful - Filters are available')
        else:
            print(f'❌ OPTIONS request failed - Status: {response.status_code}')
    except Exception as e:
        print(f'❌ OPTIONS request error: {str(e)}')

if __name__ == '__main__':
    test_filter_patterns()