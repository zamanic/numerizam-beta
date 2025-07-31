"""
Django models for the Numerizam Accounting Application.

This module defines the database models that correspond to the accounting system's
data structure, including companies, chart of accounts, territories, calendar, 
and general ledger entries.

The models use Django's ORM to automatically generate SQL tables and provide
a Pythonic interface for database operations.
"""

from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal


class Company(models.Model):
    """
    Represents a company in the accounting system.
    Corresponds to the 'Companies' table.
    """
    company_id = models.AutoField(primary_key=True)
    company_name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Companies"
        ordering = ['company_name']
    
    def __str__(self):
        return self.company_name


class ChartOfAccounts(models.Model):
    """
    Represents the chart of accounts for each company.
    Corresponds to the 'ChartOfAccounts' table.
    
    This model defines the account structure and hierarchy used for
    categorizing financial transactions.
    """
    company = models.ForeignKey(
        Company, 
        on_delete=models.CASCADE,
        related_name='chart_of_accounts'
    )
    account_key = models.SmallIntegerField(
        validators=[MinValueValidator(1)]
    )
    report = models.CharField(max_length=50)
    class_name = models.CharField(
        max_length=50, 
        db_column='Class',
        help_text="Account class (e.g., Assets, Liabilities, Equity)"
    )
    sub_class = models.CharField(
        max_length=50, 
        db_column='SubClass',
        help_text="Account sub-class"
    )
    sub_class2 = models.CharField(
        max_length=50, 
        db_column='SubClass2',
        help_text="Secondary sub-class"
    )
    account = models.CharField(
        max_length=50,
        help_text="Account name"
    )
    sub_account = models.CharField(
        max_length=50, 
        db_column='SubAccount',
        help_text="Sub-account name"
    )
    
    class Meta:
        unique_together = ('company', 'account_key')
        verbose_name_plural = "Chart of Accounts"
        ordering = ['company', 'account_key']
    
    def __str__(self):
        return f"{self.company.company_name} - {self.account_key}: {self.account}"


class Territory(models.Model):
    """
    Represents geographical territories for the company.
    Corresponds to the 'Territory' table.
    
    Used for organizing transactions and reporting by geographical regions.
    """
    company = models.ForeignKey(
        Company, 
        on_delete=models.CASCADE,
        related_name='territories'
    )
    territory_key = models.PositiveSmallIntegerField(
        help_text="Unique territory identifier within the company"
    )
    country = models.CharField(max_length=50)
    region = models.CharField(max_length=50)
    
    class Meta:
        unique_together = ('company', 'territory_key')
        verbose_name_plural = "Territories"
        ordering = ['company', 'country', 'region']
    
    def __str__(self):
        return f"{self.company.company_name} - {self.country}, {self.region}"


class Calendar(models.Model):
    """
    Represents calendar dates with hierarchical time periods.
    Corresponds to the 'Calendar' table.
    
    This model provides a standardized way to organize dates into
    years, quarters, months, and days for reporting purposes.
    """
    company = models.ForeignKey(
        Company, 
        on_delete=models.CASCADE,
        related_name='calendar_entries'
    )
    date = models.DateField()
    year = models.SmallIntegerField()
    quarter = models.CharField(
        max_length=50,
        help_text="Quarter designation (e.g., Q1, Q2, Q3, Q4)"
    )
    month = models.CharField(
        max_length=50,
        help_text="Month name or designation"
    )
    day = models.CharField(
        max_length=50,
        help_text="Day designation or name"
    )
    
    class Meta:
        unique_together = ('company', 'date')
        ordering = ['company', 'date']
    
    def __str__(self):
        return f"{self.company.company_name} - {self.date}"


class GeneralLedger(models.Model):
    """
    Represents individual entries in the general ledger.
    Corresponds to the 'GeneralLedger' table.
    
    This is the core transaction model that records all financial
    movements in the accounting system.
    """
    entry_no = models.AutoField(
        primary_key=True, 
        db_column='EntryNo'
    )
    company = models.ForeignKey(
        Company, 
        on_delete=models.CASCADE,
        related_name='ledger_entries'
    )
    date = models.ForeignKey(
        Calendar, 
        on_delete=models.CASCADE, 
        db_column='Date',
        related_name='ledger_entries'
    )
    territory = models.ForeignKey(
        Territory, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        db_column='Territory_key',
        related_name='ledger_entries'
    )
    account = models.ForeignKey(
        ChartOfAccounts, 
        on_delete=models.CASCADE, 
        db_column='Account_key',
        related_name='ledger_entries'
    )
    journal_entry = models.ForeignKey(
        'JournalEntry',
        on_delete=models.CASCADE,
        related_name='ledger_entries',
        null=True,
        blank=True,
        help_text="Associated journal entry for this ledger entry"
    )
    details = models.CharField(
        max_length=255,  # Increased from 50 for more detailed descriptions
        help_text="Transaction description or details"
    )
    amount = models.DecimalField(
        max_digits=19, 
        decimal_places=4,
        help_text="Transaction amount with high precision for financial accuracy"
    )
    
    # Additional fields for enhanced functionality
    transaction_type = models.CharField(
        max_length=10,
        choices=[
            ('DEBIT', 'Debit'),
            ('CREDIT', 'Credit'),
        ],
        help_text="Whether this entry is a debit or credit"
    )
    reference_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="External reference number (invoice, receipt, etc.)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date__date', '-entry_no']
        indexes = [
            models.Index(fields=['company', 'date']),
            models.Index(fields=['account', 'date']),
            models.Index(fields=['territory', 'date']),
        ]
    
    def __str__(self):
        return f"Entry {self.entry_no}: {self.account.account} - {self.amount}"
    
    @property
    def is_debit(self):
        """Returns True if this is a debit entry."""
        return self.transaction_type == 'DEBIT'
    
    @property
    def is_credit(self):
        """Returns True if this is a credit entry."""
        return self.transaction_type == 'CREDIT'


class JournalEntry(models.Model):
    """
    Represents a complete journal entry containing multiple ledger entries.
    This model groups related debit and credit entries together.
    """
    journal_id = models.AutoField(primary_key=True)
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='journal_entries'
    )
    date = models.ForeignKey(
        Calendar,
        on_delete=models.CASCADE,
        related_name='journal_entries'
    )
    description = models.CharField(
        max_length=255,
        help_text="Overall description of the journal entry"
    )
    reference_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Journal entry reference number"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.CharField(
        max_length=100,
        default='System',
        help_text="User or system that created this entry"
    )
    
    class Meta:
        verbose_name_plural = "Journal Entries"
        ordering = ['-date__date', '-journal_id']
    
    def __str__(self):
        return f"Journal {self.journal_id}: {self.description}"
    
    @property
    def total_debits(self):
        """Calculate total debit amount for this journal entry."""
        return self.ledger_entries.filter(
            transaction_type='DEBIT'
        ).aggregate(
            total=models.Sum('amount')
        )['total'] or Decimal('0.00')
    
    @property
    def total_credits(self):
        """Calculate total credit amount for this journal entry."""
        return self.ledger_entries.filter(
            transaction_type='CREDIT'
        ).aggregate(
            total=models.Sum('amount')
        )['total'] or Decimal('0.00')
    
    @property
    def is_balanced(self):
        """Check if the journal entry is balanced (debits = credits)."""
        return self.total_debits == self.total_credits
    
    def get_balance_difference(self):
        """Get the difference between debits and credits."""
        return self.total_debits - self.total_credits