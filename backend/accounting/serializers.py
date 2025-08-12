"""
Serializers for the accounting app.

This module defines Django REST Framework serializers for converting
model instances to JSON and vice versa.
"""

from rest_framework import serializers
from .models import Company, ChartOfAccounts, Territory, Calendar, GeneralLedger, JournalEntry


class CompanySerializer(serializers.ModelSerializer):
    """Serializer for Company model."""
    
    class Meta:
        model = Company
        fields = ['company_id', 'company_name', 'created_at']
        read_only_fields = ['company_id', 'created_at']


class ChartOfAccountsSerializer(serializers.ModelSerializer):
    """Serializer for Chart of Accounts model."""
    company_name = serializers.CharField(source='company.company_name', read_only=True)
    
    class Meta:
        model = ChartOfAccounts
        fields = [
            'id', 'company', 'company_name', 'account_key', 'report', 
            'class_name', 'sub_class', 'sub_class2', 'account', 'sub_account'
        ]


class TerritorySerializer(serializers.ModelSerializer):
    """Serializer for Territory model."""
    company_name = serializers.CharField(source='company.company_name', read_only=True)
    
    class Meta:
        model = Territory
        fields = ['id', 'company', 'company_name', 'territory_key', 'country', 'region']


class CalendarSerializer(serializers.ModelSerializer):
    """Serializer for Calendar model."""
    company_name = serializers.CharField(source='company.company_name', read_only=True)
    
    class Meta:
        model = Calendar
        fields = ['id', 'company', 'company_name', 'date', 'year', 'quarter', 'month', 'day']


