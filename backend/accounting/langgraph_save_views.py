"""
Django REST API views for saving LangGraph query results to the database.

This module provides endpoints for saving confirmed query results from the frontend
to the PostgreSQL database through Django ORM.
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime, date
from decimal import Decimal
import json

from .models import Company, ChartOfAccounts, Territory, Calendar, GeneralLedger, JournalEntry


@api_view(['POST'])
@permission_classes([AllowAny])  # Allow unauthenticated access for development
@csrf_exempt
def save_query_results(request):
    """
    Save confirmed query results to the database.
    
    Expected request format:
    {
        "company_id": 1,
        "query_type": "transaction" | "report",
        "query_text": "Original natural language query",
        "results": {
            // Query result data structure
        },
        "metadata": {
            "processed_at": "2024-01-01T12:00:00Z",
            "user_confirmed": true
        }
    }
    """
    try:
        # Extract request data
        company_id = request.data.get('company_id')
        query_type = request.data.get('query_type')
        query_text = request.data.get('query_text', '')
        results = request.data.get('results', {})
        metadata = request.data.get('metadata', {})
        
        # Validate required fields
        if not company_id:
            return Response(
                {'error': 'company_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not query_type:
            return Response(
                {'error': 'query_type is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate company exists
        try:
            company = Company.objects.get(company_id=company_id)
        except Company.DoesNotExist:
            return Response(
                {'error': f'Company with ID {company_id} not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Handle different query types
        if query_type == 'transaction':
            return _save_transaction_results(company, query_text, results, metadata)
        elif query_type == 'report':
            return _save_report_results(company, query_text, results, metadata)
        else:
            return Response(
                {'error': f'Unsupported query_type: {query_type}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
    except Exception as e:
        return Response(
            {'error': f'Internal server error: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def _save_transaction_results(company, query_text, results, metadata):
    """
    Save transaction results to GeneralLedger and JournalEntry tables.
    
    Expected results format for transactions:
    {
        "journal_entry": {
            "description": "Transaction description",
            "reference_number": "REF123",
            "date": "2024-01-01",
            "entries": [
                {
                    "account_key": 1001,
                    "amount": 1000.00,
                    "transaction_type": "DEBIT",
                    "details": "Debit entry details",
                    "territory_key": 1
                },
                {
                    "account_key": 2001,
                    "amount": 1000.00,
                    "transaction_type": "CREDIT",
                    "details": "Credit entry details",
                    "territory_key": 1
                }
            ]
        }
    }
    """
    try:
        with transaction.atomic():
            journal_data = results.get('journal_entry', {})
            entries_data = journal_data.get('entries', [])
            
            if not entries_data:
                return Response(
                    {'error': 'No transaction entries found in results'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Parse and validate date
            entry_date_str = journal_data.get('date')
            if not entry_date_str:
                return Response(
                    {'error': 'Transaction date is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                if isinstance(entry_date_str, str):
                    entry_date = datetime.strptime(entry_date_str, '%Y-%m-%d').date()
                else:
                    entry_date = entry_date_str
            except ValueError:
                return Response(
                    {'error': 'Invalid date format. Use YYYY-MM-DD'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get or create calendar entry
            calendar_entry, created = Calendar.objects.get_or_create(
                company=company,
                date=entry_date,
                defaults={
                    'year': entry_date.year,
                    'quarter': f'Q{(entry_date.month - 1) // 3 + 1}',
                    'month': entry_date.strftime('%B'),
                    'day': entry_date.strftime('%A')
                }
            )
            
            # Create journal entry
            journal_entry = JournalEntry.objects.create(
                company=company,
                date=calendar_entry,
                description=journal_data.get('description', query_text),
                reference_number=journal_data.get('reference_number', ''),
                created_by=metadata.get('user', 'Frontend User')
            )
            
            # Create general ledger entries
            created_entries = []
            total_debits = Decimal('0.00')
            total_credits = Decimal('0.00')
            
            for entry_data in entries_data:
                # Validate account
                account_key = entry_data.get('account_key')
                if not account_key:
                    raise ValueError('account_key is required for each entry')
                
                try:
                    account = ChartOfAccounts.objects.get(
                        company=company, 
                        account_key=account_key
                    )
                except ChartOfAccounts.DoesNotExist:
                    raise ValueError(f'Account with key {account_key} not found')
                
                # Validate territory (optional)
                territory = None
                territory_key = entry_data.get('territory_key')
                if territory_key:
                    try:
                        territory = Territory.objects.get(
                            company=company, 
                            territory_key=territory_key
                        )
                    except Territory.DoesNotExist:
                        raise ValueError(f'Territory with key {territory_key} not found')
                
                # Validate amount
                amount = entry_data.get('amount')
                if not amount:
                    raise ValueError('amount is required for each entry')
                
                amount = Decimal(str(amount))
                if amount <= 0:
                    raise ValueError('amount must be positive')
                
                # Validate transaction type
                transaction_type = entry_data.get('transaction_type', '').upper()
                if transaction_type not in ['DEBIT', 'CREDIT']:
                    raise ValueError('transaction_type must be DEBIT or CREDIT')
                
                # Track totals
                if transaction_type == 'DEBIT':
                    total_debits += amount
                else:
                    total_credits += amount
                
                # Create general ledger entry
                ledger_entry = GeneralLedger.objects.create(
                    company=company,
                    date=calendar_entry,
                    account=account,
                    territory=territory,
                    details=entry_data.get('details', journal_entry.description),
                    amount=amount,
                    transaction_type=transaction_type,
                    reference_number=journal_entry.reference_number
                )
                
                created_entries.append({
                    'entry_no': ledger_entry.entry_no,
                    'account': account.account,
                    'amount': float(amount),
                    'transaction_type': transaction_type
                })
            
            # Verify journal entry is balanced
            if total_debits != total_credits:
                raise ValueError(
                    f'Journal entry is not balanced. '
                    f'Debits: {total_debits}, Credits: {total_credits}'
                )
            
            return Response({
                'success': True,
                'message': 'Transaction saved successfully',
                'journal_id': journal_entry.journal_id,
                'total_entries': len(created_entries),
                'total_amount': float(total_debits),
                'entries': created_entries,
                'is_balanced': True
            }, status=status.HTTP_201_CREATED)
            
    except ValueError as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to save transaction: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def _save_report_results(company, query_text, results, metadata):
    """
    Save report query results as a log entry.
    
    For report queries, we don't create accounting transactions but rather
    log the query and results for audit purposes.
    """
    try:
        # For now, we'll create a simple log entry in the database
        # In a production system, you might want a dedicated QueryLog model
        
        # Create a journal entry to log the report query
        today = date.today()
        calendar_entry, created = Calendar.objects.get_or_create(
            company=company,
            date=today,
            defaults={
                'year': today.year,
                'quarter': f'Q{(today.month - 1) // 3 + 1}',
                'month': today.strftime('%B'),
                'day': today.strftime('%A')
            }
        )
        
        # Create a log entry as a journal entry
        log_entry = JournalEntry.objects.create(
            company=company,
            date=calendar_entry,
            description=f'Report Query: {query_text}',
            reference_number=f'REPORT-{timezone.now().strftime("%Y%m%d%H%M%S")}',
            created_by=metadata.get('user', 'Frontend User')
        )
        
        return Response({
            'success': True,
            'message': 'Report query logged successfully',
            'log_id': log_entry.journal_id,
            'query_text': query_text,
            'logged_at': log_entry.created_at.isoformat(),
            'results_summary': {
                'total_records': len(results.get('data', [])) if isinstance(results.get('data'), list) else 1,
                'query_type': 'report'
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': f'Failed to log report query: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])  # Allow unauthenticated access for development
def get_saved_queries(request):
    """
    Retrieve saved queries for a company.
    """
    try:
        company_id = request.query_params.get('company_id')
        if not company_id:
            return Response(
                {'error': 'company_id parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            company = Company.objects.get(company_id=company_id)
        except Company.DoesNotExist:
            return Response(
                {'error': f'Company with ID {company_id} not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get recent journal entries (both transactions and logs)
        recent_entries = JournalEntry.objects.filter(
            company=company
        ).order_by('-created_at')[:50]
        
        entries_data = []
        for entry in recent_entries:
            entry_data = {
                'journal_id': entry.journal_id,
                'description': entry.description,
                'reference_number': entry.reference_number,
                'date': entry.date.date.isoformat(),
                'created_at': entry.created_at.isoformat(),
                'created_by': entry.created_by,
                'is_balanced': entry.is_balanced,
                'total_debits': float(entry.total_debits),
                'total_credits': float(entry.total_credits),
                'entry_count': entry.ledger_entries.count()
            }
            entries_data.append(entry_data)
        
        return Response({
            'success': True,
            'company_id': company_id,
            'company_name': company.company_name,
            'total_entries': len(entries_data),
            'entries': entries_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'Failed to retrieve saved queries: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])  # Allow unauthenticated access for development
def save_service_status(request):
    """
    Check the status of the save service.
    """
    return Response({
        'status': 'active',
        'service': 'LangGraph Save Service',
        'version': '1.0.0',
        'endpoints': [
            '/api/save/query-results/',
            '/api/save/saved-queries/',
            '/api/save/status/'
        ],
        'supported_query_types': ['transaction', 'report'],
        'database_models': ['Company', 'ChartOfAccounts', 'Territory', 'Calendar', 'GeneralLedger', 'JournalEntry']
    }, status=status.HTTP_200_OK)