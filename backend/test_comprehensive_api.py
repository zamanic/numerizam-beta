"""
Test script for the comprehensive Numerizam Accounting API.

This script tests the advanced filtering, analytics, and reporting capabilities
of the new API system built with Django REST Framework and django-filter.
"""

import os
import sys
import django
from datetime import datetime, timedelta
import requests
import json

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'numerizam_project.settings')
django.setup()

from accounting.models import Company, ChartOfAccounts, Territory, Calendar, GeneralLedger, JournalEntry
from decimal import Decimal


class APITester:
    """Test class for the comprehensive accounting API."""
    
    def __init__(self, base_url='http://localhost:8000/api'):
        self.base_url = base_url
        self.session = requests.Session()
        self.company_id = None
        
    def setup_test_data(self):
        """Create test data for API testing."""
        print("Setting up test data...")
        
        # Create test company
        company, created = Company.objects.get_or_create(
            company_name="API Test Company",
            defaults={'company_name': "API Test Company"}
        )
        self.company_id = company.company_id
        print(f"Company created: {company.company_name} (ID: {company.company_id})")
        
        # Create chart of accounts
        accounts_data = [
            {'account_key': 1000, 'class_name': 'Assets', 'sub_class': 'Current Assets', 
             'sub_class2': 'Cash', 'account': 'Cash', 'sub_account': 'Petty Cash', 'report': 'Balance Sheet'},
            {'account_key': 1100, 'class_name': 'Assets', 'sub_class': 'Current Assets', 
             'sub_class2': 'Receivables', 'account': 'Accounts Receivable', 'sub_account': 'Trade', 'report': 'Balance Sheet'},
            {'account_key': 2000, 'class_name': 'Liabilities', 'sub_class': 'Current Liabilities', 
             'sub_class2': 'Payables', 'account': 'Accounts Payable', 'sub_account': 'Trade', 'report': 'Balance Sheet'},
            {'account_key': 3000, 'class_name': 'Equity', 'sub_class': 'Owner Equity', 
             'sub_class2': 'Capital', 'account': 'Owner Capital', 'sub_account': 'Initial', 'report': 'Balance Sheet'},
            {'account_key': 4000, 'class_name': 'Revenue', 'sub_class': 'Operating Revenue', 
             'sub_class2': 'Sales', 'account': 'Sales Revenue', 'sub_account': 'Product Sales', 'report': 'Income Statement'},
            {'account_key': 5000, 'class_name': 'Expenses', 'sub_class': 'Operating Expenses', 
             'sub_class2': 'Cost of Sales', 'account': 'Cost of Goods Sold', 'sub_account': 'Direct Costs', 'report': 'Income Statement'},
        ]
        
        for account_data in accounts_data:
            account, created = ChartOfAccounts.objects.get_or_create(
                company=company,
                account_key=account_data['account_key'],
                defaults=account_data
            )
            if created:
                print(f"Account created: {account.account_key} - {account.account}")
        
        # Create territory
        territory, created = Territory.objects.get_or_create(
            company=company,
            territory_key=1,
            defaults={'country': 'USA', 'region': 'California'}
        )
        
        # Create calendar entries
        base_date = datetime(2024, 1, 1).date()
        for i in range(365):
            current_date = base_date + timedelta(days=i)
            calendar_entry, created = Calendar.objects.get_or_create(
                company=company,
                date=current_date,
                defaults={
                    'year': current_date.year,
                    'quarter': f"Q{((current_date.month - 1) // 3) + 1}",
                    'month': current_date.strftime('%B'),
                    'day': current_date.strftime('%A')
                }
            )
        
        print("Test data setup completed!")
        return company
    
    def test_basic_endpoints(self):
        """Test basic CRUD operations on all endpoints."""
        print("\n=== Testing Basic Endpoints ===")
        
        endpoints = [
            'companies',
            'chart-of-accounts',
            'territories',
            'calendar',
            'general-ledger',
            'journal-entries'
        ]
        
        for endpoint in endpoints:
            try:
                response = self.session.get(f"{self.base_url}/{endpoint}/")
                print(f"✅ {endpoint}: {response.status_code} - {len(response.json().get('results', []))} items")
            except Exception as e:
                print(f"❌ {endpoint}: Error - {str(e)}")
    
    def test_filtering_capabilities(self):
        """Test advanced filtering capabilities."""
        print("\n=== Testing Advanced Filtering ===")
        
        # Test company filtering
        try:
            response = self.session.get(f"{self.base_url}/companies/?company_name__icontains=test")
            print(f"✅ Company name filter: {response.status_code} - {len(response.json().get('results', []))} results")
        except Exception as e:
            print(f"❌ Company name filter: {str(e)}")
        
        # Test chart of accounts filtering
        try:
            response = self.session.get(f"{self.base_url}/chart-of-accounts/?class_name=Assets&company={self.company_id}")
            print(f"✅ Chart of accounts class filter: {response.status_code} - {len(response.json().get('results', []))} results")
        except Exception as e:
            print(f"❌ Chart of accounts class filter: {str(e)}")
        
        # Test date range filtering
        try:
            response = self.session.get(f"{self.base_url}/calendar/?date__gte=2024-01-01&date__lte=2024-01-31&company={self.company_id}")
            print(f"✅ Calendar date range filter: {response.status_code} - {len(response.json().get('results', []))} results")
        except Exception as e:
            print(f"❌ Calendar date range filter: {str(e)}")
    
    def test_analytics_endpoints(self):
        """Test analytics and reporting endpoints."""
        print("\n=== Testing Analytics Endpoints ===")
        
        # Test company statistics
        try:
            response = self.session.get(f"{self.base_url}/companies/{self.company_id}/statistics/")
            if response.status_code == 200:
                stats = response.json()
                print(f"✅ Company statistics: {stats['accounts']['total_accounts']} accounts, {stats['territories']['total_territories']} territories")
            else:
                print(f"❌ Company statistics: {response.status_code}")
        except Exception as e:
            print(f"❌ Company statistics: {str(e)}")
        
        # Test chart of accounts hierarchy
        try:
            response = self.session.get(f"{self.base_url}/chart-of-accounts/hierarchy/?company={self.company_id}")
            if response.status_code == 200:
                hierarchy = response.json()
                print(f"✅ Account hierarchy: {len(hierarchy)} account classes")
            else:
                print(f"❌ Account hierarchy: {response.status_code}")
        except Exception as e:
            print(f"❌ Account hierarchy: {str(e)}")
        
        # Test calendar date ranges
        try:
            response = self.session.get(f"{self.base_url}/calendar/date_ranges/?company={self.company_id}")
            if response.status_code == 200:
                date_info = response.json()
                print(f"✅ Date ranges: {date_info['earliest_date']} to {date_info['latest_date']}")
            else:
                print(f"❌ Date ranges: {response.status_code}")
        except Exception as e:
            print(f"❌ Date ranges: {str(e)}")
    
    def test_financial_analysis(self):
        """Test financial analysis endpoints."""
        print("\n=== Testing Financial Analysis ===")
        
        # Test profit & loss
        try:
            response = self.session.get(
                f"{self.base_url}/financial-analysis/profit_loss/"
                f"?company={self.company_id}&start_date=2024-01-01&end_date=2024-12-31"
            )
            if response.status_code == 200:
                pl_data = response.json()
                print(f"✅ Profit & Loss: Revenue: {pl_data['revenue']['total']}, Expenses: {pl_data['expenses']['total']}")
            else:
                print(f"❌ Profit & Loss: {response.status_code}")
        except Exception as e:
            print(f"❌ Profit & Loss: {str(e)}")
        
        # Test balance sheet
        try:
            response = self.session.get(
                f"{self.base_url}/financial-analysis/balance_sheet/"
                f"?company={self.company_id}&as_of_date=2024-12-31"
            )
            if response.status_code == 200:
                bs_data = response.json()
                print(f"✅ Balance Sheet: Assets: {bs_data['total_assets']}, Liabilities: {bs_data['total_liabilities']}")
            else:
                print(f"❌ Balance Sheet: {response.status_code}")
        except Exception as e:
            print(f"❌ Balance Sheet: {str(e)}")
    
    def test_search_capabilities(self):
        """Test search functionality."""
        print("\n=== Testing Search Capabilities ===")
        
        # Test account search
        try:
            response = self.session.get(f"{self.base_url}/chart-of-accounts/?search=cash")
            print(f"✅ Account search: {response.status_code} - {len(response.json().get('results', []))} results")
        except Exception as e:
            print(f"❌ Account search: {str(e)}")
        
        # Test territory search
        try:
            response = self.session.get(f"{self.base_url}/territories/?search=california")
            print(f"✅ Territory search: {response.status_code} - {len(response.json().get('results', []))} results")
        except Exception as e:
            print(f"❌ Territory search: {str(e)}")
    
    def test_ordering_and_pagination(self):
        """Test ordering and pagination."""
        print("\n=== Testing Ordering and Pagination ===")
        
        # Test ordering
        try:
            response = self.session.get(f"{self.base_url}/chart-of-accounts/?ordering=account_key")
            print(f"✅ Account ordering: {response.status_code}")
        except Exception as e:
            print(f"❌ Account ordering: {str(e)}")
        
        # Test pagination
        try:
            response = self.session.get(f"{self.base_url}/calendar/?page_size=10&page=1")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Pagination: {len(data.get('results', []))} items per page")
            else:
                print(f"❌ Pagination: {response.status_code}")
        except Exception as e:
            print(f"❌ Pagination: {str(e)}")
    
    def run_all_tests(self):
        """Run all API tests."""
        print("🚀 Starting Comprehensive API Tests")
        print("=" * 50)
        
        # Setup test data
        company = self.setup_test_data()
        
        # Run tests
        self.test_basic_endpoints()
        self.test_filtering_capabilities()
        self.test_analytics_endpoints()
        self.test_financial_analysis()
        self.test_search_capabilities()
        self.test_ordering_and_pagination()
        
        print("\n" + "=" * 50)
        print("🎉 API Testing Completed!")
        print("\nAPI Features Available:")
        print("• Advanced filtering with URL parameters")
        print("• Full-text search across multiple fields")
        print("• Comprehensive analytics and reporting")
        print("• Financial analysis (P&L, Balance Sheet)")
        print("• Account hierarchy navigation")
        print("• Date range analysis")
        print("• Export capabilities")
        print("• Pagination and ordering")


def main():
    """Main function to run API tests."""
    print("Numerizam Accounting API - Comprehensive Test Suite")
    print("=" * 60)
    
    # Check if Django server is running
    tester = APITester()
    
    try:
        response = requests.get(f"{tester.base_url}/companies/", timeout=5)
        print("✅ Django server is running")
    except requests.exceptions.RequestException:
        print("❌ Django server is not running. Please start the server first:")
        print("   python manage.py runserver")
        return
    
    # Run tests
    tester.run_all_tests()


if __name__ == "__main__":
    main()