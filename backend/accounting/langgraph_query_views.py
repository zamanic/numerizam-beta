"""
Enhanced LangGraph Views for Natural Language to API Translation

This module provides Django REST API views that use the LangGraph query agent
to translate natural language queries into structured API calls.

The views act as a bridge between user queries and the aggregation endpoints,
providing a natural language interface to the accounting data.
"""

import json
import requests
from typing import Dict, Any

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from .models import Company
from .langgraph_query_agent import get_query_agent


@api_view(['POST'])
@permission_classes([AllowAny])  # Temporarily disabled for development
def process_natural_language_query(request):
    """
    Process a natural language query and return the translated API call.
    
    This endpoint translates natural language into API calls but does not execute them.
    It returns the API URL and parameters that would be used.
    
    Example request:
    POST /api/langgraph/query/
    {
        "query": "Show me all salary expenses from last year for the USA region, broken down by month",
        "company_id": 1
    }
    
    Example response:
    {
        "success": true,
        "api_url": "/api/general-ledger/summary_by_date/?details__icontains=salary&territory__country=USA&date__year=2024&group_by=month&company=1",
        "endpoint": "summary_by_date",
        "description": "Group salary expenses by month for USA region in 2024",
        "full_url": "http://127.0.0.1:8000/api/general-ledger/summary_by_date/?details__icontains=salary&territory__country=USA&date__year=2024&group_by=month&company=1",
        "method": "GET"
    }
    """
    try:
        # Get request data
        query = request.data.get('query', '').strip()
        company_id = request.data.get('company_id')
        
        if not query:
            return Response({
                'success': False,
                'error': 'Query is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not company_id:
            return Response({
                'success': False,
                'error': 'Company ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate company exists and user has access
        try:
            company = Company.objects.get(company_id=company_id)
        except Company.DoesNotExist:
            return Response({
                'success': False,
                'error': f'Company with ID {company_id} not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Process query with LangGraph agent
        agent = get_query_agent()
        result = agent.process_query(query, company_id)
        
        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])  # Temporarily disabled for development
def execute_natural_language_query(request):
    """
    Process a natural language query and execute the resulting API call.
    
    This endpoint translates natural language into API calls AND executes them,
    returning the actual data results.
    
    Example request:
    POST /api/langgraph/execute/
    {
        "query": "Show me all salary expenses from last year for the USA region, broken down by month",
        "company_id": 1
    }
    
    Example response:
    {
        "success": true,
        "query_translation": {
            "api_url": "/api/general-ledger/summary_by_date/...",
            "description": "Group salary expenses by month for USA region in 2024"
        },
        "data": [
            {"month": "2024-01", "total_amount": 50000, "count": 25},
            {"month": "2024-02", "total_amount": 52000, "count": 26}
        ]
    }
    """
    try:
        # Get request data
        query = request.data.get('query', '').strip()
        company_id = request.data.get('company_id')
        
        if not query:
            return Response({
                'success': False,
                'error': 'Query is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not company_id:
            return Response({
                'success': False,
                'error': 'Company ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate company exists
        try:
            company = Company.objects.get(company_id=company_id)
        except Company.DoesNotExist:
            return Response({
                'success': False,
                'error': f'Company with ID {company_id} not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Process query with LangGraph agent
        agent = get_query_agent()
        translation_result = agent.process_query(query, company_id)
        
        if not translation_result['success']:
            return Response(translation_result, status=status.HTTP_400_BAD_REQUEST)
        
        # Execute the API call internally
        api_url = translation_result['api_url']
        
        # Make internal API call
        try:
            # Build full URL for internal request
            base_url = request.build_absolute_uri('/')[:-1]  # Remove trailing slash
            full_api_url = f"{base_url}{api_url}"
            
            # Make the request with authentication headers
            headers = {
                'Authorization': request.META.get('HTTP_AUTHORIZATION', ''),
                'Content-Type': 'application/json'
            }
            
            response = requests.get(full_api_url, headers=headers, timeout=30)
            
            if response.status_code == 200:
                api_data = response.json()
                
                return Response({
                    'success': True,
                    'query_translation': {
                        'api_url': translation_result['api_url'],
                        'endpoint': translation_result['endpoint'],
                        'description': translation_result['description'],
                        'method': translation_result['method']
                    },
                    'data': api_data,
                    'original_query': query
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': False,
                    'error': f'API call failed with status {response.status_code}',
                    'query_translation': translation_result,
                    'api_response': response.text[:500]  # First 500 chars of error
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except requests.RequestException as e:
            return Response({
                'success': False,
                'error': f'Failed to execute API call: {str(e)}',
                'query_translation': translation_result
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])  # Temporarily disabled for development
def batch_process_natural_language_queries(request):
    """
    Process multiple natural language queries in batch.
    
    Example request:
    POST /api/langgraph/batch/
    {
        "queries": [
            {
                "id": "query1",
                "query": "Show salary expenses for USA last year",
                "company_id": 1
            },
            {
                "id": "query2", 
                "query": "Total revenue by account for Q1 2024",
                "company_id": 1
            }
        ],
        "execute": false
    }
    """
    try:
        queries = request.data.get('queries', [])
        execute = request.data.get('execute', False)
        
        if not queries:
            return Response({
                'success': False,
                'error': 'Queries list is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        agent = get_query_agent()
        results = []
        
        for query_item in queries:
            query_id = query_item.get('id', f'query_{len(results)}')
            query_text = query_item.get('query', '').strip()
            company_id = query_item.get('company_id')
            
            if not query_text or not company_id:
                results.append({
                    'id': query_id,
                    'success': False,
                    'error': 'Query text and company_id are required'
                })
                continue
            
            # Validate company
            try:
                Company.objects.get(company_id=company_id)
            except Company.DoesNotExist:
                results.append({
                    'id': query_id,
                    'success': False,
                    'error': f'Company with ID {company_id} not found'
                })
                continue
            
            # Process query
            try:
                result = agent.process_query(query_text, company_id)
                result['id'] = query_id
                result['original_query'] = query_text
                
                # Execute if requested
                if execute and result['success']:
                    try:
                        # Make internal API call (simplified version)
                        api_url = result['api_url']
                        base_url = request.build_absolute_uri('/')[:-1]
                        full_api_url = f"{base_url}{api_url}"
                        
                        headers = {
                            'Authorization': request.META.get('HTTP_AUTHORIZATION', ''),
                            'Content-Type': 'application/json'
                        }
                        
                        response = requests.get(full_api_url, headers=headers, timeout=30)
                        
                        if response.status_code == 200:
                            result['data'] = response.json()
                        else:
                            result['execution_error'] = f'API call failed with status {response.status_code}'
                            
                    except Exception as e:
                        result['execution_error'] = f'Failed to execute: {str(e)}'
                
                results.append(result)
                
            except Exception as e:
                results.append({
                    'id': query_id,
                    'success': False,
                    'error': f'Processing error: {str(e)}',
                    'original_query': query_text
                })
        
        return Response({
            'success': True,
            'results': results,
            'total_queries': len(queries),
            'successful_translations': len([r for r in results if r.get('success', False)]),
            'executed': execute
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])  # Temporarily disabled for development
def query_agent_capabilities(request):
    """
    Get information about the query agent's capabilities and available endpoints.
    
    Example response:
    {
        "endpoints": {
            "summary_by_territory": "Group data by territory/region/country",
            "summary_by_account": "Group data by account/account type",
            ...
        },
        "example_queries": [
            "Show me all salary expenses from last year for the USA region, broken down by month",
            "Total revenue by account for Q1 2024",
            ...
        ]
    }
    """
    try:
        agent = get_query_agent()
        
        example_queries = [
            "Show me all salary expenses from last year for the USA region, broken down by month",
            "Total revenue by account for Q1 2024",
            "What are the top 5 accounts by transaction volume this year?",
            "Show debit transactions over $1000 for the last 6 months",
            "Create a pivot table of territories vs accounts",
            "Monthly analysis of all transactions for 2024",
            "Show account balances for all revenue accounts",
            "What were the total expenses by territory last quarter?",
            "Show me credit transactions containing 'invoice' in the details",
            "Group all transactions by company and show totals"
        ]
        
        return Response({
            'success': True,
            'endpoints': agent.endpoints,
            'example_queries': example_queries,
            'supported_filters': {
                'date_filters': ['date__year', 'date__month', 'date__gte', 'date__lte'],
                'territory_filters': ['territory__country', 'territory__region'],
                'account_filters': ['account__account__icontains', 'account__class_name'],
                'amount_filters': ['amount__gt', 'amount__lt', 'amount__gte', 'amount__lte'],
                'text_filters': ['details__icontains', 'reference_number__icontains'],
                'transaction_type': ['transaction_type']
            },
            'grouping_options': {
                'group_by': ['territory', 'account', 'company', 'transaction_type', 'date'],
                'date_group': ['day', 'month', 'year'],
                'metrics': ['sum', 'count', 'avg', 'max', 'min']
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def query_agent_status(request):
    """
    Check the status of the query agent.
    
    This endpoint doesn't require authentication and can be used for health checks.
    """
    try:
        agent = get_query_agent()
        return Response({
            'status': 'active',
            'agent_type': 'NumerizamQueryAgent',
            'capabilities': len(agent.endpoints),
            'version': '1.0.0'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'status': 'error',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)