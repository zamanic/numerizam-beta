#!/usr/bin/env python
"""
Test script to verify Django backend functionality.
"""
import os
import sys
import django

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'numerizam_project.settings')
django.setup()

from accounting.models import Company, ChartOfAccounts, Territory, Calendar, GeneralLedger, JournalEntry
from datetime import date

def test_models():
    """Test basic model functionality."""
    print("Testing Django models...")
    
    # Test Company model
    company = Company.objects.create(company_name="Test Company")
    print(f"✓ Created company: {company}")
    
    # Test Calendar model
    calendar_entry = Calendar.objects.create(
        company=company,
        date=date.today(),
        year=2024,
        quarter="Q1",
        month="January",
        day="Monday"
    )
    print(f"✓ Created calendar entry: {calendar_entry}")
    
    # Test Territory model
    territory = Territory.objects.create(
        company=company,
        territory_key=1,
        country="USA",
        region="North"
    )
    print(f"✓ Created territory: {territory}")
    
    # Test ChartOfAccounts model
    account = ChartOfAccounts.objects.create(
        company=company,
        account_key=1000,
        report="Balance Sheet",
        class_name="Assets",
        sub_class="Current Assets",
        sub_class2="Cash",
        account="Cash in Bank",
        sub_account="Checking Account"
    )
    print(f"✓ Created chart of accounts: {account}")
    
    # Test JournalEntry model
    journal = JournalEntry.objects.create(
        company=company,
        date=calendar_entry,
        description="Test journal entry",
        reference_number="TEST001"
    )
    print(f"✓ Created journal entry: {journal}")
    
    # Test GeneralLedger model
    ledger_entry = GeneralLedger.objects.create(
        company=company,
        date=calendar_entry,
        territory=territory,
        account=account,
        details="Test transaction",
        amount=1000.00,
        transaction_type="DEBIT",
        reference_number="TEST001"
    )
    print(f"✓ Created ledger entry: {ledger_entry}")
    
    print("\n✅ All models tested successfully!")
    print(f"Company count: {Company.objects.count()}")
    print(f"Calendar entries: {Calendar.objects.count()}")
    print(f"Territories: {Territory.objects.count()}")
    print(f"Chart of accounts: {ChartOfAccounts.objects.count()}")
    print(f"Journal entries: {JournalEntry.objects.count()}")
    print(f"Ledger entries: {GeneralLedger.objects.count()}")

if __name__ == "__main__":
    test_models()