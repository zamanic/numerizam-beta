"""
LangGraph Query Agent for Numerizam Accounting System

This module implements a LangGraph-based agent that processes natural language
queries and converts them into structured API calls to the Django REST Framework backend.

The agent acts as a Natural Language to API translator, converting plain English
questions into proper API endpoints with filters and parameters.

Example Flow:
1. User: "Show me all salary expenses from last year for the USA region, broken down by month"
2. Agent: Translates to API call with proper parameters
3. API Call: GET /api/general-ledger/summary_by_date/?details__icontains=salary&date__year=2024&territory__country=USA&group_by=month
4. Response: Structured JSON data for frontend display
"""

import os
import json
import re
from typing import Dict, Any, List, Optional, Union
from datetime import datetime, date
from urllib.parse import urlencode

# Django setup
import django
from django.conf import settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'numerizam_project.settings')
django.setup()

# LangGraph and LangChain imports
from langgraph.graph import Graph, END
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage
from pydantic import BaseModel, Field

# Django models for validation
from accounting.models import Company, ChartOfAccounts, Territory


class QueryParameters(BaseModel):
    """Structured query parameters extracted from natural language."""
    endpoint: str = Field(description="API endpoint to call")
    filters: Dict[str, Any] = Field(default_factory=dict, description="Query parameters/filters")
    group_by: Optional[str] = Field(default=None, description="Grouping parameter")
    metrics: Optional[str] = Field(default=None, description="Metrics to calculate")
    date_group: Optional[str] = Field(default=None, description="Date grouping (day/month/year)")
    description: str = Field(description="Human-readable description of what the query does")


class QueryAgentState(BaseModel):
    """State object that flows through the LangGraph nodes."""
    query: str
    company_id: int
    parsed_params: Optional[QueryParameters] = None
    validated_params: Optional[Dict[str, Any]] = None
    api_url: Optional[str] = None
    errors: List[str] = Field(default_factory=list)


