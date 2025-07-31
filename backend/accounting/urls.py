"""
URL configuration for the accounting app.

This module defines the URL patterns for the comprehensive accounting API endpoints
with advanced filtering, analytics, and financial reporting capabilities.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import langgraph_views
from . import langgraph_query_views
from . import langgraph_save_views
from . import api_views

# Create a router for ViewSets with advanced filtering
router = DefaultRouter()

# Core data management endpoints with advanced filtering
router.register(r'companies', api_views.CompanyViewSet, basename='company')
router.register(r'chart-of-accounts', api_views.ChartOfAccountsViewSet, basename='chartofaccounts')
router.register(r'territories', api_views.TerritoryViewSet, basename='territory')
router.register(r'calendar', api_views.CalendarViewSet, basename='calendar')
router.register(r'general-ledger', api_views.GeneralLedgerViewSet, basename='generalledger')
router.register(r'journal-entries', api_views.JournalEntryViewSet, basename='journalentry')

# Financial analysis endpoints
router.register(r'financial-analysis', api_views.FinancialAnalysisViewSet, basename='financial-analysis')

urlpatterns = [
    # Include router URLs with advanced filtering
    path('', include(router.urls)),
    
    # Legacy endpoints (keeping for backward compatibility)
    path('legacy/companies/', views.CompanyViewSet.as_view({'get': 'list', 'post': 'create'}), name='legacy-companies'),
    path('legacy/chart-of-accounts/', views.ChartOfAccountsViewSet.as_view({'get': 'list', 'post': 'create'}), name='legacy-chart-of-accounts'),
    
    # LangGraph AI endpoints (original transaction processing)
    path('ai/process-query/', langgraph_views.process_natural_language_query, name='ai-process-query'),
    path('ai/batch-process/', langgraph_views.batch_process_queries, name='ai-batch-process'),
    path('ai/validate-query/', langgraph_views.validate_query, name='ai-validate-query'),
    path('ai/status/', langgraph_views.agent_status, name='ai-agent-status'),
    
    # LangGraph Query Translation endpoints (new natural language to API translation)
    path('query/translate/', langgraph_query_views.process_natural_language_query, name='query-translate'),
    path('query/execute/', langgraph_query_views.execute_natural_language_query, name='query-execute'),
    path('query/batch/', langgraph_query_views.batch_process_natural_language_queries, name='query-batch'),
    path('query/capabilities/', langgraph_query_views.query_agent_capabilities, name='query-capabilities'),
    path('query/status/', langgraph_query_views.query_agent_status, name='query-status'),
    
    # LangGraph Save endpoints (save confirmed query results to database)
    path('save/query-results/', langgraph_save_views.save_query_results, name='save-query-results'),
    path('save/saved-queries/', langgraph_save_views.get_saved_queries, name='get-saved-queries'),
    path('save/status/', langgraph_save_views.save_service_status, name='save-service-status'),
]

# Add conditional endpoints if they exist in views.py
try:
    if hasattr(views, 'ProfitLossReportView'):
        urlpatterns.append(path('reports/profit-loss/', views.ProfitLossReportView.as_view(), name='profit-loss-report'))
    if hasattr(views, 'BalanceSheetReportView'):
        urlpatterns.append(path('reports/balance-sheet/', views.BalanceSheetReportView.as_view(), name='balance-sheet-report'))
    if hasattr(views, 'TrialBalanceReportView'):
        urlpatterns.append(path('reports/trial-balance/', views.TrialBalanceReportView.as_view(), name='trial-balance-report'))
    if hasattr(views, 'ProcessTransactionView'):
        urlpatterns.append(path('transactions/process/', views.ProcessTransactionView.as_view(), name='process-transaction'))
    if hasattr(views, 'BulkCreateTransactionsView'):
        urlpatterns.append(path('transactions/bulk-create/', views.BulkCreateTransactionsView.as_view(), name='bulk-create-transactions'))
except AttributeError:
    pass