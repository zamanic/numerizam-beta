"""
Advanced API Views for Numerizam Accounting System.

This module provides comprehensive REST API endpoints with advanced filtering,
aggregation, and analytical capabilities using Django REST Framework and django-filter.

Features:
- Advanced filtering with URL parameters
- Aggregation and grouping capabilities
- Financial analysis endpoints
- Bulk operations
- Export capabilities
- Real-time analytics
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count, Avg, Max, Min, Q
from django.db.models.functions import TruncMonth, TruncYear, TruncQuarter
from django.http import HttpResponse
from decimal import Decimal
import csv
import json
from datetime import datetime, timedelta

from .models import Company, ChartOfAccounts, Territory, Calendar, GeneralLedger, JournalEntry
from .serializers import (
    CompanySerializer, ChartOfAccountsSerializer, TerritorySerializer,
    CalendarSerializer, GeneralLedgerSerializer, JournalEntrySerializer
)
from .filters import (
    CompanyFilter, ChartOfAccountsFilter, TerritoryFilter,
    CalendarFilter, GeneralLedgerFilter, JournalEntryFilter,
    FinancialAnalysisFilter
)


class CompanyViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Company management with advanced filtering.
    
    Supports:
    - CRUD operations
    - Filtering by name, creation date
    - Company statistics
    """
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    filterset_class = CompanyFilter
    search_fields = ['company_name']
    ordering_fields = ['company_id', 'company_name', 'created_at']
    ordering = ['company_name']
    
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Get comprehensive statistics for a company."""
        company = self.get_object()
        
        # Get date range from query params
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        ledger_qs = company.ledger_entries.all()
        if start_date:
            ledger_qs = ledger_qs.filter(date__date__gte=start_date)
        if end_date:
            ledger_qs = ledger_qs.filter(date__date__lte=end_date)
        
        stats = {
            'company_info': {
                'id': company.company_id,
                'name': company.company_name,
                'created_at': company.created_at,
            },
            'accounts': {
                'total_accounts': company.chart_of_accounts.count(),
                'by_class': list(
                    company.chart_of_accounts.values('class_name')
                    .annotate(count=Count('id'))
                    .order_by('class_name')
                ),
            },
            'territories': {
                'total_territories': company.territories.count(),
                'by_country': list(
                    company.territories.values('country')
                    .annotate(count=Count('id'))
                    .order_by('country')
                ),
            },
            'transactions': {
                'total_entries': ledger_qs.count(),
                'total_amount': ledger_qs.aggregate(total=Sum('amount'))['total'] or 0,
                'by_type': list(
                    ledger_qs.values('transaction_type')
                    .annotate(
                        count=Count('entry_no'),
                        total_amount=Sum('amount')
                    )
                ),
                'by_month': list(
                    ledger_qs.annotate(month=TruncMonth('date__date'))
                    .values('month')
                    .annotate(
                        count=Count('entry_no'),
                        total_amount=Sum('amount')
                    )
                    .order_by('month')
                ),
            },
            'journal_entries': {
                'total_journals': company.journal_entries.count(),
                'balanced_entries': sum(1 for j in company.journal_entries.all() if j.is_balanced),
            }
        }
        
        return Response(stats)


class ChartOfAccountsViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Chart of Accounts with hierarchical filtering.
    
    Supports:
    - Account hierarchy navigation
    - Class-based filtering
    - Account usage statistics
    """
    queryset = ChartOfAccounts.objects.select_related('company').all()
    serializer_class = ChartOfAccountsSerializer
    filterset_class = ChartOfAccountsFilter
    search_fields = ['account', 'sub_account', 'class_name', 'sub_class']
    ordering_fields = ['account_key', 'account', 'class_name']
    ordering = ['company', 'account_key']
    
    @action(detail=False, methods=['get'])
    def hierarchy(self, request):
        """Get account hierarchy grouped by class and sub-class."""
        company_id = request.query_params.get('company')
        if not company_id:
            return Response({'error': 'company parameter is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        accounts = self.get_queryset().filter(company_id=company_id)
        
        hierarchy = {}
        for account in accounts:
            class_name = account.class_name
            if class_name not in hierarchy:
                hierarchy[class_name] = {}
            
            sub_class = account.sub_class
            if sub_class not in hierarchy[class_name]:
                hierarchy[class_name][sub_class] = []
            
            hierarchy[class_name][sub_class].append({
                'account_key': account.account_key,
                'account': account.account,
                'sub_account': account.sub_account,
                'report': account.report,
            })
        
        return Response(hierarchy)
    
    @action(detail=True, methods=['get'])
    def usage_statistics(self, request, pk=None):
        """Get usage statistics for a specific account."""
        account = self.get_object()
        
        # Get date range from query params
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        ledger_qs = account.ledger_entries.all()
        if start_date:
            ledger_qs = ledger_qs.filter(date__date__gte=start_date)
        if end_date:
            ledger_qs = ledger_qs.filter(date__date__lte=end_date)
        
        stats = {
            'account_info': {
                'account_key': account.account_key,
                'account_name': account.account,
                'class_name': account.class_name,
                'sub_class': account.sub_class,
            },
            'usage': {
                'total_transactions': ledger_qs.count(),
                'total_debits': ledger_qs.filter(transaction_type='DEBIT').aggregate(
                    total=Sum('amount'))['total'] or 0,
                'total_credits': ledger_qs.filter(transaction_type='CREDIT').aggregate(
                    total=Sum('amount'))['total'] or 0,
                'average_amount': ledger_qs.aggregate(avg=Avg('amount'))['avg'] or 0,
                'largest_transaction': ledger_qs.aggregate(max=Max('amount'))['max'] or 0,
                'smallest_transaction': ledger_qs.aggregate(min=Min('amount'))['min'] or 0,
            },
            'monthly_activity': list(
                ledger_qs.annotate(month=TruncMonth('date__date'))
                .values('month')
                .annotate(
                    count=Count('entry_no'),
                    total_amount=Sum('amount'),
                    debits=Sum('amount', filter=Q(transaction_type='DEBIT')),
                    credits=Sum('amount', filter=Q(transaction_type='CREDIT'))
                )
                .order_by('month')
            )
        }
        
        return Response(stats)


class TerritoryViewSet(viewsets.ModelViewSet):
    """API endpoint for Territory management."""
    queryset = Territory.objects.select_related('company').all()
    serializer_class = TerritorySerializer
    filterset_class = TerritoryFilter
    search_fields = ['country', 'region']
    ordering_fields = ['territory_key', 'country', 'region']
    ordering = ['company', 'country', 'region']


class CalendarViewSet(viewsets.ModelViewSet):
    """API endpoint for Calendar with date range utilities."""
    queryset = Calendar.objects.select_related('company').all()
    serializer_class = CalendarSerializer
    filterset_class = CalendarFilter
    search_fields = ['quarter', 'month', 'day']
    ordering_fields = ['date', 'year']
    ordering = ['company', 'date']
    
    @action(detail=False, methods=['get'])
    def date_ranges(self, request):
        """Get available date ranges for a company."""
        company_id = request.query_params.get('company')
        if not company_id:
            return Response({'error': 'company parameter is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        calendar_qs = self.get_queryset().filter(company_id=company_id)
        
        date_info = {
            'earliest_date': calendar_qs.aggregate(min=Min('date'))['min'],
            'latest_date': calendar_qs.aggregate(max=Max('date'))['max'],
            'available_years': list(
                calendar_qs.values_list('year', flat=True).distinct().order_by('year')
            ),
            'available_quarters': list(
                calendar_qs.values_list('quarter', flat=True).distinct().order_by('quarter')
            ),
        }
        
        return Response(date_info)


class GeneralLedgerViewSet(viewsets.ModelViewSet):
    """
    Comprehensive API endpoint for General Ledger with advanced analytics.
    
    This is the core endpoint for financial data analysis with extensive
    filtering, aggregation, and export capabilities.
    """
    queryset = GeneralLedger.objects.select_related(
        'company', 'date', 'territory', 'account'
    ).all()
    serializer_class = GeneralLedgerSerializer
    filterset_class = GeneralLedgerFilter
    search_fields = ['details', 'reference_number', 'account__account']
    ordering_fields = ['entry_no', 'date__date', 'amount', 'account__account_key']
    ordering = ['-date__date', '-entry_no']
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get summary statistics for filtered ledger entries."""
        queryset = self.filter_queryset(self.get_queryset())
        
        summary = {
            'total_entries': queryset.count(),
            'total_amount': queryset.aggregate(total=Sum('amount'))['total'] or 0,
            'total_debits': queryset.filter(transaction_type='DEBIT').aggregate(
                total=Sum('amount'))['total'] or 0,
            'total_credits': queryset.filter(transaction_type='CREDIT').aggregate(
                total=Sum('amount'))['total'] or 0,
            'average_amount': queryset.aggregate(avg=Avg('amount'))['avg'] or 0,
            'largest_transaction': queryset.aggregate(max=Max('amount'))['max'] or 0,
            'by_account_class': list(
                queryset.values('account__class_name')
                .annotate(
                    count=Count('entry_no'),
                    total_amount=Sum('amount')
                )
                .order_by('account__class_name')
            ),
            'by_transaction_type': list(
                queryset.values('transaction_type')
                .annotate(
                    count=Count('entry_no'),
                    total_amount=Sum('amount')
                )
            ),
        }
        
        return Response(summary)
    
    @action(detail=False, methods=['get'])
    def monthly_analysis(self, request):
        """Get monthly analysis of ledger entries."""
        queryset = self.filter_queryset(self.get_queryset())
        
        monthly_data = list(
            queryset.annotate(month=TruncMonth('date__date'))
            .values('month')
            .annotate(
                total_entries=Count('entry_no'),
                total_amount=Sum('amount'),
                total_debits=Sum('amount', filter=Q(transaction_type='DEBIT')),
                total_credits=Sum('amount', filter=Q(transaction_type='CREDIT')),
                unique_accounts=Count('account', distinct=True),
                avg_transaction_size=Avg('amount')
            )
            .order_by('month')
        )
        
        return Response(monthly_data)
    
    @action(detail=False, methods=['get'])
    def account_balances(self, request):
        """Calculate account balances based on filtered entries."""
        queryset = self.filter_queryset(self.get_queryset())
        
        balances = {}
        for entry in queryset:
            account_key = entry.account.account_key
            account_name = entry.account.account
            
            if account_key not in balances:
                balances[account_key] = {
                    'account_key': account_key,
                    'account_name': account_name,
                    'class_name': entry.account.class_name,
                    'debits': Decimal('0.00'),
                    'credits': Decimal('0.00'),
                    'balance': Decimal('0.00'),
                    'entry_count': 0
                }
            
            balances[account_key]['entry_count'] += 1
            
            if entry.transaction_type == 'DEBIT':
                balances[account_key]['debits'] += entry.amount
            else:
                balances[account_key]['credits'] += entry.amount
            
            # Calculate balance (debits - credits for most account types)
            balances[account_key]['balance'] = (
                balances[account_key]['debits'] - balances[account_key]['credits']
            )
        
        return Response(list(balances.values()))
    
    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """Export filtered ledger entries to CSV."""
        queryset = self.filter_queryset(self.get_queryset())
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="ledger_export.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'Entry No', 'Company', 'Date', 'Account Key', 'Account Name',
            'Territory', 'Details', 'Amount', 'Transaction Type',
            'Reference Number', 'Created At'
        ])
        
        for entry in queryset:
            writer.writerow([
                entry.entry_no,
                entry.company.company_name,
                entry.date.date,
                entry.account.account_key,
                entry.account.account,
                f"{entry.territory.country}, {entry.territory.region}" if entry.territory else '',
                entry.details,
                entry.amount,
                entry.transaction_type,
                entry.reference_number or '',
                entry.created_at
            ])
        
        return response

    # ============ AGGREGATION AND GROUPING CAPABILITIES ============
    
    @action(detail=False, methods=['get'])
    def summary_by_territory(self, request):
        """
        Group by territory and calculate aggregations.
        SQL Equivalent: SELECT Territory, SUM(Amount), COUNT(*), AVG(Amount), MAX(Amount), MIN(Amount) 
                       FROM table GROUP BY Territory
        """
        queryset = self.filter_queryset(self.get_queryset())
        
        summary_data = queryset.values('territory__territory_key', 'territory__country', 'territory__region') \
                              .annotate(
                                  total_amount=Sum('amount'),
                                  count=Count('entry_no'),
                                  average_amount=Avg('amount'),
                                  max_amount=Max('amount'),
                                  min_amount=Min('amount')
                              ) \
                              .order_by('territory__territory_key')
        
        return Response(list(summary_data))
    
    @action(detail=False, methods=['get'])
    def summary_by_account(self, request):
        """
        Group by account and calculate aggregations.
        SQL Equivalent: SELECT Account, SUM(Amount), COUNT(*), AVG(Amount), 
                       SUM(CASE WHEN Type='DEBIT' THEN Amount ELSE 0 END) as Debits,
                       SUM(CASE WHEN Type='CREDIT' THEN Amount ELSE 0 END) as Credits
                       FROM table GROUP BY Account
        """
        queryset = self.filter_queryset(self.get_queryset())
        
        summary_data = queryset.values('account__account_key', 'account__account', 'account__class_name') \
                              .annotate(
                                  total_amount=Sum('amount'),
                                  count=Count('entry_no'),
                                  average_amount=Avg('amount'),
                                  debit_total=Sum('amount', filter=Q(transaction_type='DEBIT')),
                                  credit_total=Sum('amount', filter=Q(transaction_type='CREDIT'))
                              ) \
                              .order_by('account__account_key')
        
        # Calculate net balance for each account
        for item in summary_data:
            debit_total = item['debit_total'] or 0
            credit_total = item['credit_total'] or 0
            item['net_balance'] = debit_total - credit_total
        
        return Response(list(summary_data))
    
    @action(detail=False, methods=['get'])
    def summary_by_date(self, request):
        """
        Group by date (day, month, or year) and calculate aggregations.
        SQL Equivalent: SELECT DATE_PART('month', Date), SUM(Amount), COUNT(*), AVG(Amount)
                       FROM table GROUP BY DATE_PART('month', Date)
        """
        queryset = self.filter_queryset(self.get_queryset())
        group_by = request.query_params.get('group_by', 'month')  # day, month, year
        
        if group_by == 'day':
            summary_data = queryset.extra(select={'date_group': "DATE(date)"}) \
                                  .values('date_group') \
                                  .annotate(
                                      total_amount=Sum('amount'),
                                      count=Count('entry_no'),
                                      average_amount=Avg('amount')
                                  ) \
                                  .order_by('date_group')
        elif group_by == 'year':
            summary_data = queryset.annotate(year=TruncYear('date__date')) \
                                  .values('year') \
                                  .annotate(
                                      total_amount=Sum('amount'),
                                      count=Count('entry_no'),
                                      average_amount=Avg('amount')
                                  ) \
                                  .order_by('year')
        else:  # month (default)
            summary_data = queryset.annotate(month=TruncMonth('date__date')) \
                                  .values('month') \
                                  .annotate(
                                      total_amount=Sum('amount'),
                                      count=Count('entry_no'),
                                      average_amount=Avg('amount')
                                  ) \
                                  .order_by('month')
        
        return Response(list(summary_data))
    
    @action(detail=False, methods=['get'])
    def summary_by_transaction_type(self, request):
        """
        Group by transaction type and calculate aggregations.
        SQL Equivalent: SELECT TransactionType, SUM(Amount), COUNT(*), AVG(Amount), MAX(Amount), MIN(Amount)
                       FROM table GROUP BY TransactionType
        """
        queryset = self.filter_queryset(self.get_queryset())
        
        summary_data = queryset.values('transaction_type') \
                              .annotate(
                                  total_amount=Sum('amount'),
                                  count=Count('entry_no'),
                                  average_amount=Avg('amount'),
                                  max_amount=Max('amount'),
                                  min_amount=Min('amount')
                              ) \
                              .order_by('transaction_type')
        
        return Response(list(summary_data))
    
    @action(detail=False, methods=['get'])
    def summary_by_company(self, request):
        """
        Group by company and calculate aggregations.
        SQL Equivalent: SELECT Company, SUM(Amount), COUNT(*), AVG(Amount),
                       SUM(CASE WHEN Type='DEBIT' THEN Amount ELSE 0 END) as Debits,
                       SUM(CASE WHEN Type='CREDIT' THEN Amount ELSE 0 END) as Credits
                       FROM table GROUP BY Company
        """
        queryset = self.filter_queryset(self.get_queryset())
        
        summary_data = queryset.values('company__company_id', 'company__company_name') \
                              .annotate(
                                  total_amount=Sum('amount'),
                                  count=Count('entry_no'),
                                  average_amount=Avg('amount'),
                                  debit_total=Sum('amount', filter=Q(transaction_type='DEBIT')),
                                  credit_total=Sum('amount', filter=Q(transaction_type='CREDIT'))
                              ) \
                              .order_by('company__company_name')
        
        # Calculate net balance for each company
        for item in summary_data:
            debit_total = item['debit_total'] or 0
            credit_total = item['credit_total'] or 0
            item['net_balance'] = debit_total - credit_total
        
        return Response(list(summary_data))
    
    @action(detail=False, methods=['get'])
    def pivot_territory_by_account(self, request):
        """
        Create a pivot table: Territories as rows, Accounts as columns, Amount as values.
        SQL Equivalent: PIVOT operation transforming rows to columns
        """
        queryset = self.filter_queryset(self.get_queryset())
        
        try:
            import pandas as pd
            
            # Convert queryset to DataFrame
            data = list(queryset.values(
                'territory__country', 'territory__region', 
                'account__account', 'amount'
            ))
            
            if not data:
                return Response({'message': 'No data available for pivot table'})
            
            df = pd.DataFrame(data)
            df['territory'] = df['territory__country'] + ' - ' + df['territory__region']
            
            # Create pivot table
            pivot_table = df.pivot_table(
                values='amount',
                index='territory',
                columns='account__account',
                aggfunc='sum',
                fill_value=0
            )
            
            # Convert to dictionary format
            result = {
                'territories': list(pivot_table.index),
                'accounts': list(pivot_table.columns),
                'data': pivot_table.to_dict('index')
            }
            
            return Response(result)
            
        except ImportError:
            # Fallback without pandas
            pivot_data = {}
            
            for entry in queryset:
                territory_key = f"{entry.territory.country} - {entry.territory.region}" if entry.territory else "Unknown"
                account_name = entry.account.account
                
                if territory_key not in pivot_data:
                    pivot_data[territory_key] = {}
                
                if account_name not in pivot_data[territory_key]:
                    pivot_data[territory_key][account_name] = 0
                
                pivot_data[territory_key][account_name] += float(entry.amount)
            
            # Get all unique accounts
            all_accounts = set()
            for territory_data in pivot_data.values():
                all_accounts.update(territory_data.keys())
            
            result = {
                'territories': list(pivot_data.keys()),
                'accounts': list(all_accounts),
                'data': pivot_data
            }
            
            return Response(result)
    
    @action(detail=False, methods=['get'])
    def advanced_summary(self, request):
        """
        Advanced multi-dimensional summary with dynamic grouping.
        Supports multiple group_by fields and metrics.
        
        Query Parameters:
        - group_by: Comma-separated list (territory, account, company, transaction_type, date)
        - metrics: Comma-separated list (sum, count, avg, max, min)
        - date_group: For date grouping (day, month, year)
        """
        queryset = self.filter_queryset(self.get_queryset())
        
        group_by_fields = request.query_params.get('group_by', 'territory').split(',')
        metrics = request.query_params.get('metrics', 'sum,count').split(',')
        date_group = request.query_params.get('date_group', 'month')
        
        # Build values() fields based on group_by
        values_fields = []
        for field in group_by_fields:
            if field.strip() == 'territory':
                values_fields.extend(['territory__territory_key', 'territory__country', 'territory__region'])
            elif field.strip() == 'account':
                values_fields.extend(['account__account_key', 'account__account', 'account__class_name'])
            elif field.strip() == 'company':
                values_fields.extend(['company__company_id', 'company__company_name'])
            elif field.strip() == 'transaction_type':
                values_fields.append('transaction_type')
            elif field.strip() == 'date':
                if date_group == 'year':
                    queryset = queryset.annotate(date_group=TruncYear('date__date'))
                elif date_group == 'day':
                    queryset = queryset.extra(select={'date_group': "DATE(date)"})
                else:  # month
                    queryset = queryset.annotate(date_group=TruncMonth('date__date'))
                values_fields.append('date_group')
        
        # Build annotations based on metrics
        annotations = {}
        for metric in metrics:
            metric = metric.strip()
            if metric == 'sum':
                annotations['total_amount'] = Sum('amount')
            elif metric == 'count':
                annotations['count'] = Count('entry_no')
            elif metric == 'avg':
                annotations['average_amount'] = Avg('amount')
            elif metric == 'max':
                annotations['max_amount'] = Max('amount')
            elif metric == 'min':
                annotations['min_amount'] = Min('amount')
        
        # Add debit/credit totals if requested
        if 'debit_total' in request.query_params.get('metrics', ''):
            annotations['debit_total'] = Sum('amount', filter=Q(transaction_type='DEBIT'))
        if 'credit_total' in request.query_params.get('metrics', ''):
            annotations['credit_total'] = Sum('amount', filter=Q(transaction_type='CREDIT'))
        
        summary_data = queryset.values(*values_fields) \
                              .annotate(**annotations) \
                              .order_by(*values_fields)
        
        return Response({
            'group_by': group_by_fields,
            'metrics': metrics,
            'data': list(summary_data)
        })


class JournalEntryViewSet(viewsets.ModelViewSet):
    """API endpoint for Journal Entries with balance validation."""
    queryset = JournalEntry.objects.select_related('company', 'date').prefetch_related(
        'ledger_entries__account', 'ledger_entries__territory'
    ).all()
    serializer_class = JournalEntrySerializer
    filterset_class = JournalEntryFilter
    search_fields = ['description', 'reference_number', 'created_by']
    ordering_fields = ['journal_id', 'date__date', 'created_at']
    ordering = ['-date__date', '-journal_id']
    
    @action(detail=False, methods=['get'])
    def balance_report(self, request):
        """Get balance report for journal entries."""
        queryset = self.filter_queryset(self.get_queryset())
        
        balanced_count = 0
        unbalanced_entries = []
        
        for journal in queryset:
            if journal.is_balanced:
                balanced_count += 1
            else:
                unbalanced_entries.append({
                    'journal_id': journal.journal_id,
                    'description': journal.description,
                    'date': journal.date.date,
                    'total_debits': journal.total_debits,
                    'total_credits': journal.total_credits,
                    'difference': journal.get_balance_difference()
                })
        
        report = {
            'total_journals': queryset.count(),
            'balanced_journals': balanced_count,
            'unbalanced_journals': len(unbalanced_entries),
            'balance_percentage': (balanced_count / queryset.count() * 100) if queryset.count() > 0 else 0,
            'unbalanced_entries': unbalanced_entries
        }
        
        return Response(report)


class FinancialAnalysisViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Specialized viewset for financial analysis and reporting.
    
    Provides endpoints for:
    - Profit & Loss analysis
    - Balance Sheet data
    - Cash Flow analysis
    - Financial ratios
    """
    queryset = GeneralLedger.objects.select_related(
        'company', 'date', 'account'
    ).all()
    serializer_class = GeneralLedgerSerializer
    filterset_class = FinancialAnalysisFilter
    
    @action(detail=False, methods=['get'])
    def profit_loss(self, request):
        """Generate Profit & Loss statement."""
        company_id = request.query_params.get('company')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if not all([company_id, start_date, end_date]):
            return Response({
                'error': 'company, start_date, and end_date parameters are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = self.get_queryset().filter(
            company_id=company_id,
            date__date__gte=start_date,
            date__date__lte=end_date
        )
        
        # Revenue accounts (typically credits increase revenue)
        revenue = queryset.filter(
            account__class_name__icontains='Revenue',
            transaction_type='CREDIT'
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        # Expense accounts (typically debits increase expenses)
        expenses = queryset.filter(
            account__class_name__icontains='Expense',
            transaction_type='DEBIT'
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        net_income = revenue - expenses
        
        pl_statement = {
            'period': {
                'start_date': start_date,
                'end_date': end_date,
                'company_id': company_id
            },
            'revenue': {
                'total': revenue,
                'by_account': list(
                    queryset.filter(
                        account__class_name__icontains='Revenue',
                        transaction_type='CREDIT'
                    ).values('account__account')
                    .annotate(total=Sum('amount'))
                    .order_by('-total')
                )
            },
            'expenses': {
                'total': expenses,
                'by_account': list(
                    queryset.filter(
                        account__class_name__icontains='Expense',
                        transaction_type='DEBIT'
                    ).values('account__account')
                    .annotate(total=Sum('amount'))
                    .order_by('-total')
                )
            },
            'net_income': net_income,
            'profit_margin': (net_income / revenue * 100) if revenue > 0 else 0
        }
        
        return Response(pl_statement)
    
    @action(detail=False, methods=['get'])
    def balance_sheet(self, request):
        """Generate Balance Sheet data."""
        company_id = request.query_params.get('company')
        as_of_date = request.query_params.get('as_of_date')
        
        if not all([company_id, as_of_date]):
            return Response({
                'error': 'company and as_of_date parameters are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = self.get_queryset().filter(
            company_id=company_id,
            date__date__lte=as_of_date
        )
        
        # Calculate balances by account class
        assets = self._calculate_class_balance(queryset, 'Asset')
        liabilities = self._calculate_class_balance(queryset, 'Liability')
        equity = self._calculate_class_balance(queryset, 'Equity')
        
        balance_sheet = {
            'as_of_date': as_of_date,
            'company_id': company_id,
            'assets': assets,
            'liabilities': liabilities,
            'equity': equity,
            'total_assets': sum(account['balance'] for account in assets['accounts']),
            'total_liabilities': sum(account['balance'] for account in liabilities['accounts']),
            'total_equity': sum(account['balance'] for account in equity['accounts']),
        }
        
        # Verify balance sheet equation: Assets = Liabilities + Equity
        balance_sheet['is_balanced'] = abs(
            balance_sheet['total_assets'] - 
            (balance_sheet['total_liabilities'] + balance_sheet['total_equity'])
        ) < 0.01
        
        return Response(balance_sheet)
    
    def _calculate_class_balance(self, queryset, class_name):
        """Helper method to calculate balances for an account class."""
        class_entries = queryset.filter(account__class_name__icontains=class_name)
        
        accounts = {}
        for entry in class_entries:
            account_key = entry.account.account_key
            if account_key not in accounts:
                accounts[account_key] = {
                    'account_key': account_key,
                    'account_name': entry.account.account,
                    'debits': Decimal('0.00'),
                    'credits': Decimal('0.00'),
                    'balance': Decimal('0.00')
                }
            
            if entry.transaction_type == 'DEBIT':
                accounts[account_key]['debits'] += entry.amount
            else:
                accounts[account_key]['credits'] += entry.amount
        
        # Calculate balances (normal balance depends on account type)
        for account in accounts.values():
            if class_name.lower() in ['asset', 'expense']:
                # Normal debit balance
                account['balance'] = account['debits'] - account['credits']
            else:
                # Normal credit balance (liability, equity, revenue)
                account['balance'] = account['credits'] - account['debits']
        
        return {
            'class_name': class_name,
            'accounts': list(accounts.values()),
            'total': sum(account['balance'] for account in accounts.values())
        }