"""
LangGraph Agent for Numerizam Accounting System

This module implements a LangGraph-based agent that processes natural language
queries and converts them into structured accounting transactions using Django ORM.

The agent consists of three main nodes:
1. Parser Node: Extracts structured information from natural language
2. Validation Node: Validates accounts and data against the database
3. Execution Node: Creates journal entries in the database
"""

import os
import json
from typing import Dict, Any, List, Optional
from datetime import datetime, date
from decimal import Decimal

# Django setup
import django
from django.conf import settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'numerizam_project.settings')
django.setup()

# LangGraph and LangChain imports
from langgraph.graph import Graph, END
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage
from langchain.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

# Django models
from accounting.models import Company, ChartOfAccounts, Territory, Calendar, GeneralLedger, JournalEntry


class TransactionData(BaseModel):
    """Structured transaction data extracted from natural language."""
    date: str = Field(description="Transaction date in YYYY-MM-DD format")
    debit_account: str = Field(description="Name of the debit account")
    credit_account: str = Field(description="Name of the credit account")
    amount: float = Field(description="Transaction amount")
    details: str = Field(description="Transaction description")
    reference_number: Optional[str] = Field(default=None, description="Reference number if any")


class AgentState(BaseModel):
    """State object that flows through the LangGraph nodes."""
    query: str
    company_id: int
    parsed_data: Optional[TransactionData] = None
    validated_data: Optional[Dict[str, Any]] = None
    result: Optional[Dict[str, Any]] = None
    errors: List[str] = Field(default_factory=list)


class NumerizamAgent:
    """LangGraph agent for processing accounting transactions."""
    
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.1,
            api_key=settings.OPENAI_API_KEY
        )
        self.graph = self._build_graph()
    
    def _build_graph(self) -> Graph:
        """Build the LangGraph workflow."""
        graph = Graph()
        
        # Add nodes
        graph.add_node("parser", self.parser_node)
        graph.add_node("validator", self.validation_node)
        graph.add_node("executor", self.execution_node)
        
        # Add edges
        graph.add_edge("parser", "validator")
        graph.add_edge("validator", "executor")
        graph.add_edge("executor", END)
        
        # Set entry point
        graph.set_entry_point("parser")
        
        return graph.compile()
    
    def parser_node(self, state: AgentState) -> AgentState:
        """
        Parser Node: Extract structured information from natural language query.
        """
        try:
            system_prompt = """
            You are an expert accounting assistant. Extract structured transaction information from natural language queries.
            
            Extract the following information:
            - date: Transaction date (convert to YYYY-MM-DD format)
            - debit_account: The account to be debited (use common accounting terms)
            - credit_account: The account to be credited (use common accounting terms)
            - amount: The monetary amount (as a number)
            - details: A clear description of the transaction
            - reference_number: Any reference number mentioned (optional)
            
            Common account mappings:
            - "cash" -> "Cash"
            - "sales" -> "Sales Revenue"
            - "revenue" -> "Sales Revenue"
            - "accounts receivable" -> "Accounts Receivable"
            - "inventory" -> "Inventory"
            - "accounts payable" -> "Accounts Payable"
            - "expenses" -> "Operating Expenses"
            
            Return the information as a JSON object with the exact field names specified.
            """
            
            user_prompt = f"Extract transaction information from: {state.query}"
            
            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt)
            ]
            
            response = self.llm.invoke(messages)
            
            # Parse the JSON response
            try:
                parsed_json = json.loads(response.content)
                state.parsed_data = TransactionData(**parsed_json)
            except (json.JSONDecodeError, ValueError) as e:
                state.errors.append(f"Failed to parse LLM response: {str(e)}")
                
        except Exception as e:
            state.errors.append(f"Parser node error: {str(e)}")
        
        return state
    
    def validation_node(self, state: AgentState) -> AgentState:
        """
        Validation Node: Validate accounts and data against the database.
        """
        if not state.parsed_data or state.errors:
            return state
        
        try:
            # Get company
            try:
                company = Company.objects.get(company_id=state.company_id)
            except Company.DoesNotExist:
                state.errors.append(f"Company with ID {state.company_id} not found")
                return state
            
            # Validate and find accounts
            debit_account = self._find_account(company, state.parsed_data.debit_account)
            credit_account = self._find_account(company, state.parsed_data.credit_account)
            
            if not debit_account:
                state.errors.append(f"Debit account '{state.parsed_data.debit_account}' not found")
            
            if not credit_account:
                state.errors.append(f"Credit account '{state.parsed_data.credit_account}' not found")
            
            if state.errors:
                return state
            
            # Validate date
            try:
                transaction_date = datetime.strptime(state.parsed_data.date, "%Y-%m-%d").date()
            except ValueError:
                state.errors.append(f"Invalid date format: {state.parsed_data.date}")
                return state
            
            # Get or create calendar entry
            calendar_entry = self._get_or_create_calendar_entry(company, transaction_date)
            
            # Get default territory (create if doesn't exist)
            territory = self._get_or_create_default_territory(company)
            
            # Validate amount
            if state.parsed_data.amount <= 0:
                state.errors.append("Amount must be positive")
                return state
            
            # Store validated data
            state.validated_data = {
                'company': company,
                'debit_account': debit_account,
                'credit_account': credit_account,
                'calendar_entry': calendar_entry,
                'territory': territory,
                'amount': Decimal(str(state.parsed_data.amount)),
                'details': state.parsed_data.details,
                'reference_number': state.parsed_data.reference_number
            }
            
        except Exception as e:
            state.errors.append(f"Validation node error: {str(e)}")
        
        return state
    
    def execution_node(self, state: AgentState) -> AgentState:
        """
        Execution Node: Create journal entries in the database.
        """
        if not state.validated_data or state.errors:
            return state
        
        try:
            data = state.validated_data
            
            # Create journal entry
            journal_entry = JournalEntry.objects.create(
                company=data['company'],
                date=data['calendar_entry'],
                description=data['details'],
                reference_number=data['reference_number'],
                created_by='LangGraph Agent'
            )
            
            # Create debit entry
            debit_entry = GeneralLedger.objects.create(
                company=data['company'],
                date=data['calendar_entry'],
                territory=data['territory'],
                account=data['debit_account'],
                journal_entry=journal_entry,
                details=data['details'],
                amount=data['amount'],
                transaction_type='DEBIT',
                reference_number=data['reference_number']
            )
            
            # Create credit entry
            credit_entry = GeneralLedger.objects.create(
                company=data['company'],
                date=data['calendar_entry'],
                territory=data['territory'],
                account=data['credit_account'],
                journal_entry=journal_entry,
                details=data['details'],
                amount=data['amount'],
                transaction_type='CREDIT',
                reference_number=data['reference_number']
            )
            
            # Verify journal entry is balanced
            if not journal_entry.is_balanced:
                state.errors.append("Journal entry is not balanced")
                return state
            
            state.result = {
                'success': True,
                'journal_id': journal_entry.journal_id,
                'debit_entry_id': debit_entry.entry_no,
                'credit_entry_id': credit_entry.entry_no,
                'amount': float(data['amount']),
                'message': f"Transaction recorded successfully. Journal ID: {journal_entry.journal_id}"
            }
            
        except Exception as e:
            state.errors.append(f"Execution node error: {str(e)}")
        
        return state
    
    def _find_account(self, company: Company, account_name: str) -> Optional[ChartOfAccounts]:
        """Find account by name (case-insensitive search)."""
        # Try exact match first
        account = ChartOfAccounts.objects.filter(
            company=company,
            account__iexact=account_name
        ).first()
        
        if account:
            return account
        
        # Try partial match
        account = ChartOfAccounts.objects.filter(
            company=company,
            account__icontains=account_name
        ).first()
        
        return account
    
    def _get_or_create_calendar_entry(self, company: Company, transaction_date: date) -> Calendar:
        """Get or create calendar entry for the given date."""
        calendar_entry, created = Calendar.objects.get_or_create(
            company=company,
            date=transaction_date,
            defaults={
                'year': transaction_date.year,
                'quarter': f"Q{(transaction_date.month - 1) // 3 + 1}",
                'month': transaction_date.strftime("%B"),
                'day': transaction_date.strftime("%A")
            }
        )
        return calendar_entry
    
    def _get_or_create_default_territory(self, company: Company) -> Territory:
        """Get or create default territory for the company."""
        territory, created = Territory.objects.get_or_create(
            company=company,
            territory_key=1,
            defaults={
                'country': 'Default',
                'region': 'Default'
            }
        )
        return territory
    
    def process_query(self, query: str, company_id: int) -> Dict[str, Any]:
        """
        Process a natural language query and return the result.
        
        Args:
            query: Natural language query
            company_id: ID of the company
            
        Returns:
            Dictionary containing the result or errors
        """
        # Initialize state
        initial_state = AgentState(
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
                'parsed_data': final_state.parsed_data.dict() if final_state.parsed_data else None
            }
        
        return final_state.result or {
            'success': False,
            'errors': ['Unknown error occurred']
        }


# Global agent instance
_agent_instance = None

def get_agent() -> NumerizamAgent:
    """Get or create the global agent instance."""
    global _agent_instance
    if _agent_instance is None:
        _agent_instance = NumerizamAgent()
    return _agent_instance