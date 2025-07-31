#!/usr/bin/env python3
"""
Test script for Django aggregation and grouping capabilities.
Tests all the new aggregation endpoints and pivoting functionality.
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

def test_aggregation_endpoints():
    """Test all aggregation and grouping endpoints."""
    base_url = 'http://127.0.0.1:8000/api'
    
    print('🧪 Testing Aggregation and Grouping Capabilities...')
    print()
    
    # Test cases for aggregation endpoints
    test_cases = [
        {
            'name': 'Summary by Territory',
            'url': f'{base_url}/general-ledger/summary_by_territory/',
            'description': 'GROUP BY Territory_key, SUM(Amount)',
            'sql_equivalent': 'SELECT Territory_key, SUM(Amount) FROM table GROUP BY Territory_key'
        },
        {
            'name': 'Summary by Account',
            'url': f'{base_url}/general-ledger/summary_by_account/',
            'description': 'GROUP BY Account_key, SUM(Amount) with Debit/Credit breakdown',
            'sql_equivalent': 'SELECT Account_key, SUM(Amount) FROM table GROUP BY Account_key'
        },
        {
            'name': 'Summary by Date (Daily)',
            'url': f'{base_url}/general-ledger/summary_by_date/?group_by=day',
            'description': 'GROUP BY Date, SUM(Amount) - Daily aggregation',
            'sql_equivalent': 'SELECT Date, SUM(Amount) FROM table GROUP BY Date'
        },
        {
            'name': 'Summary by Date (Monthly)',
            'url': f'{base_url}/general-ledger/summary_by_date/?group_by=month',
            'description': 'GROUP BY YEAR(Date), MONTH(Date), SUM(Amount)',
            'sql_equivalent': 'SELECT YEAR(Date), MONTH(Date), SUM(Amount) FROM table GROUP BY YEAR(Date), MONTH(Date)'
        },
        {
            'name': 'Summary by Date (Yearly)',
            'url': f'{base_url}/general-ledger/summary_by_date/?group_by=year',
            'description': 'GROUP BY YEAR(Date), SUM(Amount)',
            'sql_equivalent': 'SELECT YEAR(Date), SUM(Amount) FROM table GROUP BY YEAR(Date)'
        },
        {
            'name': 'Summary by Transaction Type',
            'url': f'{base_url}/general-ledger/summary_by_transaction_type/',
            'description': 'GROUP BY Transaction_Type, SUM(Amount)',
            'sql_equivalent': 'SELECT Transaction_Type, SUM(Amount) FROM table GROUP BY Transaction_Type'
        },
        {
            'name': 'Summary by Company',
            'url': f'{base_url}/general-ledger/summary_by_company/',
            'description': 'GROUP BY Company, SUM(Amount) with Debit/Credit breakdown',
            'sql_equivalent': 'SELECT Company, SUM(Amount) FROM table GROUP BY Company'
        },
        {
            'name': 'Advanced Multi-dimensional Summary',
            'url': f'{base_url}/general-ledger/advanced_summary/?group_by=territory,account&metrics=sum,count,avg',
            'description': 'Multi-dimensional grouping with custom metrics',
            'sql_equivalent': 'SELECT Territory, Account, SUM(Amount), COUNT(*), AVG(Amount) FROM table GROUP BY Territory, Account'
        },
        {
            'name': 'Pivot Territory by Account',
            'url': f'{base_url}/general-ledger/pivot_territory_by_account/',
            'description': 'Pivot table: Territories as rows, Accounts as columns',
            'sql_equivalent': 'PIVOT operation transforming rows to columns'
        }
    ]
    
    success_count = 0
    total_count = len(test_cases)
    
    for test in test_cases:
        try:
            print(f'🔍 Testing: {test["name"]}')
            print(f'   URL: {test["url"]}')
            print(f'   Description: {test["description"]}')
            print(f'   SQL Equivalent: {test["sql_equivalent"]}')
            
            response = requests.get(test['url'], timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                print(f'   ✅ Status: {response.status_code} - Success')
                
                # Show sample data structure
                if 'data' in data and data['data']:
                    sample_count = min(2, len(data['data']))
                    print(f'   📊 Sample Data ({sample_count} of {len(data["data"])} records):')
                    for i, record in enumerate(data['data'][:sample_count]):
                        print(f'      Record {i+1}: {json.dumps(record, indent=8, default=str)[:200]}...')
                elif 'data' in data:
                    print(f'   📊 No data returned (empty result set)')
                
                # Show summary info
                if 'summary_type' in data:
                    print(f'   📈 Summary Type: {data["summary_type"]}')
                if 'total_territories' in data:
                    print(f'   📈 Total Territories: {data["total_territories"]}')
                if 'total_accounts' in data:
                    print(f'   📈 Total Accounts: {data["total_accounts"]}')
                if 'total_companies' in data:
                    print(f'   📈 Total Companies: {data["total_companies"]}')
                if 'total_periods' in data:
                    print(f'   📈 Total Periods: {data["total_periods"]}')
                if 'total_groups' in data:
                    print(f'   📈 Total Groups: {data["total_groups"]}')
                
                success_count += 1
                
            else:
                print(f'   ❌ Status: {response.status_code} - Failed')
                try:
                    error_data = response.json()
                    print(f'   Error: {error_data}')
                except:
                    print(f'   Error: {response.text[:200]}')
                    
        except Exception as e:
            print(f'   ❌ Exception: {str(e)}')
        
        print()
    
    print(f'✅ Aggregation testing completed! {success_count}/{total_count} tests passed.')
    
    # Test with filters
    print('\n🔍 Testing Aggregation with Filters...')
    filter_tests = [
        {
            'name': 'Territory Summary with Date Filter',
            'url': f'{base_url}/general-ledger/summary_by_territory/?start_date=2020-01-01&end_date=2020-12-31',
            'description': 'Territory aggregation filtered by date range'
        },
        {
            'name': 'Account Summary with Amount Filter',
            'url': f'{base_url}/general-ledger/summary_by_account/?amount__gt=1000',
            'description': 'Account aggregation filtered by amount > 1000'
        },
        {
            'name': 'Advanced Summary with Multiple Filters',
            'url': f'{base_url}/general-ledger/advanced_summary/?group_by=territory&metrics=sum,count&transaction_type=DEBIT',
            'description': 'Advanced summary filtered by transaction type'
        }
    ]
    
    filter_success = 0
    for test in filter_tests:
        try:
            print(f'🔍 {test["name"]}')
            print(f'   URL: {test["url"]}')
            response = requests.get(test['url'], timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                print(f'   ✅ Status: {response.status_code} - Filter applied successfully')
                if 'data' in data:
                    print(f'   📊 Filtered Results: {len(data["data"])} records')
                filter_success += 1
            else:
                print(f'   ❌ Status: {response.status_code} - Filter failed')
                
        except Exception as e:
            print(f'   ❌ Exception: {str(e)}')
        print()
    
    print(f'✅ Filter testing completed! {filter_success}/{len(filter_tests)} tests passed.')
    
    # Test endpoint availability
    print('\n🔍 Testing Endpoint Availability...')
    try:
        response = requests.options(f'{base_url}/general-ledger/')
        if response.status_code == 200:
            print('✅ Base endpoint OPTIONS request successful')
        else:
            print(f'❌ Base endpoint OPTIONS failed - Status: {response.status_code}')
    except Exception as e:
        print(f'❌ Endpoint availability test error: {str(e)}')

if __name__ == '__main__':
    test_aggregation_endpoints()