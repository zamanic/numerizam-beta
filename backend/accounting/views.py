"""
Views for the accounting app.

This module defines Django REST Framework views and viewsets for
handling API requests related to accounting data.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.db.models import Sum, Count, Avg, Max, Min, Q
from django.db import models
from django.shortcuts import get_object_or_404
from decimal import Decimal
from datetime import datetime
import pandas as pd

from .models import Company, ChartOfAccounts, Territory, Calendar, GeneralLedger, JournalEntry
from .serializers import (
    CompanySerializer, ChartOfAccountsSerializer, TerritorySerializer,
    CalendarSerializer, GeneralLedgerSerializer, JournalEntrySerializer,
    TransactionPayloadSerializer, BulkTransactionSerializer
)


class CompanyViewSet(viewsets.ModelViewSet):
    """ViewSet for Company model."""
    queryset = Company.objects.all()
    serializer_class = CompanySerializer


class ChartOfAccountsViewSet(viewsets.ModelViewSet):
    """ViewSet for Chart of Accounts model."""
    queryset = ChartOfAccounts.objects.select_related('company')
    serializer_class = ChartOfAccountsSerializer
    
    def get_queryset(self):
        """Filter by company if provided."""
        queryset = super().get_queryset()
        company_id = self.request.query_params.get('company_id')
        if company_id:
            queryset = queryset.filter(company_id=company_id)
        return queryset


class TerritoryViewSet(viewsets.ModelViewSet):
    """ViewSet for Territory model."""
    queryset = Territory.objects.select_related('company')
    serializer_class = TerritorySerializer
    
    def get_queryset(self):
        """Filter by company if provided."""
        queryset = super().get_queryset()
        company_id = self.request.query_params.get('company_id')
        if company_id:
            queryset = queryset.filter(company_id=company_id)
        return queryset


class CalendarViewSet(viewsets.ModelViewSet):
    """ViewSet for Calendar model."""
    queryset = Calendar.objects.select_related('company')
    serializer_class = CalendarSerializer
    
    def get_queryset(self):
        """Filter by company and date range if provided."""
        queryset = super().get_queryset()
        company_id = self.request.query_params.get('company_id')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if company_id:
            queryset = queryset.filter(company_id=company_id)
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
            
        return queryset


class GeneralLedgerViewSet(viewsets.ModelViewSet):
    """ViewSet for General Ledger model with advanced aggregation capabilities."""
    queryset = GeneralLedger.objects.select_related(
        'company', 'date', 'account', 'territory'
    )
    serializer_class = GeneralLedgerSerializer
    
    def get_queryset(self):
        """Filter by various parameters."""
        queryset = super().get_queryset()
        company_id = self.request.query_params.get('company_id')
        account_id = self.request.query_params.get('account_id')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        transaction_type = self.request.query_params.get('transaction_type')
        
        if company_id:
            queryset = queryset.filter(company_id=company_id)
        if account_id:
            queryset = queryset.filter(account_id=account_id)
        if start_date:
            queryset = queryset.filter(date__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__date__lte=end_date)
        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type)
            
        return queryset

    @action(detail=False, methods=['get'])
    def summary_by_territory(self, request):
        """
        Aggregation: GROUP BY Territory_key, SUM(Amount)
        SQL: Select Territory_key, Sum(Amount) as 'Amount' from [aTable] Group by Territory_key
        API: GET /api/general-ledger/summary_by_territory/
        """
        # Apply base filters
        queryset = self.get_queryset()
        
        # Group by territory and sum amounts
        summary_data = queryset.values(
            'territory__territory_key',
            'territory__country', 
            'territory__region'
        ).annotate(
            total_amount=Sum('amount'),
            transaction_count=Count('entry_no'),
            avg_amount=Avg('amount'),
            max_amount=Max('amount'),
            min_amount=Min('amount')
        ).order_by('territory__territory_key')
        
        # Convert to list and handle null territories
        result = []
        for item in summary_data:
            result.append({
                'territory_key': item['territory__territory_key'],
                'country': item['territory__country'],
                'region': item['territory__region'],
                'total_amount': float(item['total_amount']) if item['total_amount'] else 0.0,
                'transaction_count': item['transaction_count'],
                'avg_amount': float(item['avg_amount']) if item['avg_amount'] else 0.0,
                'max_amount': float(item['max_amount']) if item['max_amount'] else 0.0,
                'min_amount': float(item['min_amount']) if item['min_amount'] else 0.0
            })
        
        return Response({
            'summary_type': 'territory',
            'total_territories': len(result),
            'data': result
        })

    @action(detail=False, methods=['get'])
    def summary_by_account(self, request):
        """
        Aggregation: GROUP BY Account_key, SUM(Amount)
        SQL: Select Account_key, Sum(Amount) as 'Amount' from [aTable] Group by Account_key
        API: GET /api/general-ledger/summary_by_account/
        """
        queryset = self.get_queryset()
        
        summary_data = queryset.values(
            'account__account_key',
            'account__account',
            'account__class_name',
            'account__sub_class'
        ).annotate(
            total_amount=Sum('amount'),
            transaction_count=Count('entry_no'),
            avg_amount=Avg('amount'),
            debit_total=Sum('amount', filter=Q(transaction_type='DEBIT')),
            credit_total=Sum('amount', filter=Q(transaction_type='CREDIT'))
        ).order_by('account__account_key')
        
        result = []
        for item in summary_data:
            result.append({
                'account_key': item['account__account_key'],
                'account_name': item['account__account'],
                'class_name': item['account__class_name'],
                'sub_class': item['account__sub_class'],
                'total_amount': float(item['total_amount']) if item['total_amount'] else 0.0,
                'transaction_count': item['transaction_count'],
                'avg_amount': float(item['avg_amount']) if item['avg_amount'] else 0.0,
                'debit_total': float(item['debit_total']) if item['debit_total'] else 0.0,
                'credit_total': float(item['credit_total']) if item['credit_total'] else 0.0,
                'net_balance': float((item['debit_total'] or 0) - (item['credit_total'] or 0))
            })
        
        return Response({
            'summary_type': 'account',
            'total_accounts': len(result),
            'data': result
        })

    @action(detail=False, methods=['get'])
    def summary_by_date(self, request):
        """
        Aggregation: GROUP BY Date, SUM(Amount)
        SQL: Select Date, Sum(Amount) as 'Amount' from [aTable] Group by Date
        API: GET /api/general-ledger/summary_by_date/?group_by=day|month|year
        """
        queryset = self.get_queryset()
        group_by = request.query_params.get('group_by', 'day')  # day, month, year
        
        if group_by == 'year':
            summary_data = queryset.values(
                'date__year'
            ).annotate(
                total_amount=Sum('amount'),
                transaction_count=Count('entry_no'),
                avg_amount=Avg('amount')
            ).order_by('date__year')
            
            result = [{
                'period': item['date__year'],
                'period_type': 'year',
                'total_amount': float(item['total_amount']) if item['total_amount'] else 0.0,
                'transaction_count': item['transaction_count'],
                'avg_amount': float(item['avg_amount']) if item['avg_amount'] else 0.0
            } for item in summary_data]
            
        elif group_by == 'month':
            summary_data = queryset.values(
                'date__year', 'date__month'
            ).annotate(
                total_amount=Sum('amount'),
                transaction_count=Count('entry_no'),
                avg_amount=Avg('amount')
            ).order_by('date__year', 'date__month')
            
            result = [{
                'period': f"{item['date__year']}-{item['date__month']}",
                'year': item['date__year'],
                'month': item['date__month'],
                'period_type': 'month',
                'total_amount': float(item['total_amount']) if item['total_amount'] else 0.0,
                'transaction_count': item['transaction_count'],
                'avg_amount': float(item['avg_amount']) if item['avg_amount'] else 0.0
            } for item in summary_data]
            
        else:  # day
            summary_data = queryset.values(
                'date__date'
            ).annotate(
                total_amount=Sum('amount'),
                transaction_count=Count('entry_no'),
                avg_amount=Avg('amount')
            ).order_by('date__date')
            
            result = [{
                'period': item['date__date'].strftime('%Y-%m-%d'),
                'date': item['date__date'],
                'period_type': 'day',
                'total_amount': float(item['total_amount']) if item['total_amount'] else 0.0,
                'transaction_count': item['transaction_count'],
                'avg_amount': float(item['avg_amount']) if item['avg_amount'] else 0.0
            } for item in summary_data]
        
        return Response({
            'summary_type': 'date',
            'group_by': group_by,
            'total_periods': len(result),
            'data': result
        })

    @action(detail=False, methods=['get'])
    def summary_by_transaction_type(self, request):
        """
        Aggregation: GROUP BY Transaction_Type, SUM(Amount)
        SQL: Select Transaction_Type, Sum(Amount) as 'Amount' from [aTable] Group by Transaction_Type
        API: GET /api/general-ledger/summary_by_transaction_type/
        """
        queryset = self.get_queryset()
        
        summary_data = queryset.values(
            'transaction_type'
        ).annotate(
            total_amount=Sum('amount'),
            transaction_count=Count('entry_no'),
            avg_amount=Avg('amount'),
            max_amount=Max('amount'),
            min_amount=Min('amount')
        ).order_by('transaction_type')
        
        result = []
        for item in summary_data:
            result.append({
                'transaction_type': item['transaction_type'],
                'total_amount': float(item['total_amount']) if item['total_amount'] else 0.0,
                'transaction_count': item['transaction_count'],
                'avg_amount': float(item['avg_amount']) if item['avg_amount'] else 0.0,
                'max_amount': float(item['max_amount']) if item['max_amount'] else 0.0,
                'min_amount': float(item['min_amount']) if item['min_amount'] else 0.0
            })
        
        return Response({
            'summary_type': 'transaction_type',
            'data': result
        })

    @action(detail=False, methods=['get'])
    def summary_by_company(self, request):
        """
        Aggregation: GROUP BY Company, SUM(Amount)
        SQL: Select Company, Sum(Amount) as 'Amount' from [aTable] Group by Company
        API: GET /api/general-ledger/summary_by_company/
        """
        queryset = self.get_queryset()
        
        summary_data = queryset.values(
            'company__company_id',
            'company__company_name'
        ).annotate(
            total_amount=Sum('amount'),
            transaction_count=Count('entry_no'),
            avg_amount=Avg('amount'),
            debit_total=Sum('amount', filter=Q(transaction_type='DEBIT')),
            credit_total=Sum('amount', filter=Q(transaction_type='CREDIT'))
        ).order_by('company__company_name')
        
        result = []
        for item in summary_data:
            result.append({
                'company_id': item['company__company_id'],
                'company_name': item['company__company_name'],
                'total_amount': float(item['total_amount']) if item['total_amount'] else 0.0,
                'transaction_count': item['transaction_count'],
                'avg_amount': float(item['avg_amount']) if item['avg_amount'] else 0.0,
                'debit_total': float(item['debit_total']) if item['debit_total'] else 0.0,
                'credit_total': float(item['credit_total']) if item['credit_total'] else 0.0,
                'net_balance': float((item['debit_total'] or 0) - (item['credit_total'] or 0))
            })
        
        return Response({
            'summary_type': 'company',
            'total_companies': len(result),
            'data': result
        })

    @action(detail=False, methods=['get'])
    def pivot_territory_by_account(self, request):
        """
        Advanced Pivoting: Territory vs Account with Amount totals
        This creates a pivot table showing territories as rows and accounts as columns
        API: GET /api/general-ledger/pivot_territory_by_account/
        """
        queryset = self.get_queryset()
        
        # Get the raw data
        data = list(queryset.values(
            'territory__territory_key',
            'territory__country',
            'territory__region',
            'account__account_key',
            'account__account',
            'amount'
        ))
        
        if not data:
            return Response({
                'pivot_type': 'territory_by_account',
                'message': 'No data available for pivoting',
                'data': []
            })
        
        # Use pandas for pivoting
        try:
            df = pd.DataFrame(data)
            
            # Create a pivot table
            pivot_table = df.pivot_table(
                values='amount',
                index=['territory__territory_key', 'territory__country', 'territory__region'],
                columns=['account__account_key', 'account__account'],
                aggfunc='sum',
                fill_value=0
            )
            
            # Convert to a more readable format
            result = []
            for territory_info in pivot_table.index:
                territory_key, country, region = territory_info
                row_data = {
                    'territory_key': territory_key,
                    'country': country,
                    'region': region,
                    'accounts': {}
                }
                
                for account_info in pivot_table.columns:
                    account_key, account_name = account_info
                    amount = pivot_table.loc[territory_info, account_info]
                    row_data['accounts'][f'account_{account_key}'] = {
                        'account_key': account_key,
                        'account_name': account_name,
                        'amount': float(amount)
                    }
                
                result.append(row_data)
            
            return Response({
                'pivot_type': 'territory_by_account',
                'total_territories': len(result),
                'data': result
            })
            
        except Exception as e:
            # Fallback to manual pivoting if pandas fails
            return self._manual_pivot_territory_by_account(queryset)

    def _manual_pivot_territory_by_account(self, queryset):
        """Manual pivoting fallback method."""
        # Group data manually
        pivot_data = {}
        
        for entry in queryset:
            territory_key = entry.territory.territory_key if entry.territory else 'No Territory'
            account_key = entry.account.account_key
            
            if territory_key not in pivot_data:
                pivot_data[territory_key] = {
                    'territory_info': {
                        'territory_key': territory_key,
                        'country': entry.territory.country if entry.territory else 'N/A',
                        'region': entry.territory.region if entry.territory else 'N/A'
                    },
                    'accounts': {}
                }
            
            if account_key not in pivot_data[territory_key]['accounts']:
                pivot_data[territory_key]['accounts'][account_key] = {
                    'account_key': account_key,
                    'account_name': entry.account.account,
                    'amount': 0.0
                }
            
            pivot_data[territory_key]['accounts'][account_key]['amount'] += float(entry.amount)
        
        # Convert to list format
        result = []
        for territory_key, data in pivot_data.items():
            row = {
                'territory_key': data['territory_info']['territory_key'],
                'country': data['territory_info']['country'],
                'region': data['territory_info']['region'],
                'accounts': {f'account_{k}': v for k, v in data['accounts'].items()}
            }
            result.append(row)
        
        return Response({
            'pivot_type': 'territory_by_account',
            'method': 'manual_fallback',
            'total_territories': len(result),
            'data': result
        })

    @action(detail=False, methods=['get'])
    def advanced_summary(self, request):
        """
        Advanced multi-dimensional summary with multiple grouping options
        API: GET /api/general-ledger/advanced_summary/?group_by=territory,account&metrics=sum,count,avg
        """
        queryset = self.get_queryset()
        group_by = request.query_params.get('group_by', 'territory').split(',')
        metrics = request.query_params.get('metrics', 'sum,count').split(',')
        
        # Build dynamic grouping
        group_fields = []
        if 'territory' in group_by:
            group_fields.extend(['territory__territory_key', 'territory__country'])
        if 'account' in group_by:
            group_fields.extend(['account__account_key', 'account__account'])
        if 'date' in group_by:
            group_fields.extend(['date__date'])
        if 'company' in group_by:
            group_fields.extend(['company__company_name'])
        if 'transaction_type' in group_by:
            group_fields.extend(['transaction_type'])
        
        if not group_fields:
            group_fields = ['territory__territory_key']  # Default grouping
        
        # Build dynamic annotations
        annotations = {}
        if 'sum' in metrics:
            annotations['total_amount'] = Sum('amount')
        if 'count' in metrics:
            annotations['transaction_count'] = Count('entry_no')
        if 'avg' in metrics:
            annotations['avg_amount'] = Avg('amount')
        if 'max' in metrics:
            annotations['max_amount'] = Max('amount')
        if 'min' in metrics:
            annotations['min_amount'] = Min('amount')
        
        # Execute query
        summary_data = queryset.values(*group_fields).annotate(**annotations).order_by(*group_fields)
        
        # Convert to response format
        result = []
        for item in summary_data:
            row = {}
            for field in group_fields:
                row[field.replace('__', '_')] = item[field]
            
            for metric, value in item.items():
                if metric not in group_fields:
                    if isinstance(value, Decimal):
                        row[metric] = float(value)
                    else:
                        row[metric] = value
            
            result.append(row)
        
        return Response({
            'summary_type': 'advanced',
            'group_by': group_by,
            'metrics': metrics,
            'total_groups': len(result),
            'data': result
        })


class JournalEntryViewSet(viewsets.ModelViewSet):
    """ViewSet for Journal Entry model."""
    queryset = JournalEntry.objects.select_related('company', 'date')
    serializer_class = JournalEntrySerializer
    
    def get_queryset(self):
        """Filter by company and date range if provided."""
        queryset = super().get_queryset()
        company_id = self.request.query_params.get('company_id')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if company_id:
            queryset = queryset.filter(company_id=company_id)
        if start_date:
            queryset = queryset.filter(date__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__date__lte=end_date)
            
        return queryset


class ProcessTransactionView(APIView):
    """
    Process transaction payload from the AI system.
    This endpoint receives the structured data from the frontend
    and creates the appropriate database entries.
    """
    
    def post(self, request):
        """Process a transaction payload."""
        serializer = TransactionPayloadSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {'error': 'Invalid transaction payload', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            with transaction.atomic():
                result = self._process_transaction_payload(serializer.validated_data)
                return Response(result, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response(
                {'error': f'Failed to process transaction: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _process_transaction_payload(self, data):
        """Process the validated transaction payload."""
        # Get or create company
        company_data = data['company_data']
        company, created = Company.objects.get_or_create(
            company_name=company_data['company_name'],
            defaults={'company_name': company_data['company_name']}
        )
        
        # Get or create calendar entry
        calendar_data = data['calendar_data']
        transaction_date = datetime.strptime(calendar_data['Date'], '%Y-%m-%d').date()
        calendar_entry, created = Calendar.objects.get_or_create(
            company=company,
            date=transaction_date,
            defaults={
                'year': calendar_data['Year'],
                'quarter': calendar_data['Quarter'],
                'month': calendar_data['Month'],
                'day': calendar_data['Day']
            }
        )
        
        # Get or create territory if provided
        territory = None
        if 'territory_data' in data and data['territory_data']:
            territory_data = data['territory_data']
            # Find existing territory or create new one
            territory_qs = Territory.objects.filter(
                company=company,
                country=territory_data['Country'],
                region=territory_data['Region']
            )
            if territory_qs.exists():
                territory = territory_qs.first()
            else:
                # Get next territory_key for this company
                max_key = Territory.objects.filter(company=company).aggregate(
                    max_key=models.Max('territory_key')
                )['max_key'] or 0
                territory = Territory.objects.create(
                    company=company,
                    territory_key=max_key + 1,
                    country=territory_data['Country'],
                    region=territory_data['Region']
                )
        
        # Create journal entry
        journal_entry = JournalEntry.objects.create(
            company=company,
            date=calendar_entry,
            description=data['general_ledger_entries'][0]['Details'],
            created_by='AI System'
        )
        
        # Process chart of accounts data first
        chart_accounts_map = {}
        for chart_data in data['chart_of_accounts_data']:
            account, created = ChartOfAccounts.objects.get_or_create(
                company=company,
                account_key=chart_data['Account_key'],
                defaults={
                    'report': chart_data['Report'],
                    'class_name': chart_data['Class'],
                    'sub_class': chart_data['SubClass'],
                    'sub_class2': chart_data['SubClass2'],
                    'account': chart_data['Account'],
                    'sub_account': chart_data['SubAccount']
                }
            )
            chart_accounts_map[chart_data['Account_key']] = account
        
        # Process general ledger entries
        ledger_entries = []
        for entry_data in data['general_ledger_entries']:
            # Get the corresponding chart of accounts entry
            account = chart_accounts_map.get(entry_data['Account_key'])
            if not account:
                # Fallback: try to find existing account
                account = ChartOfAccounts.objects.filter(
                    company=company,
                    account_key=entry_data['Account_key']
                ).first()
                
                if not account:
                    raise ValueError(f"Account with key {entry_data['Account_key']} not found")
            
            # Create general ledger entry
            ledger_entry = GeneralLedger.objects.create(
                company=company,
                date=calendar_entry,
                territory=territory,
                account=account,
                journal_entry=journal_entry,
                details=entry_data['Details'],
                amount=Decimal(str(entry_data['Amount'])),
                transaction_type=entry_data['Type'].upper()
            )
            ledger_entries.append(ledger_entry)
        
        return {
            'message': 'Transaction processed successfully',
            'journal_entry_id': journal_entry.journal_id,
            'ledger_entries_created': len(ledger_entries),
            'is_balanced': journal_entry.is_balanced,
            'company_id': company.company_id,
            'territory_key': territory.territory_key if territory else None
        }


class BulkCreateTransactionsView(APIView):
    """Create multiple transactions in bulk."""
    
    def post(self, request):
        """Create transactions in bulk."""
        serializer = BulkTransactionSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {'error': 'Invalid bulk transaction data', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            with transaction.atomic():
                result = self._create_bulk_transactions(serializer.validated_data)
                return Response(result, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response(
                {'error': f'Failed to create bulk transactions: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _create_bulk_transactions(self, data):
        """Create the bulk transactions."""
        company = get_object_or_404(Company, company_id=data['company_id'])
        
        # Get or create calendar entry
        calendar_entry, created = Calendar.objects.get_or_create(
            company=company,
            date=data['date'],
            defaults={
                'year': data['date'].year,
                'quarter': f"Q{(data['date'].month - 1) // 3 + 1}",
                'month': data['date'].strftime('%B'),
                'day': data['date'].strftime('%A')
            }
        )
        
        # Create journal entry
        journal_entry = JournalEntry.objects.create(
            company=company,
            date=calendar_entry,
            description=data['description'],
            reference_number=data.get('reference_number'),
            created_by='API User'
        )
        
        # Create ledger entries
        ledger_entries = []
        for entry_data in data['entries']:
            account = get_object_or_404(
                ChartOfAccounts, 
                company=company, 
                account_key=entry_data['account_key']
            )
            
            ledger_entry = GeneralLedger.objects.create(
                company=company,
                date=calendar_entry,
                account=account,
                details=entry_data.get('details', data['description']),
                amount=Decimal(str(entry_data['amount'])),
                transaction_type=entry_data['type'].upper(),
                reference_number=data.get('reference_number')
            )
            ledger_entries.append(ledger_entry)
        
        return {
            'message': 'Bulk transactions created successfully',
            'journal_entry_id': journal_entry.journal_id,
            'ledger_entries_created': len(ledger_entries),
            'is_balanced': journal_entry.is_balanced
        }


class ProfitLossReportView(APIView):
    """Generate Profit & Loss report."""
    
    def get(self, request):
        """Generate P&L report for specified parameters."""
        company_id = request.query_params.get('company_id')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if not all([company_id, start_date, end_date]):
            return Response(
                {'error': 'company_id, start_date, and end_date are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            company = get_object_or_404(Company, company_id=company_id)
            
            # Get revenue accounts (assuming class_name contains 'Revenue' or 'Income')
            revenue_entries = GeneralLedger.objects.filter(
                company=company,
                date__date__range=[start_date, end_date],
                account__class_name__icontains='Revenue'
            ).select_related('account')
            
            # Get expense accounts
            expense_entries = GeneralLedger.objects.filter(
                company=company,
                date__date__range=[start_date, end_date],
                account__class_name__icontains='Expense'
            ).select_related('account')
            
            # Calculate totals
            total_revenue = revenue_entries.filter(
                transaction_type='CREDIT'
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
            
            total_expenses = expense_entries.filter(
                transaction_type='DEBIT'
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
            
            net_income = total_revenue - total_expenses
            
            return Response({
                'company': company.company_name,
                'period': f"{start_date} to {end_date}",
                'total_revenue': total_revenue,
                'total_expenses': total_expenses,
                'net_income': net_income,
                'revenue_details': [
                    {
                        'account': entry.account.account,
                        'amount': entry.amount
                    } for entry in revenue_entries
                ],
                'expense_details': [
                    {
                        'account': entry.account.account,
                        'amount': entry.amount
                    } for entry in expense_entries
                ]
            })
            
        except Exception as e:
            return Response(
                {'error': f'Failed to generate P&L report: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class BalanceSheetReportView(APIView):
    """Generate Balance Sheet report."""
    
    def get(self, request):
        """Generate balance sheet for specified parameters."""
        company_id = request.query_params.get('company_id')
        as_of_date = request.query_params.get('as_of_date')
        
        if not all([company_id, as_of_date]):
            return Response(
                {'error': 'company_id and as_of_date are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            company = get_object_or_404(Company, company_id=company_id)
            
            # Get all entries up to the specified date
            entries = GeneralLedger.objects.filter(
                company=company,
                date__date__lte=as_of_date
            ).select_related('account')
            
            # Separate by account class
            assets = entries.filter(account__class_name__icontains='Asset')
            liabilities = entries.filter(account__class_name__icontains='Liability')
            equity = entries.filter(account__class_name__icontains='Equity')
            
            # Calculate balances (Assets = Debits - Credits, Liabilities/Equity = Credits - Debits)
            total_assets = (
                assets.filter(transaction_type='DEBIT').aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
            ) - (
                assets.filter(transaction_type='CREDIT').aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
            )
            
            total_liabilities = (
                liabilities.filter(transaction_type='CREDIT').aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
            ) - (
                liabilities.filter(transaction_type='DEBIT').aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
            )
            
            total_equity = (
                equity.filter(transaction_type='CREDIT').aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
            ) - (
                equity.filter(transaction_type='DEBIT').aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
            )
            
            return Response({
                'company': company.company_name,
                'as_of_date': as_of_date,
                'total_assets': total_assets,
                'total_liabilities': total_liabilities,
                'total_equity': total_equity,
                'balance_check': total_assets == (total_liabilities + total_equity)
            })
            
        except Exception as e:
            return Response(
                {'error': f'Failed to generate balance sheet: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TrialBalanceReportView(APIView):
    """Generate Trial Balance report."""
    
    def get(self, request):
        """Generate trial balance for specified parameters."""
        company_id = request.query_params.get('company_id')
        as_of_date = request.query_params.get('as_of_date')
        
        if not all([company_id, as_of_date]):
            return Response(
                {'error': 'company_id and as_of_date are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            company = get_object_or_404(Company, company_id=company_id)
            
            # Get all accounts for the company
            accounts = ChartOfAccounts.objects.filter(company=company)
            
            trial_balance = []
            total_debits = Decimal('0.00')
            total_credits = Decimal('0.00')
            
            for account in accounts:
                # Calculate account balance
                debits = GeneralLedger.objects.filter(
                    company=company,
                    account=account,
                    date__date__lte=as_of_date,
                    transaction_type='DEBIT'
                ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
                
                credits = GeneralLedger.objects.filter(
                    company=company,
                    account=account,
                    date__date__lte=as_of_date,
                    transaction_type='CREDIT'
                ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
                
                balance = debits - credits
                
                if balance != 0:  # Only include accounts with non-zero balances
                    trial_balance.append({
                        'account_key': account.account_key,
                        'account_name': account.account,
                        'account_class': account.class_name,
                        'debit_balance': balance if balance > 0 else Decimal('0.00'),
                        'credit_balance': abs(balance) if balance < 0 else Decimal('0.00')
                    })
                    
                    if balance > 0:
                        total_debits += balance
                    else:
                        total_credits += abs(balance)
            
            return Response({
                'company': company.company_name,
                'as_of_date': as_of_date,
                'accounts': trial_balance,
                'total_debits': total_debits,
                'total_credits': total_credits,
                'is_balanced': total_debits == total_credits
            })
            
        except Exception as e:
            return Response(
                {'error': f'Failed to generate trial balance: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )