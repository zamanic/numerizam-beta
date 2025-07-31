"""
Advanced filtering for the Numerizam Accounting API.

This module provides comprehensive filtering capabilities using django-filter
to enable complex queries against the accounting database through URL parameters.

Examples of supported queries:
- /api/general-ledger/?amount__gt=1000&date__year=2024
- /api/general-ledger/?account__account__icontains=cash&transaction_type=DEBIT
- /api/chart-of-accounts/?class_name=Assets&company=1
"""

import django_filters
from django.db import models
from .models import Company, ChartOfAccounts, Territory, Calendar, GeneralLedger, JournalEntry


class CompanyFilter(django_filters.FilterSet):
    """Filter for Company model."""
    
    company_name = django_filters.CharFilter(lookup_expr='icontains')
    created_after = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    
    class Meta:
        model = Company
        fields = {
            'company_id': ['exact'],
            'company_name': ['exact', 'icontains', 'istartswith'],
            'created_at': ['exact', 'gte', 'lte', 'year', 'month', 'day'],
        }


class ChartOfAccountsFilter(django_filters.FilterSet):
    """Advanced filter for Chart of Accounts model."""
    
    # Company filters
    company_name = django_filters.CharFilter(field_name='company__company_name', lookup_expr='icontains')
    
    # Account hierarchy filters
    account_search = django_filters.CharFilter(method='filter_account_search')
    account_key_range = django_filters.RangeFilter(field_name='account_key')
    
    # Class-based filters
    class_name = django_filters.ChoiceFilter(choices=[])  # Will be populated dynamically
    sub_class = django_filters.ChoiceFilter(choices=[])
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Dynamically populate choices from database
        if self.queryset:
            class_choices = self.queryset.values_list('class_name', 'class_name').distinct()
            self.filters['class_name'].extra['choices'] = class_choices
            
            subclass_choices = self.queryset.values_list('sub_class', 'sub_class').distinct()
            self.filters['sub_class'].extra['choices'] = subclass_choices
    
    def filter_account_search(self, queryset, name, value):
        """Search across multiple account fields."""
        return queryset.filter(
            models.Q(account__icontains=value) |
            models.Q(sub_account__icontains=value) |
            models.Q(class_name__icontains=value) |
            models.Q(sub_class__icontains=value)
        )
    
    class Meta:
        model = ChartOfAccounts
        fields = {
            'company': ['exact'],
            'account_key': ['exact', 'gte', 'lte', 'in'],
            'report': ['exact', 'icontains'],
            'class_name': ['exact', 'icontains'],
            'sub_class': ['exact', 'icontains'],
            'sub_class2': ['exact', 'icontains'],
            'account': ['exact', 'icontains', 'istartswith'],
            'sub_account': ['exact', 'icontains'],
        }


class TerritoryFilter(django_filters.FilterSet):
    """Filter for Territory model."""
    
    company_name = django_filters.CharFilter(field_name='company__company_name', lookup_expr='icontains')
    location_search = django_filters.CharFilter(method='filter_location_search')
    
    def filter_location_search(self, queryset, name, value):
        """Search across country and region fields."""
        return queryset.filter(
            models.Q(country__icontains=value) |
            models.Q(region__icontains=value)
        )
    
    class Meta:
        model = Territory
        fields = {
            'company': ['exact'],
            'territory_key': ['exact', 'gte', 'lte'],
            'country': ['exact', 'icontains'],
            'region': ['exact', 'icontains'],
        }


class CalendarFilter(django_filters.FilterSet):
    """Advanced filter for Calendar model with date range capabilities."""
    
    company_name = django_filters.CharFilter(field_name='company__company_name', lookup_expr='icontains')
    date_range = django_filters.DateFromToRangeFilter(field_name='date')
    year_range = django_filters.RangeFilter(field_name='year')
    
    # Quarter filtering
    quarter_in = django_filters.BaseInFilter(field_name='quarter')
    
    class Meta:
        model = Calendar
        fields = {
            'company': ['exact'],
            'date': ['exact', 'gte', 'lte', 'year', 'month', 'day'],
            'year': ['exact', 'gte', 'lte'],
            'quarter': ['exact', 'in'],
            'month': ['exact', 'icontains'],
            'day': ['exact', 'icontains'],
        }