class GeneralLedgerSerializer(serializers.ModelSerializer):
    """Serializer for General Ledger model."""
    company_name = serializers.CharField(source='company.company_name', read_only=True)
    account_name = serializers.CharField(source='account.account', read_only=True)
    territory_name = serializers.SerializerMethodField()
    date_value = serializers.DateField(source='date.date', read_only=True)
    
    # Add custom fields that are not in the model directly
    year = serializers.IntegerField(source='date.year', read_only=True)
    month = serializers.IntegerField(source='date.month', read_only=True)
    day = serializers.IntegerField(source='date.day', read_only=True)
    quarter = serializers.CharField(source='date.quarter', read_only=True)
    
    # Additional computed fields for enhanced functionality
    date_year = serializers.SerializerMethodField()
    date_month = serializers.SerializerMethodField()
    date_day = serializers.SerializerMethodField()
    
    class Meta:
        model = GeneralLedger
        fields = [
            'entry_no', 'company', 'company_name', 'date', 'date_value',
            'year', 'month', 'day', 'quarter', 'date_year', 'date_month', 'date_day',
            'territory', 'territory_name', 'account', 'account_name',
            'details', 'amount', 'transaction_type', 'reference_number',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['entry_no', 'created_at', 'updated_at']
    
    def get_territory_name(self, obj):
        """Get territory name if territory exists."""
        if obj.territory:
            return f"{obj.territory.country}, {obj.territory.region}"
        return None
    
    def get_date_year(self, obj):
        """Get year from the date field for filtering compatibility."""
        return obj.date.date.year if obj.date else None
    
    def get_date_month(self, obj):
        """Get month from the date field for filtering compatibility."""
        return obj.date.date.month if obj.date else None
    
    def get_date_day(self, obj):
        """Get day from the date field for filtering compatibility."""
        return obj.date.date.day if obj.date else None


class JournalEntrySerializer(serializers.ModelSerializer):
    """Serializer for Journal Entry model."""
    company_name = serializers.CharField(source='company.company_name', read_only=True)
    date_value = serializers.DateField(source='date.date', read_only=True)
    total_debits = serializers.DecimalField(max_digits=19, decimal_places=4, read_only=True)
    total_credits = serializers.DecimalField(max_digits=19, decimal_places=4, read_only=True)
    is_balanced = serializers.BooleanField(read_only=True)
    ledger_entries = GeneralLedgerSerializer(many=True, read_only=True)
    
    class Meta:
        model = JournalEntry
        fields = [
            'journal_id', 'company', 'company_name', 'date', 'date_value',
            'description', 'reference_number', 'total_debits', 'total_credits',
            'is_balanced', 'created_at', 'created_by', 'ledger_entries'
        ]
        read_only_fields = ['journal_id', 'created_at']


class TransactionPayloadSerializer(serializers.Serializer):
    """
    Serializer for processing transaction payloads from the AI system.
    This matches the structure expected from the frontend.
    """
    company_data = serializers.DictField()
    territory_data = serializers.DictField(required=False)
    calendar_data = serializers.DictField()
    chart_of_accounts_data = serializers.ListField(
        child=serializers.DictField()
    )
    general_ledger_entries = serializers.ListField(
        child=serializers.DictField()
    )
    
    def validate_company_data(self, value):
        """Validate company data structure."""
        if 'company_name' not in value:
            raise serializers.ValidationError(
                "Missing required field 'company_name' in company_data"
            )
        return value
    
    def validate_territory_data(self, value):
        """Validate territory data structure."""
        if value:  # Only validate if territory_data is provided
            required_fields = ['Country', 'Region']
            for field in required_fields:
                if field not in value:
                    raise serializers.ValidationError(
                        f"Missing required field '{field}' in territory_data"
                    )
        return value
    
    def validate_calendar_data(self, value):
        """Validate calendar data structure."""
        required_fields = ['Date', 'Year', 'Quarter', 'Month', 'Day']
        for field in required_fields:
            if field not in value:
                raise serializers.ValidationError(
                    f"Missing required field '{field}' in calendar_data"
                )
        return value
    
    def validate_chart_of_accounts_data(self, value):
        """Validate chart of accounts data structure."""
        required_fields = ['Account_key', 'Report', 'Class', 'SubClass', 'SubClass2', 'Account', 'SubAccount']
        
        for chart_entry in value:
            for field in required_fields:
                if field not in chart_entry:
                    raise serializers.ValidationError(
                        f"Missing required field '{field}' in chart_of_accounts_data entry"
                    )
        
        return value
    
    def validate_general_ledger_entries(self, value):
        """Validate that general ledger entries have required fields."""
        required_fields = ['Account_key', 'Amount', 'Type', 'Details']
        
        for entry in value:
            for field in required_fields:
                if field not in entry:
                    raise serializers.ValidationError(
                        f"Missing required field '{field}' in general ledger entry"
                    )
            
            # Validate Type field values - accept both uppercase and proper case
            entry_type = entry['Type'].upper() if isinstance(entry['Type'], str) else str(entry['Type']).upper()
            if entry_type not in ['DEBIT', 'CREDIT']:
                raise serializers.ValidationError(
                    f"Invalid Type '{entry['Type']}'. Must be 'Debit', 'Credit', 'DEBIT', or 'CREDIT'"
                )
        
        # Note: Balance validation removed to allow unbalanced transactions
        # The frontend now handles balance warnings appropriately
        
        return value


class BulkTransactionSerializer(serializers.Serializer):
    """Serializer for bulk transaction creation."""
    company_id = serializers.IntegerField()
    date = serializers.DateField()
    description = serializers.CharField(max_length=255)
    reference_number = serializers.CharField(max_length=50, required=False)
    entries = serializers.ListField(
        child=serializers.DictField()
    )
    
    def validate_entries(self, value):
        """Validate transaction entries."""
        if len(value) < 2:
            raise serializers.ValidationError(
                "At least two entries are required for a valid journal entry"
            )
        
        total_debits = sum(
            float(entry.get('amount', 0)) 
            for entry in value 
            if entry.get('type') == 'DEBIT'
        )
        total_credits = sum(
            float(entry.get('amount', 0)) 
            for entry in value 
            if entry.get('type') == 'CREDIT'
        )
        
        if abs(total_debits - total_credits) > 0.01:  # Allow for small rounding differences
            raise serializers.ValidationError(
                f"Debits ({total_debits}) must equal credits ({total_credits})"
            )
        
        return value