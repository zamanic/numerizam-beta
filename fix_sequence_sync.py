#!/usr/bin/env python3
"""
Fix PostgreSQL sequence synchronization for GeneralLedger table.

This script addresses the issue where the entry_no sequence is out of sync
with the actual data, causing primary key conflicts during bulk inserts.
"""

import os
import sys
import django
from django.db import connection

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'numerizam_project.settings')
django.setup()

from accounting.models import GeneralLedger

def fix_sequence_sync():
    """Fix the sequence synchronization for GeneralLedger entry_no field."""
    
    print("🔧 Fixing GeneralLedger sequence synchronization...")
    
    # Get the current maximum entry_no
    max_entry = GeneralLedger.objects.aggregate(
        max_entry=django.db.models.Max('entry_no')
    )['max_entry']
    
    if max_entry is None:
        max_entry = 0
    
    print(f"📊 Current maximum entry_no: {max_entry}")
    
    # Fix the sequence
    with connection.cursor() as cursor:
        # Get the sequence name
        cursor.execute("""
            SELECT pg_get_serial_sequence('generalledger', 'entryno');
        """)
        sequence_name = cursor.fetchone()[0]
        
        if sequence_name:
            print(f"🔄 Found sequence: {sequence_name}")
            
            # Set the sequence to the correct value
            next_val = max_entry + 1
            cursor.execute(f"SELECT setval('{sequence_name}', %s);", [next_val])
            
            print(f"✅ Sequence set to next value: {next_val}")
            
            # Verify the fix
            cursor.execute(f"SELECT currval('{sequence_name}');")
            current_val = cursor.fetchone()[0]
            print(f"🔍 Verified current sequence value: {current_val}")
            
        else:
            print("❌ Could not find sequence for generalledger.entryno")
            return False
    
    return True

def test_insert():
    """Test that we can now insert new entries without conflicts."""
    print("\n🧪 Testing new entry insertion...")
    
    try:
        # Try to create a test entry (this should work now)
        from accounting.models import Company, Calendar, ChartOfAccounts
        from datetime import date
        from decimal import Decimal
        
        # Get or create test data
        company, _ = Company.objects.get_or_create(
            company_name="Test Company",
            defaults={'company_name': "Test Company"}
        )
        
        calendar_entry, _ = Calendar.objects.get_or_create(
            company=company,
            date=date.today(),
            defaults={
                'year': date.today().year,
                'quarter': f"Q{(date.today().month - 1) // 3 + 1}",
                'month': date.today().strftime('%B'),
                'day': date.today().strftime('%A')
            }
        )
        
        account, _ = ChartOfAccounts.objects.get_or_create(
            company=company,
            account_key=1000,
            defaults={
                'report': 'Balance Sheet',
                'class_name': 'Assets',
                'subclass': 'Current Assets',
                'subclass2': 'Current Assets',
                'account': 'Test Cash Account',
                'subaccount': ''
            }
        )
        
        # Create a test entry
        test_entry = GeneralLedger.objects.create(
            company=company,
            date=calendar_entry,
            account=account,
            details="Test entry for sequence fix",
            amount=Decimal('100.00'),
            transaction_type='DEBIT'
        )
        
        print(f"✅ Successfully created test entry with entry_no: {test_entry.entry_no}")
        
        # Clean up the test entry
        test_entry.delete()
        print("🧹 Test entry cleaned up")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Starting GeneralLedger sequence fix...")
    
    if fix_sequence_sync():
        if test_insert():
            print("\n🎉 Sequence fix completed successfully!")
            print("💡 You can now process batch transactions without conflicts.")
        else:
            print("\n⚠️  Sequence was fixed but test insertion failed.")
    else:
        print("\n❌ Failed to fix sequence synchronization.")
    
    print("\n📝 Next steps:")
    print("1. Run this script: python fix_sequence_sync.py")
    print("2. Try your batch transaction processing again")
    print("3. The entry numbers should now start from 357 onwards")