class GeneralLedgerFilter(django_filters.FilterSet):
    """
    Comprehensive filter for General Ledger following user's specific query patterns.
    
    This filter handles the following query examples:
    - Select * from GL -> GET /api/general-ledger/
    - ...where Account_key = 10 and Territory_key = 3 and Amount > 100000 
      -> GET /api/general-ledger/?account=10&territory=3&amount__gt=100000
    - ...where Date = '2019-06-30' -> GET /api/general-ledger/?date=2019-06-30
    - ...where Date BETWEEN '2019-01-01' and '2019-01-31' 
      -> GET /api/general-ledger/?date_after=2019-01-01&date_before=2019-01-31
    - ...where Details = 'Salaries' -> GET /api/general-ledger/?details=Salaries
    """
    
    # Date filtering - enables filtering like: /api/general-ledger/?date_after=2025-01-01&date_before=2025-01-31
    date = django_filters.DateFromToRangeFilter(field_name='date__date')
    date_after = django_filters.DateFilter(field_name='date__date', lookup_expr='gte')
    date_before = django_filters.DateFilter(field_name='date__date', lookup_expr='lte')
    
    # Amount filtering - enables filtering like: /api/general-ledger/?amount__gt=100000
    amount = django_filters.NumberFilter(field_name='amount', lookup_expr='exact')
    amount__gt = django_filters.NumberFilter(field_name='amount', lookup_expr='gt')
    amount__lt = django_filters.NumberFilter(field_name='amount', lookup_expr='lt')
    amount__gte = django_filters.NumberFilter(field_name='amount', lookup_expr='gte')
    amount__lte = django_filters.NumberFilter(field_name='amount', lookup_expr='lte')
    
    # Account filtering - enables filtering like: /api/general-ledger/?account=10
    account = django_filters.NumberFilter(field_name='account__account_key', lookup_expr='exact')
    account_key = django_filters.NumberFilter(field_name='account__account_key', lookup_expr='exact')
    
    # Territory filtering - enables filtering like: /api/general-ledger/?territory=3
    territory = django_filters.NumberFilter(field_name='territory__territory_key', lookup_expr='exact')
    territory_key = django_filters.NumberFilter(field_name='territory__territory_key', lookup_expr='exact')
    
    # Details filtering - enables filtering like: /api/general-ledger/?details=Salaries
    details = django_filters.CharFilter(field_name='details', lookup_expr='exact')
    details__icontains = django_filters.CharFilter(field_name='details', lookup_expr='icontains')
    
    # Additional useful filters
    company = django_filters.NumberFilter(field_name='company__company_id', lookup_expr='exact')
    company_name = django_filters.CharFilter(field_name='company__company_name', lookup_expr='icontains')
    
    # Date component filters - Django ORM date lookups
    # Enables filtering like: /api/general-ledger/?date__year=2020&date__month=8
    date__year = django_filters.NumberFilter(field_name='date__date__year')
    date__month = django_filters.NumberFilter(field_name='date__date__month')
    date__day = django_filters.NumberFilter(field_name='date__date__day')
    
    # Legacy date component filters (for backward compatibility)
    year = django_filters.NumberFilter(field_name='date__year')
    quarter = django_filters.CharFilter(field_name='date__quarter')
    month = django_filters.CharFilter(field_name='date__month')
    
    # Account name and class filters
    account_name = django_filters.CharFilter(field_name='account__account', lookup_expr='icontains')
    account_class = django_filters.CharFilter(field_name='account__class_name', lookup_expr='icontains')
    account_sub_class = django_filters.CharFilter(field_name='account__sub_class', lookup_expr='icontains')
    
    # Territory location filters
    territory_country = django_filters.CharFilter(field_name='territory__country', lookup_expr='icontains')
    territory_region = django_filters.CharFilter(field_name='territory__region', lookup_expr='icontains')
    
    # Debit/Credit filtering
    transaction_type = django_filters.CharFilter(field_name='transaction_type', lookup_expr='exact')
    debit_credit = django_filters.CharFilter(field_name='transaction_type', lookup_expr='exact')  # Alias for compatibility
    
    # Reference number filtering
    reference_number = django_filters.CharFilter(field_name='reference_number', lookup_expr='icontains')
    
    # Advanced filters
    has_territory = django_filters.BooleanFilter(field_name='territory', lookup_expr='isnull', exclude=True)
    large_transactions = django_filters.BooleanFilter(method='filter_large_transactions')
    
    # Date created filters
    created_after = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    
    def filter_large_transactions(self, queryset, name, value):
        """Filter for transactions above a certain threshold."""
        if value:
            return queryset.filter(amount__gt=10000)  # Configurable threshold
        return queryset
    
    class Meta:
        model = GeneralLedger
        # Define fields for exact matching and additional lookup expressions
        fields = {
            'company': ['exact'],
            'amount': ['exact', 'gte', 'lte', 'gt', 'lt'],
            'account': ['exact'],
            'territory': ['exact', 'isnull'],
            'details': ['exact', 'icontains'],
            'transaction_type': ['exact'],
            'reference_number': ['exact', 'icontains'],
            'created_at': ['exact', 'gte', 'lte', 'year', 'month', 'day'],
            'date': ['exact', 'gte', 'lte', 'year', 'month', 'day'],  # Enable Django ORM date lookups
        }


