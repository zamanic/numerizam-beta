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
import re
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


class MultipleTransactionData(BaseModel):
    """Container for multiple transactions."""
    transactions: List[TransactionData]
    is_multiple: bool = True


class AgentState(BaseModel):
    """State object that flows through the LangGraph nodes."""
    query: str
    company_id: int
    parsed_data: Optional[TransactionData] = None
    multiple_parsed_data: Optional[MultipleTransactionData] = None
    validated_data: Optional[Dict[str, Any]] = None
    multiple_validated_data: Optional[List[Dict[str, Any]]] = None
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
        Can handle both single and multiple transactions.
        """
        try:
            # First, detect if this is a multiple transaction query
            if self._is_multiple_transaction_query(state.query):
                return self._parse_multiple_transactions(state)
            else:
                return self._parse_single_transaction(state)
                
        except Exception as e:
            state.errors.append(f"Parser node error: {str(e)}")
        
        return state
    
    def _is_multiple_transaction_query(self, query: str) -> bool:
        """Detect if the query contains multiple transactions."""
        # Look for numbered lists or multiple transaction indicators
        patterns = [
            r'\d+\.\s+',  # Numbered lists like "1. ", "2. "
            r'first.*second',  # Sequential indicators
            r'then.*and',  # Sequential connectors
            r'multiple.*transaction',  # Explicit mentions
            r'several.*transaction',
            r'following.*transaction',
        ]
        
        query_lower = query.lower()
        for pattern in patterns:
            if re.search(pattern, query_lower):
                return True
        
        # Count potential transaction verbs
        transaction_verbs = ['invested', 'bought', 'received', 'paid', 'withdrew', 'purchased', 'sold', 'earned']
        verb_count = sum(1 for verb in transaction_verbs if verb in query_lower)
        
        return verb_count > 1
    
    def _parse_single_transaction(self, state: AgentState) -> AgentState:
        """Parse a single transaction query."""
        system_prompt = """
        You are an expert accounting assistant. Extract structured transaction information from natural language queries.
        
        Extract the following information:
        - date: Transaction date (convert to YYYY-MM-DD format, use current date if not specified)
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
        - "office supplies" -> "Office Supplies Expense"
        - "capital" -> "Owner's Capital"
        - "investment" -> "Owner's Capital"
        
        Return the information as a JSON object with the exact field names specified.
        """
        
        user_prompt = f"Extract transaction information from: {state.query}"
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ]
        
        response = self.llm.invoke(messages)
        
        # Debug logging
        print(f"DEBUG: LLM Response type: {type(response.content)}")
        print(f"DEBUG: LLM Response content: '{response.content}'")
        print(f"DEBUG: LLM Response length: {len(response.content) if response.content else 0}")
        
        # Parse the JSON response
        try:
            if not response.content or response.content.strip() == "":
                state.errors.append("LLM returned empty response")
                return state
            
            # Strip markdown code blocks if present
            cleaned_content = self._strip_markdown_code_blocks(response.content)
            parsed_json = json.loads(cleaned_content)
            state.parsed_data = TransactionData(**parsed_json)
        except (json.JSONDecodeError, ValueError) as e:
            state.errors.append(f"Failed to parse LLM response: {str(e)}. Response was: '{response.content}'")
            
        return state
    
    def _parse_multiple_transactions(self, state: AgentState) -> AgentState:
        """Parse multiple transactions from a single query."""
        system_prompt = """
        You are an expert accounting assistant. Extract multiple structured transaction information from natural language queries.
        
        The query contains multiple transactions. Extract each transaction separately.
        
        For each transaction, extract:
        - date: Transaction date (convert to YYYY-MM-DD format, use current date if not specified)
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
        - "office supplies" -> "Office Supplies Expense"
        - "capital" -> "Owner's Capital"
        - "investment" -> "Owner's Capital"
        
        Return the information as a JSON object with a "transactions" array containing each transaction object.
        Example:
        {
            "transactions": [
                {
                    "date": "2025-01-15",
                    "debit_account": "Cash",
                    "credit_account": "Owner's Capital",
                    "amount": 5000,
                    "details": "Initial investment",
                    "reference_number": null
                },
                {
                    "date": "2025-01-15",
                    "debit_account": "Office Supplies Expense",
                    "credit_account": "Accounts Payable",
                    "amount": 500,
                    "details": "Office supplies purchased on account",
                    "reference_number": null
                }
            ]
        }
        """
        
        user_prompt = f"Extract all transaction information from: {state.query}"
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ]
        
        response = self.llm.invoke(messages)
        
        # Debug logging
        print(f"DEBUG: Multiple transactions LLM Response type: {type(response.content)}")
        print(f"DEBUG: Multiple transactions LLM Response content: '{response.content}'")
        print(f"DEBUG: Multiple transactions LLM Response length: {len(response.content) if response.content else 0}")
        
        # Parse the JSON response
        try:
            if not response.content or response.content.strip() == "":
                state.errors.append("LLM returned empty response for multiple transactions")
                return state
            
            # Strip markdown code blocks if present
            cleaned_content = self._strip_markdown_code_blocks(response.content)
            parsed_json = json.loads(cleaned_content)
            transactions = [TransactionData(**tx) for tx in parsed_json['transactions']]
            state.multiple_parsed_data = MultipleTransactionData(transactions=transactions)
        except (json.JSONDecodeError, ValueError, KeyError) as e:
            state.errors.append(f"Failed to parse multiple transactions LLM response: {str(e)}. Response was: '{response.content}'")
            
        return state
    
    def validation_node(self, state: AgentState) -> AgentState:
        """
        Validation Node: Validate accounts and data against the database.
        Can handle both single and multiple transactions.
        """
        if state.errors:
            return state
        
        # Handle multiple transactions
        if state.multiple_parsed_data:
            return self._validate_multiple_transactions(state)
        # Handle single transaction
        elif state.parsed_data:
            return self._validate_single_transaction(state)
        else:
            state.errors.append("No parsed data found for validation")
            return state
    
    def _validate_single_transaction(self, state: AgentState) -> AgentState:
        """Validate a single transaction."""
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
    
    def _validate_multiple_transactions(self, state: AgentState) -> AgentState:
        """Validate multiple transactions."""
        try:
            # Get company
            try:
                company = Company.objects.get(company_id=state.company_id)
            except Company.DoesNotExist:
                state.errors.append(f"Company with ID {state.company_id} not found")
                return state
            
            validated_transactions = []
            
            for i, transaction in enumerate(state.multiple_parsed_data.transactions):
                transaction_errors = []
                
                # Validate and find accounts
                debit_account = self._find_account(company, transaction.debit_account)
                credit_account = self._find_account(company, transaction.credit_account)
                
                if not debit_account:
                    transaction_errors.append(f"Transaction {i+1}: Debit account '{transaction.debit_account}' not found")
                
                if not credit_account:
                    transaction_errors.append(f"Transaction {i+1}: Credit account '{transaction.credit_account}' not found")
                
                # Validate date
                try:
                    transaction_date = datetime.strptime(transaction.date, "%Y-%m-%d").date()
                except ValueError:
                    transaction_errors.append(f"Transaction {i+1}: Invalid date format: {transaction.date}")
                    transaction_date = None
                
                # Validate amount
                if transaction.amount <= 0:
                    transaction_errors.append(f"Transaction {i+1}: Amount must be positive")
                
                # If there are errors for this transaction, add them to the state errors
                if transaction_errors:
                    state.errors.extend(transaction_errors)
                    continue
                
                # Get or create calendar entry
                calendar_entry = self._get_or_create_calendar_entry(company, transaction_date)
                
                # Get default territory (create if doesn't exist)
                territory = self._get_or_create_default_territory(company)
                
                # Store validated data for this transaction
                validated_transactions.append({
                    'company': company,
                    'debit_account': debit_account,
                    'credit_account': credit_account,
                    'calendar_entry': calendar_entry,
                    'territory': territory,
                    'amount': Decimal(str(transaction.amount)),
                    'details': transaction.details,
                    'reference_number': transaction.reference_number
                })
            
            # Only store validated data if there are no errors
            if not state.errors:
                state.multiple_validated_data = validated_transactions
            
        except Exception as e:
            state.errors.append(f"Multiple validation node error: {str(e)}")
        
        return state
    
    def execution_node(self, state: AgentState) -> AgentState:
        """
        Execution Node: Create journal entries in the database.
        Can handle both single and multiple transactions.
        """
        if state.errors:
            return state
        
        # Handle multiple transactions
        if state.multiple_validated_data:
            return self._execute_multiple_transactions(state)
        # Handle single transaction
        elif state.validated_data:
            return self._execute_single_transaction(state)
        else:
            state.errors.append("No validated data found for execution")
            return state
    
    def _execute_single_transaction(self, state: AgentState) -> AgentState:
        """Execute a single transaction."""
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
    
    def _execute_multiple_transactions(self, state: AgentState) -> AgentState:
        """Execute multiple transactions."""
        try:
            results = []
            total_amount = Decimal('0')
            
            for i, data in enumerate(state.multiple_validated_data):
                try:
                    # Create journal entry for this transaction
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
                        state.errors.append(f"Transaction {i+1}: Journal entry is not balanced")
                        continue
                    
                    results.append({
                        'transaction_number': i + 1,
                        'journal_id': journal_entry.journal_id,
                        'debit_entry_id': debit_entry.entry_no,
                        'credit_entry_id': credit_entry.entry_no,
                        'amount': float(data['amount']),
                        'details': data['details']
                    })
                    
                    total_amount += data['amount']
                    
                except Exception as e:
                    state.errors.append(f"Transaction {i+1} execution error: {str(e)}")
            
            if results and not state.errors:
                state.result = {
                    'success': True,
                    'transactions_processed': len(results),
                    'total_amount': float(total_amount),
                    'transactions': results,
                    'message': f"Successfully processed {len(results)} transactions with total amount ${total_amount}"
                }
            elif results and state.errors:
                state.result = {
                    'success': False,
                    'transactions_processed': len(results),
                    'total_amount': float(total_amount),
                    'transactions': results,
                    'errors': state.errors,
                    'message': f"Processed {len(results)} transactions but encountered errors"
                }
            
        except Exception as e:
            state.errors.append(f"Multiple execution node error: {str(e)}")
        
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
    
    def _strip_markdown_code_blocks(self, content: str) -> str:
        """Strip markdown code blocks from LLM response content."""
        if not content:
            return content
        
        # Remove ```json and ``` markers
        content = content.strip()
        if content.startswith('```json'):
            content = content[7:].lstrip()  # Remove ```json and any following whitespace
        elif content.startswith('```'):
            content = content[3:].lstrip()   # Remove ``` and any following whitespace
        
        if content.endswith('```'):
            content = content[:-3].rstrip()  # Remove trailing ``` and any preceding whitespace
        
        return content.strip()
    
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