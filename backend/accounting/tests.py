"""
Test cases for the accounting app.

This module contains comprehensive tests for the accounting models,
views, and API endpoints.
"""

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal
from datetime import date

from .models import Company, ChartOfAccounts, Territory, Calendar, GeneralLedger, JournalEntry


class CompanyModelTest(TestCase):
    """Test cases for Company model."""
    
    def setUp(self):
        """Set up test data."""
        self.company = Company.objects.create(company_name="Test Company")
    
    def test_company_creation(self):
        """Test company creation."""
        self.assertEqual(self.company.company_name, "Test Company")
        self.assertTrue(self.company.created_at)
    
    def test_company_str_representation(self):
        """Test string representation."""
        self.assertEqual(str(self.company), "Test Company")


class ChartOfAccountsModelTest(TestCase):
    """Test cases for Chart of Accounts model."""
    
    def setUp(self):
        """Set up test data."""
        self.company = Company.objects.create(company_name="Test Company")
        self.account = ChartOfAccounts.objects.create(
            company=self.company,
            account_key=1000,
            report="Balance Sheet",
            class_name="Assets",
            sub_class="Current Assets",
            sub_class2="Cash",
            account="Cash in Bank",
            sub_account="Checking Account"
        )
    
    def test_account_creation(self):
        """Test account creation."""
        self.assertEqual(self.account.account_key, 1000)
        self.assertEqual(self.account.class_name, "Assets")
    
    def test_unique_constraint(self):
        """Test unique constraint on company and account_key."""
        with self.assertRaises(Exception):
            ChartOfAccounts.objects.create(
                company=self.company,
                account_key=1000,  # Duplicate key
                report="Balance Sheet",
                class_name="Assets",
                sub_class="Current Assets",
                sub_class2="Cash",
                account="Another Cash Account",
                sub_account="Savings Account"
            )


class GeneralLedgerModelTest(TestCase):
    """Test cases for General Ledger model."""
    
    def setUp(self):
        """Set up test data."""
        self.company = Company.objects.create(company_name="Test Company")
        self.calendar = Calendar.objects.create(
            company=self.company,
            date=date.today(),
            year=2024,
            quarter="Q1",
            month="January",
            day="Monday"
        )
        self.account = ChartOfAccounts.objects.create(
            company=self.company,
            account_key=1000,
            report="Balance Sheet",
            class_name="Assets",
            sub_class="Current Assets",
            sub_class2="Cash",
            account="Cash in Bank",
            sub_account="Checking Account"
        )
        self.ledger_entry = GeneralLedger.objects.create(
            company=self.company,
            date=self.calendar,
            account=self.account,
            details="Test transaction",
            amount=Decimal('1000.00'),
            transaction_type='DEBIT'
        )
    
    def test_ledger_entry_creation(self):
        """Test ledger entry creation."""
        self.assertEqual(self.ledger_entry.amount, Decimal('1000.00'))
        self.assertEqual(self.ledger_entry.transaction_type, 'DEBIT')
        self.assertTrue(self.ledger_entry.is_debit)
        self.assertFalse(self.ledger_entry.is_credit)


class JournalEntryModelTest(TestCase):
    """Test cases for Journal Entry model."""
    
    def setUp(self):
        """Set up test data."""
        self.company = Company.objects.create(company_name="Test Company")
        self.calendar = Calendar.objects.create(
            company=self.company,
            date=date.today(),
            year=2024,
            quarter="Q1",
            month="January",
            day="Monday"
        )
        
        # Create accounts
        self.cash_account = ChartOfAccounts.objects.create(
            company=self.company,
            account_key=1000,
            report="Balance Sheet",
            class_name="Assets",
            sub_class="Current Assets",
            sub_class2="Cash",
            account="Cash in Bank",
            sub_account="Checking Account"
        )
        
        self.revenue_account = ChartOfAccounts.objects.create(
            company=self.company,
            account_key=4000,
            report="Income Statement",
            class_name="Revenue",
            sub_class="Operating Revenue",
            sub_class2="Sales",
            account="Sales Revenue",
            sub_account="Product Sales"
        )
        
        # Create journal entry
        self.journal_entry = JournalEntry.objects.create(
            company=self.company,
            date=self.calendar,
            description="Test sale transaction"
        )
        
        # Create ledger entries
        GeneralLedger.objects.create(
            company=self.company,
            date=self.calendar,
            account=self.cash_account,
            details="Cash received from sale",
            amount=Decimal('1000.00'),
            transaction_type='DEBIT'
        )
        
        GeneralLedger.objects.create(
            company=self.company,
            date=self.calendar,
            account=self.revenue_account,
            details="Revenue from sale",
            amount=Decimal('1000.00'),
            transaction_type='CREDIT'
        )
    
    def test_journal_entry_balance(self):
        """Test journal entry balance calculation."""
        # Note: In a real scenario, you'd link ledger entries to journal entries
        # For this test, we're checking the model methods work correctly
        self.assertEqual(self.journal_entry.total_debits, Decimal('0.00'))  # No linked entries yet
        self.assertEqual(self.journal_entry.total_credits, Decimal('0.00'))
        self.assertTrue(self.journal_entry.is_balanced)