class JournalEntryFilter(django_filters.FilterSet):
    """Advanced filter for Journal Entries with balance analysis."""
    
    # Company and basic info
    company_name = django_filters.CharFilter(field_name='company__company_name', lookup_expr='icontains')
    
    # Date filtering
    date_range = django_filters.DateFromToRangeFilter(field_name='date__date')
    year = django_filters.NumberFilter(field_name='date__year')
    quarter = django_filters.CharFilter(field_name='date__quarter')
    month = django_filters.CharFilter(field_name='date__month')
    
    # Description and reference
    description_search = django_filters.CharFilter(field_name='description', lookup_expr='icontains')
    reference_number = django_filters.CharFilter(field_name='reference_number', lookup_expr='icontains')
    created_by = django_filters.CharFilter(field_name='created_by', lookup_expr='icontains')
    
    # Advanced filters
    unbalanced_entries = django_filters.BooleanFilter(method='filter_unbalanced_entries')
    large_entries = django_filters.BooleanFilter(method='filter_large_entries')
    entries_with_territory = django_filters.BooleanFilter(method='filter_entries_with_territory')
    
    # Date created filters
    created_after = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')
    
    def filter_unbalanced_entries(self, queryset, name, value):
        """Filter for journal entries that are not balanced."""
        if value:
            unbalanced_ids = []
            for entry in queryset:
                if not entry.is_balanced:
                    unbalanced_ids.append(entry.journal_id)
            return queryset.filter(journal_id__in=unbalanced_ids)
        return queryset
    
    def filter_large_entries(self, queryset, name, value):
        """Filter for journal entries with large total amounts."""
        if value:
            large_entry_ids = []
            for entry in queryset:
                if entry.total_debits > 50000:  # Configurable threshold
                    large_entry_ids.append(entry.journal_id)
            return queryset.filter(journal_id__in=large_entry_ids)
        return queryset
    
    def filter_entries_with_territory(self, queryset, name, value):
        """Filter for journal entries that have territory-specific ledger entries."""
        if value:
            entries_with_territory = queryset.filter(
                ledger_entries__territory__isnull=False
            ).distinct()
            return entries_with_territory
        return queryset
    
    class Meta:
        model = JournalEntry
        fields = {
            'company': ['exact'],
            'description': ['exact', 'icontains'],
            'reference_number': ['exact', 'icontains'],
            'created_by': ['exact', 'icontains'],
            'created_at': ['exact', 'gte', 'lte', 'year', 'month', 'day'],
        }


# Custom filter for financial analysis
class FinancialAnalysisFilter(django_filters.FilterSet):
    """
    Special filter for financial analysis queries that span multiple models.
    This enables complex analytical queries like:
    - Profit & Loss analysis
    - Balance Sheet queries
    - Cash Flow analysis
    """
    
    # Date range for analysis
    analysis_period_start = django_filters.DateFilter(field_name='date__date', lookup_expr='gte')
    analysis_period_end = django_filters.DateFilter(field_name='date__date', lookup_expr='lte')
    
    # Account type analysis
    revenue_accounts = django_filters.BooleanFilter(method='filter_revenue_accounts')
    expense_accounts = django_filters.BooleanFilter(method='filter_expense_accounts')
    asset_accounts = django_filters.BooleanFilter(method='filter_asset_accounts')
    liability_accounts = django_filters.BooleanFilter(method='filter_liability_accounts')
    equity_accounts = django_filters.BooleanFilter(method='filter_equity_accounts')
    
    def filter_revenue_accounts(self, queryset, name, value):
        if value:
            return queryset.filter(account__class_name__icontains='Revenue')
        return queryset
    
    def filter_expense_accounts(self, queryset, name, value):
        if value:
            return queryset.filter(account__class_name__icontains='Expense')
        return queryset
    
    def filter_asset_accounts(self, queryset, name, value):
        if value:
            return queryset.filter(account__class_name__icontains='Asset')
        return queryset
    
    def filter_liability_accounts(self, queryset, name, value):
        if value:
            return queryset.filter(account__class_name__icontains='Liability')
        return queryset
    
    def filter_equity_accounts(self, queryset, name, value):
        if value:
            return queryset.filter(account__class_name__icontains='Equity')
        return queryset
    
    class Meta:
        model = GeneralLedger
        fields = []