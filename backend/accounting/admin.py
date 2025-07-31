"""
Django admin configuration for the Numerizam Accounting Application.

This module configures the Django admin interface for managing
accounting data through a web-based interface.
"""

from django.contrib import admin
from .models import Company, ChartOfAccounts, Territory, Calendar, GeneralLedger, JournalEntry


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    """Admin interface for Company model."""
    list_display = ('company_id', 'company_name', 'created_at')
    search_fields = ('company_name',)
    readonly_fields = ('company_id', 'created_at')
    ordering = ('company_name',)


@admin.register(ChartOfAccounts)
class ChartOfAccountsAdmin(admin.ModelAdmin):
    """Admin interface for Chart of Accounts model."""
    list_display = ('account_key', 'company', 'account', 'class_name', 'sub_class')
    list_filter = ('company', 'class_name', 'report')
    search_fields = ('account', 'class_name', 'sub_class', 'account_key')
    ordering = ('company', 'account_key')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('company', 'account_key', 'account')
        }),
        ('Classification', {
            'fields': ('report', 'class_name', 'sub_class', 'sub_class2', 'sub_account')
        }),
    )


@admin.register(Territory)
class TerritoryAdmin(admin.ModelAdmin):
    """Admin interface for Territory model."""
    list_display = ('territory_key', 'company', 'country', 'region')
    list_filter = ('company', 'country')
    search_fields = ('country', 'region')
    ordering = ('company', 'country', 'region')


@admin.register(Calendar)
class CalendarAdmin(admin.ModelAdmin):
    """Admin interface for Calendar model."""
    list_display = ('date', 'company', 'year', 'quarter', 'month')
    list_filter = ('company', 'year', 'quarter')
    search_fields = ('date',)
    ordering = ('company', 'date')
    date_hierarchy = 'date'


@admin.register(GeneralLedger)
class GeneralLedgerAdmin(admin.ModelAdmin):
    """Admin interface for General Ledger model."""
    list_display = (
        'entry_no', 'company', 'date', 'account', 'transaction_type', 
        'amount', 'details', 'created_at'
    )
    list_filter = (
        'company', 'transaction_type', 'account__class_name', 
        'territory', 'created_at'
    )
    search_fields = (
        'details', 'reference_number', 'account__account', 
        'entry_no'
    )
    readonly_fields = ('entry_no', 'created_at', 'updated_at')
    ordering = ('-date__date', '-entry_no')
    
    fieldsets = (
        ('Transaction Details', {
            'fields': ('company', 'date', 'account', 'territory')
        }),
        ('Financial Information', {
            'fields': ('transaction_type', 'amount', 'details', 'reference_number')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """Optimize queryset with select_related for better performance."""
        return super().get_queryset(request).select_related(
            'company', 'date', 'account', 'territory'
        )


@admin.register(JournalEntry)
class JournalEntryAdmin(admin.ModelAdmin):
    """Admin interface for Journal Entry model."""
    list_display = (
        'journal_id', 'company', 'date', 'description', 
        'total_debits', 'total_credits', 'is_balanced', 'created_at'
    )
    list_filter = ('company', 'created_at', 'created_by')
    search_fields = ('description', 'reference_number', 'journal_id')
    readonly_fields = (
        'journal_id', 'total_debits', 'total_credits', 
        'is_balanced', 'created_at'
    )
    ordering = ('-date__date', '-journal_id')
    
    fieldsets = (
        ('Journal Information', {
            'fields': ('company', 'date', 'description', 'reference_number')
        }),
        ('Balance Summary', {
            'fields': ('total_debits', 'total_credits', 'is_balanced'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """Optimize queryset with select_related for better performance."""
        return super().get_queryset(request).select_related(
            'company', 'date'
        )


# Customize admin site headers
admin.site.site_header = "Numerizam Accounting Administration"
admin.site.site_title = "Numerizam Admin"
admin.site.index_title = "Welcome to Numerizam Accounting Administration"