class AccountingAPITest(APITestCase):
    """Test cases for accounting API endpoints."""
    
    def setUp(self):
        """Set up test data."""
        self.company = Company.objects.create(company_name="Test Company")
        self.calendar = Calendar.objects.create(
            company=self.company,
            date=date.today(),
            year=2024,
            quarter="Q1",
            month="January",
            day="Monday"
        )
        self.account = ChartOfAccounts.objects.create(
            company=self.company,
            account_key=1000,
            report="Balance Sheet",
            class_name="Assets",
            sub_class="Current Assets",
            sub_class2="Cash",
            account="Cash in Bank",
            sub_account="Checking Account"
        )
    
    def test_company_list_api(self):
        """Test company list API."""
        url = reverse('company-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_chart_of_accounts_api(self):
        """Test chart of accounts API."""
        url = reverse('chartofaccounts-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_process_transaction_api(self):
        """Test transaction processing API."""
        url = reverse('process-transaction')
        data = {
            'company_data': {'Company': 'Test Company'},
            'calendar_data': {'Date': '2024-01-01'},
            'chart_of_accounts_data': {
                'Report': 'Balance Sheet',
                'Class': 'Assets',
                'SubClass': 'Current Assets',
                'SubClass2': 'Cash',
                'Account': 'Cash in Bank',
                'SubAccount': 'Checking Account'
            },
            'general_ledger_entries': [
                {
                    'Account_key': 1000,
                    'Amount': 1000.00,
                    'Type': 'DEBIT',
                    'Details': 'Test transaction'
                }
            ]
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('journal_entry_id', response.data)
    
    def test_bulk_transaction_api(self):
        """Test bulk transaction creation API."""
        url = reverse('bulk-create-transactions')
        data = {
            'company_id': self.company.company_id,
            'date': '2024-01-01',
            'description': 'Bulk test transaction',
            'entries': [
                {
                    'account_key': 1000,
                    'amount': 1000.00,
                    'type': 'DEBIT',
                    'details': 'Debit entry'
                },
                {
                    'account_key': 1000,
                    'amount': 1000.00,
                    'type': 'CREDIT',
                    'details': 'Credit entry'
                }
            ]
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


class ReportAPITest(APITestCase):
    """Test cases for reporting API endpoints."""
    
    def setUp(self):
        """Set up test data."""
        self.company = Company.objects.create(company_name="Test Company")
        self.calendar = Calendar.objects.create(
            company=self.company,
            date=date.today(),
            year=2024,
            quarter="Q1",
            month="January",
            day="Monday"
        )
        
        # Create test accounts
        self.cash_account = ChartOfAccounts.objects.create(
            company=self.company,
            account_key=1000,
            report="Balance Sheet",
            class_name="Assets",
            sub_class="Current Assets",
            sub_class2="Cash",
            account="Cash in Bank",
            sub_account="Checking Account"
        )
        
        self.revenue_account = ChartOfAccounts.objects.create(
            company=self.company,
            account_key=4000,
            report="Income Statement",
            class_name="Revenue",
            sub_class="Operating Revenue",
            sub_class2="Sales",
            account="Sales Revenue",
            sub_account="Product Sales"
        )
        
        # Create test transactions
        GeneralLedger.objects.create(
            company=self.company,
            date=self.calendar,
            account=self.cash_account,
            details="Cash received",
            amount=Decimal('1000.00'),
            transaction_type='DEBIT'
        )
        
        GeneralLedger.objects.create(
            company=self.company,
            date=self.calendar,
            account=self.revenue_account,
            details="Revenue earned",
            amount=Decimal('1000.00'),
            transaction_type='CREDIT'
        )
    
    def test_profit_loss_report_api(self):
        """Test profit and loss report API."""
        url = reverse('profit-loss-report')
        params = {
            'company_id': self.company.company_id,
            'start_date': '2024-01-01',
            'end_date': '2024-12-31'
        }
        
        response = self.client.get(url, params)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_revenue', response.data)
        self.assertIn('total_expenses', response.data)
        self.assertIn('net_income', response.data)
    
    def test_balance_sheet_report_api(self):
        """Test balance sheet report API."""
        url = reverse('balance-sheet-report')
        params = {
            'company_id': self.company.company_id,
            'as_of_date': '2024-12-31'
        }
        
        response = self.client.get(url, params)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_assets', response.data)
        self.assertIn('total_liabilities', response.data)
        self.assertIn('total_equity', response.data)
    
    def test_trial_balance_report_api(self):
        """Test trial balance report API."""
        url = reverse('trial-balance-report')
        params = {
            'company_id': self.company.company_id,
            'as_of_date': '2024-12-31'
        }
        
        response = self.client.get(url, params)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('accounts', response.data)
        self.assertIn('total_debits', response.data)
        self.assertIn('total_credits', response.data)
        self.assertIn('is_balanced', response.data)