"""
Test script for LangGraph Agent functionality.

This script tests the LangGraph agent's ability to process natural language
queries and create accounting transactions.
"""

import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'numerizam_project.settings')
django.setup()

from accounting.models import Company, ChartOfAccounts, Territory, Calendar
from accounting.langgraph_agent import get_agent


def setup_test_data():
    """Create test company and chart of accounts."""
    print("Setting up test data...")
    
    # Create test company
    company, created = Company.objects.get_or_create(
        company_id=1,
        defaults={
            'company_name': 'Test Company Ltd',
            'company_code': 'TEST001',
            'address': '123 Test Street',
            'city': 'Test City',
            'state': 'Test State',
            'country': 'Test Country',
            'postal_code': '12345',
            'phone': '+1-555-0123',
            'email': 'test@testcompany.com'
        }
    )
    
    if created:
        print(f"Created company: {company.company_name}")
    else:
        print(f"Using existing company: {company.company_name}")
    
    # Create chart of accounts
    accounts = [
        {'account_id': 1001, 'account': 'Cash', 'account_type': 'ASSET'},
        {'account_id': 1002, 'account': 'Accounts Receivable', 'account_type': 'ASSET'},
        {'account_id': 1003, 'account': 'Inventory', 'account_type': 'ASSET'},
        {'account_id': 2001, 'account': 'Accounts Payable', 'account_type': 'LIABILITY'},
        {'account_id': 3001, 'account': 'Owner Equity', 'account_type': 'EQUITY'},
        {'account_id': 4001, 'account': 'Sales Revenue', 'account_type': 'REVENUE'},
        {'account_id': 5001, 'account': 'Operating Expenses', 'account_type': 'EXPENSE'},
        {'account_id': 5002, 'account': 'Office Supplies', 'account_type': 'EXPENSE'},
    ]
    
    for account_data in accounts:
        account, created = ChartOfAccounts.objects.get_or_create(
            company=company,
            account_id=account_data['account_id'],
            defaults={
                'account': account_data['account'],
                'account_type': account_data['account_type']
            }
        )
        if created:
            print(f"Created account: {account.account}")
    
    return company


def test_queries():
    """Test various natural language queries."""
    company = setup_test_data()
    agent = get_agent()
    
    test_queries = [
        "Record a sale of $500 for cash on July 18, 2025",
        "Pay $200 for office supplies with cash on July 19, 2025",
        "Receive $1000 cash from customer on account on July 20, 2025",
        "Purchase inventory worth $800 on credit on July 21, 2025",
    ]
    
    print("\n" + "="*60)
    print("TESTING LANGGRAPH AGENT")
    print("="*60)
    
    for i, query in enumerate(test_queries, 1):
        print(f"\nTest {i}: {query}")
        print("-" * 50)
        
        try:
            result = agent.process_query(query, company.company_id)
            
            if result.get('success'):
                print("✅ SUCCESS")
                print(f"Journal ID: {result.get('journal_id')}")
                print(f"Amount: ${result.get('amount')}")
                print(f"Message: {result.get('message')}")
            else:
                print("❌ FAILED")
                print(f"Errors: {result.get('errors', [])}")
                if result.get('parsed_data'):
                    print(f"Parsed data: {result['parsed_data']}")
                    
        except Exception as e:
            print(f"❌ EXCEPTION: {str(e)}")
    
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    # Check created transactions
    from accounting.models import GeneralLedger, JournalEntry
    
    journal_entries = JournalEntry.objects.filter(company=company)
    ledger_entries = GeneralLedger.objects.filter(company=company)
    
    print(f"Journal Entries Created: {journal_entries.count()}")
    print(f"Ledger Entries Created: {ledger_entries.count()}")
    
    for journal in journal_entries:
        print(f"\nJournal {journal.journal_id}: {journal.description}")
        print(f"  Date: {journal.date.date}")
        print(f"  Balanced: {journal.is_balanced}")
        print(f"  Total Debits: ${journal.total_debits}")
        print(f"  Total Credits: ${journal.total_credits}")


if __name__ == "__main__":
    test_queries()