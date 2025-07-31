"""
Django REST API views for LangGraph integration.

This module provides API endpoints for the LangGraph agent to process
natural language queries and create accounting transactions.
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json

from .langgraph_agent import get_agent
from .models import Company


@api_view(['POST'])
@permission_classes([AllowAny])  # Temporarily disabled for development
def process_natural_language_query(request):
    """
    Process a natural language query using the LangGraph agent.
    
    Expected payload:
    {
        "query": "Record a sale of $500 for cash on July 18, 2025",
        "company_id": 1
    }
    """
    try:
        data = request.data
        query = data.get('query')
        company_id = data.get('company_id')
        
        if not query:
            return Response(
                {'error': 'Query is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not company_id:
            return Response(
                {'error': 'Company ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify company exists
        try:
            Company.objects.get(company_id=company_id)
        except Company.DoesNotExist:
            return Response(
                {'error': f'Company with ID {company_id} not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Process query with LangGraph agent
        agent = get_agent()
        result = agent.process_query(query, company_id)
        
        if result.get('success'):
            return Response(result, status=status.HTTP_201_CREATED)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response(
            {'error': f'Internal server error: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])  # Temporarily disabled for development
def batch_process_queries(request):
    """
    Process multiple natural language queries in batch.
    
    Expected payload:
    {
        "queries": [
            {"query": "Record a sale of $500 for cash", "company_id": 1},
            {"query": "Pay $200 for office supplies", "company_id": 1}
        ]
    }
    """
    try:
        data = request.data
        queries = data.get('queries', [])
        
        if not queries:
            return Response(
                {'error': 'Queries list is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(queries) > 10:  # Limit batch size
            return Response(
                {'error': 'Maximum 10 queries allowed per batch'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        agent = get_agent()
        results = []
        
        for i, query_data in enumerate(queries):
            query = query_data.get('query')
            company_id = query_data.get('company_id')
            
            if not query or not company_id:
                results.append({
                    'index': i,
                    'success': False,
                    'error': 'Query and company_id are required'
                })
                continue
            
            try:
                # Verify company exists
                Company.objects.get(company_id=company_id)
                
                # Process query
                result = agent.process_query(query, company_id)
                result['index'] = i
                results.append(result)
                
            except Company.DoesNotExist:
                results.append({
                    'index': i,
                    'success': False,
                    'error': f'Company with ID {company_id} not found'
                })
            except Exception as e:
                results.append({
                    'index': i,
                    'success': False,
                    'error': f'Error processing query: {str(e)}'
                })
        
        return Response({
            'results': results,
            'total_processed': len(results),
            'successful': len([r for r in results if r.get('success')])
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'Internal server error: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])  # Temporarily disabled for development
def agent_status(request):
    """
    Get the status of the LangGraph agent.
    """
    try:
        agent = get_agent()
        return Response({
            'status': 'active',
            'model': 'gpt-4o-mini',
            'nodes': ['parser', 'validator', 'executor'],
            'message': 'LangGraph agent is ready to process queries'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'status': 'error',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])  # Temporarily disabled for development
def validate_query(request):
    """
    Validate a natural language query without executing it.
    
    Expected payload:
    {
        "query": "Record a sale of $500 for cash on July 18, 2025",
        "company_id": 1
    }
    """
    try:
        data = request.data
        query = data.get('query')
        company_id = data.get('company_id')
        
        if not query:
            return Response(
                {'error': 'Query is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not company_id:
            return Response(
                {'error': 'Company ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify company exists
        try:
            Company.objects.get(company_id=company_id)
        except Company.DoesNotExist:
            return Response(
                {'error': f'Company with ID {company_id} not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Create a mock agent state for validation
        from .langgraph_agent import AgentState, NumerizamAgent
        
        agent = NumerizamAgent()
        
        # Run only parser and validator nodes
        state = AgentState(query=query, company_id=company_id)
        state = agent.parser_node(state)
        state = agent.validation_node(state)
        
        if state.errors:
            return Response({
                'valid': False,
                'errors': state.errors,
                'parsed_data': state.parsed_data.dict() if state.parsed_data else None
            }, status=status.HTTP_200_OK)
        
        return Response({
            'valid': True,
            'parsed_data': state.parsed_data.dict() if state.parsed_data else None,
            'validated_data': {
                'debit_account': state.validated_data['debit_account'].account,
                'credit_account': state.validated_data['credit_account'].account,
                'amount': float(state.validated_data['amount']),
                'details': state.validated_data['details']
            } if state.validated_data else None
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'error': f'Internal server error: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )