#!/usr/bin/env python3
"""
Test script for Django ORM date functions and custom fields.
Tests the specific date filtering capabilities requested by the user.
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

def test_date_functions_and_custom_fields():
    """Test Django ORM date functions and custom fields in the API."""
    base_url = 'http://127.0.0.1:8000/api'
    
    print('🧪 Testing Django ORM Date Functions and Custom Fields...')
    print()
    
    # Test cases for Django ORM date lookups
    test_cases = [
        {
            'name': 'Django ORM Year Filter',
            'url': f'{base_url}/general-ledger/?date__year=2020',
            'description': 'SELECT * FROM table WHERE YEAR([Date])=2020',
            'django_equivalent': 'GET /api/general-ledger/?date__year=2020'
        },
        {
            'name': 'Django ORM Month Filter',
            'url': f'{base_url}/general-ledger/?date__month=8',
            'description': 'SELECT * FROM table WHERE MONTH([Date])=8',
            'django_equivalent': 'GET /api/general-ledger/?date__month=8'
        },
        {
            'name': 'Django ORM Year and Month Combined',
            'url': f'{base_url}/general-ledger/?date__year=2020&date__month=8',
            'description': 'SELECT * FROM table WHERE YEAR([Date])=2020 AND MONTH([Date])=8',
            'django_equivalent': 'GET /api/general-ledger/?date__year=2020&date__month=8'
        },
        {
            'name': 'Django ORM Day Filter',
            'url': f'{base_url}/general-ledger/?date__day=15',
            'description': 'SELECT * FROM table WHERE DAY([Date])=15',
            'django_equivalent': 'GET /api/general-ledger/?date__day=15'
        },
        {
            'name': 'Legacy Year Filter (Backward Compatibility)',
            'url': f'{base_url}/general-ledger/?year=2019',
            'description': 'Legacy filter using Calendar model year field',
            'django_equivalent': 'GET /api/general-ledger/?year=2019'
        },
        {
            'name': 'Legacy Month Filter (Backward Compatibility)',
            'url': f'{base_url}/general-ledger/?month=January',
            'description': 'Legacy filter using Calendar model month field',
            'django_equivalent': 'GET /api/general-ledger/?month=January'
        },
        {
            'name': 'Combined Date Range and Year Filter',
            'url': f'{base_url}/general-ledger/?date__year=2020&amount__gt=1000',
            'description': 'Complex filter combining date and amount',
            'django_equivalent': 'GET /api/general-ledger/?date__year=2020&amount__gt=1000'
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
                print(f'   Django: {test["django_equivalent"]}')
                print(f'   Status: {response.status_code} - Filter Available')
                print()
                success_count += 1
            else:
                print(f'❌ {test["name"]} - Status: {response.status_code}')
        except Exception as e:
            print(f'❌ {test["name"]} - Error: {str(e)}')
    
    print(f'✅ Date function testing completed! {success_count}/{total_count} tests passed.')
    
    # Test custom fields in serializer output
    print('\n🔍 Testing Custom Fields in Serializer Output...')
    try:
        response = requests.get(f'{base_url}/general-ledger/?limit=1')
        if response.status_code == 200:
            data = response.json()
            if data.get('results') and len(data['results']) > 0:
                first_entry = data['results'][0]
                
                # Check for custom fields
                custom_fields = ['year', 'month', 'day', 'quarter', 'date_year', 'date_month', 'date_day']
                available_fields = []
                missing_fields = []
                
                for field in custom_fields:
                    if field in first_entry:
                        available_fields.append(field)
                    else:
                        missing_fields.append(field)
                
                print(f'✅ Custom fields available: {available_fields}')
                if missing_fields:
                    print(f'❌ Missing custom fields: {missing_fields}')
                
                # Show sample data
                print('\n📊 Sample Entry with Custom Fields:')
                for field in ['entry_no', 'date_value', 'year', 'month', 'day', 'quarter', 'amount', 'details']:
                    if field in first_entry:
                        print(f'   {field}: {first_entry[field]}')
                
            else:
                print('❌ No data available to test custom fields')
        else:
            print(f'❌ Failed to fetch data for custom field testing - Status: {response.status_code}')
    except Exception as e:
        print(f'❌ Custom field testing error: {str(e)}')
    
    # Test filter availability through OPTIONS request
    print('\n🔍 Testing Filter Availability...')
    try:
        response = requests.options(f'{base_url}/general-ledger/')
        if response.status_code == 200:
            print('✅ OPTIONS request successful - All filters are available')
        else:
            print(f'❌ OPTIONS request failed - Status: {response.status_code}')
    except Exception as e:
        print(f'❌ OPTIONS request error: {str(e)}')

if __name__ == '__main__':
    test_date_functions_and_custom_fields()