class NumerizamQueryAgent:
    """LangGraph agent for translating natural language to API calls."""
    
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4",
            temperature=0,
            api_key=settings.OPENAI_API_KEY
        )
        self.graph = self._build_graph()
        
        # Available endpoints and their purposes
        self.endpoints = {
            'summary_by_territory': 'Group data by territory/region/country',
            'summary_by_account': 'Group data by account/account type',
            'summary_by_date': 'Group data by time periods (day/month/year)',
            'summary_by_transaction_type': 'Group data by debit/credit transaction types',
            'summary_by_company': 'Group data by company',
            'pivot_territory_by_account': 'Create pivot tables with territories vs accounts',
            'advanced_summary': 'Multi-dimensional grouping with custom parameters',
            'general-ledger': 'Get detailed transaction records',
            'monthly_analysis': 'Monthly analysis of transactions',
            'account_balances': 'Calculate account balances',
            'summary': 'General summary statistics'
        }
    
    def _build_graph(self) -> Graph:
        """Build the LangGraph workflow."""
        graph = Graph()
        
        # Add nodes
        graph.add_node("parser", self.parser_node)
        graph.add_node("validator", self.validation_node)
        graph.add_node("url_builder", self.url_builder_node)
        
        # Add edges
        graph.add_edge("parser", "validator")
        graph.add_edge("validator", "url_builder")
        graph.add_edge("url_builder", END)
        
        # Set entry point
        graph.set_entry_point("parser")
        
        return graph.compile()
    
    def parser_node(self, state: QueryAgentState) -> QueryAgentState:
        """
        Parser Node: Extract structured API parameters from natural language query.
        """
        try:
            system_prompt = f"""
            You are an expert API translator for an accounting system. Convert natural language queries 
            into structured API parameters for Django REST Framework endpoints.

            Available endpoints and their purposes:
            {json.dumps(self.endpoints, indent=2)}

            Common filter patterns:
            - Date filters: date__year=2024, date__month=7, date__gte=2024-01-01, date__lte=2024-12-31
            - Territory filters: territory__country=USA, territory__region=California
            - Account filters: account__account__icontains=salary, account__class_name=Revenue
            - Amount filters: amount__gt=1000, amount__lt=5000
            - Transaction type: transaction_type=DEBIT or transaction_type=CREDIT
            - Text search: details__icontains=salary, reference_number__icontains=INV

            Grouping options:
            - group_by: territory, account, company, transaction_type, date
            - date_group: day, month, year (for date grouping)
            - metrics: sum, count, avg, max, min

            Examples:
            1. "Show salary expenses for USA last year by month" →
               endpoint: "summary_by_date"
               filters: {{"details__icontains": "salary", "territory__country": "USA", "date__year": 2024}}
               group_by: "month"

            2. "Total revenue by account for Q1 2024" →
               endpoint: "summary_by_account"
               filters: {{"account__class_name__icontains": "revenue", "date__gte": "2024-01-01", "date__lte": "2024-03-31"}}

            3. "Pivot table of territories vs accounts" →
               endpoint: "pivot_territory_by_account"

            Current year is {datetime.now().year}. Convert relative dates like "last year", "this month", etc.

            Return a JSON object with:
            - endpoint: The API endpoint to use
            - filters: Dictionary of query parameters
            - group_by: Grouping parameter (if applicable)
            - metrics: Metrics to calculate (if applicable)
            - date_group: Date grouping (if applicable)
            - description: Human-readable description of the query
            """
            
            user_prompt = f"Convert this query to API parameters: {state.query}"
            
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt)
            ]
            
            response = self.llm.invoke(messages)
            
            # Parse the JSON response
            try:
                parsed_json = json.loads(response.content)
                state.parsed_params = QueryParameters(**parsed_json)
            except (json.JSONDecodeError, ValueError) as e:
                state.errors.append(f"Failed to parse LLM response: {str(e)}")
                
        except Exception as e:
            state.errors.append(f"Parser node error: {str(e)}")
        
        return state
    
    def validation_node(self, state: QueryAgentState) -> QueryAgentState:
        """
        Validation Node: Validate parameters against database and API constraints.
        """
        if not state.parsed_params or state.errors:
            return state
        
        try:
            # Validate company exists
            try:
                company = Company.objects.get(company_id=state.company_id)
            except Company.DoesNotExist:
                state.errors.append(f"Company with ID {state.company_id} not found")
                return state
            
            # Validate endpoint exists
            if state.parsed_params.endpoint not in self.endpoints:
                state.errors.append(f"Unknown endpoint: {state.parsed_params.endpoint}")
                return state
            
            # Add company filter
            validated_filters = {'company': state.company_id}
            validated_filters.update(state.parsed_params.filters)
            
            # Validate and normalize date filters
            validated_filters = self._validate_date_filters(validated_filters)
            
            # Validate territory filters
            validated_filters = self._validate_territory_filters(validated_filters, company)
            
            # Validate account filters
            validated_filters = self._validate_account_filters(validated_filters, company)
            
            # Store validated data
            state.validated_params = {
                'endpoint': state.parsed_params.endpoint,
                'filters': validated_filters,
                'group_by': state.parsed_params.group_by,
                'metrics': state.parsed_params.metrics,
                'date_group': state.parsed_params.date_group,
                'description': state.parsed_params.description
            }
            
        except Exception as e:
            state.errors.append(f"Validation node error: {str(e)}")
        
        return state
    
    def url_builder_node(self, state: QueryAgentState) -> QueryAgentState:
        """
        URL Builder Node: Construct the final API URL with parameters.
        """
        if not state.validated_params or state.errors:
            return state
        
        try:
            params = state.validated_params
            base_url = f"/api/general-ledger/{params['endpoint']}/"
            
            # Build query parameters
            query_params = params['filters'].copy()
            
            if params['group_by']:
                query_params['group_by'] = params['group_by']
            
            if params['metrics']:
                query_params['metrics'] = params['metrics']
            
            if params['date_group']:
                query_params['date_group'] = params['date_group']
            
            # Construct full URL
            if query_params:
                state.api_url = f"{base_url}?{urlencode(query_params)}"
            else:
                state.api_url = base_url
            
        except Exception as e:
            state.errors.append(f"URL builder error: {str(e)}")
        
        return state
    
    def _validate_date_filters(self, filters: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and normalize date filters."""
        date_patterns = {
            'date__year': r'^\d{4}$',
            'date__month': r'^(1[0-2]|[1-9])$',
            'date__day': r'^(3[01]|[12][0-9]|[1-9])$',
            'date__gte': r'^\d{4}-\d{2}-\d{2}$',
            'date__lte': r'^\d{4}-\d{2}-\d{2}$',
            'date__gt': r'^\d{4}-\d{2}-\d{2}$',
            'date__lt': r'^\d{4}-\d{2}-\d{2}$'
        }
        
        for key, pattern in date_patterns.items():
            if key in filters:
                value = str(filters[key])
                if not re.match(pattern, value):
                    # Try to parse and reformat
                    try:
                        if 'date' in key and len(value) == 10:
                            datetime.strptime(value, '%Y-%m-%d')
                    except ValueError:
                        del filters[key]  # Remove invalid date filter
        
        return filters
    
    def _validate_territory_filters(self, filters: Dict[str, Any], company: Company) -> Dict[str, Any]:
        """Validate territory filters against database."""
        territory_filters = [k for k in filters.keys() if k.startswith('territory__')]
        
        for filter_key in territory_filters:
            if 'country' in filter_key:
                # Check if country exists for this company
                country_value = filters[filter_key]
                if not Territory.objects.filter(company=company, country__iexact=country_value).exists():
                    # Try case-insensitive partial match
                    territories = Territory.objects.filter(
                        company=company, 
                        country__icontains=country_value
                    ).first()
                    if territories:
                        filters[filter_key] = territories.country
        
        return filters
    
    def _validate_account_filters(self, filters: Dict[str, Any], company: Company) -> Dict[str, Any]:
        """Validate account filters against database."""
        account_filters = [k for k in filters.keys() if k.startswith('account__')]
        
        for filter_key in account_filters:
            if 'account__icontains' in filter_key:
                # Validate account name exists
                account_value = filters[filter_key]
                if not ChartOfAccounts.objects.filter(
                    company=company, 
                    account__icontains=account_value
                ).exists():
                    # Try class name instead
                    if ChartOfAccounts.objects.filter(
                        company=company, 
                        class_name__icontains=account_value
                    ).exists():
                        # Replace with class_name filter
                        del filters[filter_key]
                        filters['account__class_name__icontains'] = account_value
        
        return filters
    
    def process_query(self, query: str, company_id: int) -> Dict[str, Any]:
        """
        Process a natural language query and return the API URL and parameters.
        
        Args:
            query: Natural language query
            company_id: ID of the company
            
        Returns:
            Dictionary containing the API URL and parameters or errors
        """
        # Initialize state
        initial_state = QueryAgentState(
            query=query,
            company_id=company_id
        )
        
        # Run the graph
        final_state = self.graph.invoke(initial_state)
        
        # Return result
        if final_state.errors:
            return {
                'success': False,
                'errors': final_state.errors,
                'parsed_params': final_state.parsed_params.dict() if final_state.parsed_params else None
            }
        
        return {
            'success': True,
            'api_url': final_state.api_url,
            'endpoint': final_state.validated_params['endpoint'],
            'filters': final_state.validated_params['filters'],
            'description': final_state.validated_params['description'],
            'full_url': f"http://127.0.0.1:8000{final_state.api_url}",
            'method': 'GET'
        }


# Global query agent instance
_query_agent_instance = None

def get_query_agent() -> NumerizamQueryAgent:
    """Get or create the global query agent instance."""
    global _query_agent_instance
    if _query_agent_instance is None:
        _query_agent_instance = NumerizamQueryAgent()
    return _query_agent_instance