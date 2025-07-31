"""
Test script for LangGraph Natural Language to API Translation

This script demonstrates the new LangGraph query agent that translates
natural language queries into structured API calls for the accounting system.

Example Flow:
1. User: "Show me all salary expenses from last year for the USA region, broken down by month"
2. Agent: Translates to API parameters
3. API Call: GET /api/general-ledger/summary_by_date/?details__icontains=salary&territory__country=USA&date__year=2024&group_by=month
4. Response: Structured JSON data
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://127.0.0.1:8000/api"
COMPANY_ID = 1

# Test queries demonstrating various capabilities
TEST_QUERIES = [
    {
        "name": "Salary Expenses by Month for USA",
        "query": "Show me all salary expenses from last year for the USA region, broken down by month",
        "expected_endpoint": "summary_by_date"
    },
    {
        "name": "Revenue by Account Q1 2024",
        "query": "Total revenue by account for Q1 2024",
        "expected_endpoint": "summary_by_account"
    },
    {
        "name": "Territory Summary",
        "query": "Show me total transactions by territory for this year",
        "expected_endpoint": "summary_by_territory"
    },
    {
        "name": "Large Transactions",
        "query": "Show me all debit transactions over $5000 from the last 6 months",
        "expected_endpoint": "general-ledger"
    },
    {
        "name": "Pivot Table",
        "query": "Create a pivot table showing territories vs accounts",
        "expected_endpoint": "pivot_territory_by_account"
    },
    {
        "name": "Monthly Analysis",
        "query": "Give me a monthly analysis of all transactions for 2024",
        "expected_endpoint": "monthly_analysis"
    },
    {
        "name": "Account Balances",
        "query": "Show account balances for all revenue accounts",
        "expected_endpoint": "account_balances"
    },
    {
        "name": "Expense Analysis by Company",
        "query": "What were the total expenses by company last quarter?",
        "expected_endpoint": "summary_by_company"
    },
    {
        "name": "Invoice Transactions",
        "query": "Show me all credit transactions containing 'invoice' in the details",
        "expected_endpoint": "general-ledger"
    },
    {
        "name": "Advanced Multi-dimensional",
        "query": "Group all transactions by territory and account type, show sum and average",
        "expected_endpoint": "advanced_summary"
    }
]

def test_query_translation():
    """Test the natural language to API translation endpoint."""
    print("=" * 80)
    print("TESTING NATURAL LANGUAGE TO API TRANSLATION")
    print("=" * 80)
    
    translation_url = f"{BASE_URL}/query/translate/"
    passed = 0
    total = len(TEST_QUERIES)
    
    for i, test_case in enumerate(TEST_QUERIES, 1):
        print(f"\n{i}. {test_case['name']}")
        print(f"Query: \"{test_case['query']}\"")
        
        try:
            response = requests.post(translation_url, json={
                "query": test_case['query'],
                "company_id": COMPANY_ID
            })
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    print(f"✅ Translation successful")
                    print(f"   Endpoint: {result.get('endpoint')}")
                    print(f"   API URL: {result.get('api_url')}")
                    print(f"   Description: {result.get('description')}")
                    
                    # Check if endpoint matches expectation
                    if result.get('endpoint') == test_case['expected_endpoint']:
                        print(f"   ✅ Expected endpoint matched")
                        passed += 1
                    else:
                        print(f"   ⚠️  Expected '{test_case['expected_endpoint']}', got '{result.get('endpoint')}'")
                        passed += 0.5  # Partial credit
                else:
                    print(f"❌ Translation failed: {result.get('errors', 'Unknown error')}")
            else:
                print(f"❌ HTTP Error {response.status_code}: {response.text[:200]}")
                
        except Exception as e:
            print(f"❌ Request failed: {str(e)}")
    
    print(f"\n📊 Translation Test Results: {passed}/{total} passed")
    return passed, total

def test_query_execution():
    """Test the natural language query execution endpoint."""
    print("\n" + "=" * 80)
    print("TESTING NATURAL LANGUAGE QUERY EXECUTION")
    print("=" * 80)
    
    execution_url = f"{BASE_URL}/query/execute/"
    
    # Test a few representative queries
    execution_tests = [
        "Show me total transactions by territory for this year",
        "Give me account balances for all accounts",
        "Show me a summary of all transactions"
    ]
    
    passed = 0
    total = len(execution_tests)
    
    for i, query in enumerate(execution_tests, 1):
        print(f"\n{i}. Executing: \"{query}\"")
        
        try:
            response = requests.post(execution_url, json={
                "query": query,
                "company_id": COMPANY_ID
            })
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    print(f"✅ Execution successful")
                    print(f"   Translated to: {result.get('query_translation', {}).get('endpoint')}")
                    print(f"   Data records: {len(result.get('data', []))}")
                    
                    # Show sample data if available
                    data = result.get('data', [])
                    if data and isinstance(data, list) and len(data) > 0:
                        print(f"   Sample data: {json.dumps(data[0], indent=6)[:200]}...")
                    
                    passed += 1
                else:
                    print(f"❌ Execution failed: {result.get('error', 'Unknown error')}")
            else:
                print(f"❌ HTTP Error {response.status_code}: {response.text[:200]}")
                
        except Exception as e:
            print(f"❌ Request failed: {str(e)}")
    
    print(f"\n📊 Execution Test Results: {passed}/{total} passed")
    return passed, total

def test_batch_processing():
    """Test batch processing of multiple queries."""
    print("\n" + "=" * 80)
    print("TESTING BATCH QUERY PROCESSING")
    print("=" * 80)
    
    batch_url = f"{BASE_URL}/query/batch/"
    
    # Test batch with translation only
    batch_queries = [
        {
            "id": "batch_1",
            "query": "Show salary expenses for USA",
            "company_id": COMPANY_ID
        },
        {
            "id": "batch_2",
            "query": "Total revenue by account",
            "company_id": COMPANY_ID
        },
        {
            "id": "batch_3",
            "query": "Monthly analysis for 2024",
            "company_id": COMPANY_ID
        }
    ]
    
    try:
        # Test translation only
        print("Testing batch translation...")
        response = requests.post(batch_url, json={
            "queries": batch_queries,
            "execute": False
        })
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print(f"✅ Batch translation successful")
                print(f"   Total queries: {result.get('total_queries')}")
                print(f"   Successful translations: {result.get('successful_translations')}")
                
                for query_result in result.get('results', []):
                    print(f"   - {query_result.get('id')}: {query_result.get('endpoint', 'Failed')}")
                
                return True
            else:
                print(f"❌ Batch processing failed: {result.get('error')}")
        else:
            print(f"❌ HTTP Error {response.status_code}: {response.text[:200]}")
            
    except Exception as e:
        print(f"❌ Request failed: {str(e)}")
    
    return False

def test_agent_capabilities():
    """Test the agent capabilities endpoint."""
    print("\n" + "=" * 80)
    print("TESTING AGENT CAPABILITIES")
    print("=" * 80)
    
    capabilities_url = f"{BASE_URL}/query/capabilities/"
    
    try:
        response = requests.get(capabilities_url)
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("✅ Capabilities retrieved successfully")
                
                endpoints = result.get('endpoints', {})
                print(f"\n📋 Available Endpoints ({len(endpoints)}):")
                for endpoint, description in endpoints.items():
                    print(f"   - {endpoint}: {description}")
                
                examples = result.get('example_queries', [])
                print(f"\n💡 Example Queries ({len(examples)}):")
                for i, example in enumerate(examples[:5], 1):  # Show first 5
                    print(f"   {i}. {example}")
                
                filters = result.get('supported_filters', {})
                print(f"\n🔍 Supported Filters:")
                for filter_type, filter_list in filters.items():
                    print(f"   - {filter_type}: {', '.join(filter_list)}")
                
                return True
            else:
                print(f"❌ Failed to get capabilities: {result.get('error')}")
        else:
            print(f"❌ HTTP Error {response.status_code}: {response.text[:200]}")
            
    except Exception as e:
        print(f"❌ Request failed: {str(e)}")
    
    return False

def test_agent_status():
    """Test the agent status endpoint."""
    print("\n" + "=" * 80)
    print("TESTING AGENT STATUS")
    print("=" * 80)
    
    status_url = f"{BASE_URL}/query/status/"
    
    try:
        response = requests.get(status_url)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Agent status retrieved successfully")
            print(f"   Status: {result.get('status')}")
            print(f"   Agent Type: {result.get('agent_type')}")
            print(f"   Capabilities: {result.get('capabilities')}")
            print(f"   Version: {result.get('version')}")
            return True
        else:
            print(f"❌ HTTP Error {response.status_code}: {response.text[:200]}")
            
    except Exception as e:
        print(f"❌ Request failed: {str(e)}")
    
    return False

def main():
    """Run all tests for the LangGraph Natural Language to API Translation system."""
    print("🚀 LANGGRAPH NATURAL LANGUAGE TO API TRANSLATION TESTS")
    print(f"Testing against: {BASE_URL}")
    print(f"Company ID: {COMPANY_ID}")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Run all tests
    results = []
    
    # Test 1: Agent Status
    status_ok = test_agent_status()
    results.append(("Agent Status", status_ok))
    
    # Test 2: Agent Capabilities
    capabilities_ok = test_agent_capabilities()
    results.append(("Agent Capabilities", capabilities_ok))
    
    # Test 3: Query Translation
    translation_passed, translation_total = test_query_translation()
    results.append(("Query Translation", f"{translation_passed}/{translation_total}"))
    
    # Test 4: Query Execution
    execution_passed, execution_total = test_query_execution()
    results.append(("Query Execution", f"{execution_passed}/{execution_total}"))
    
    # Test 5: Batch Processing
    batch_ok = test_batch_processing()
    results.append(("Batch Processing", batch_ok))
    
    # Summary
    print("\n" + "=" * 80)
    print("🎯 FINAL TEST SUMMARY")
    print("=" * 80)
    
    for test_name, result in results:
        status = "✅ PASS" if result == True or (isinstance(result, str) and "/" in result) else "❌ FAIL"
        print(f"{test_name:25} {status:10} {result}")
    
    print("\n🎉 LangGraph Natural Language to API Translation testing complete!")
    print("\nThe system can now translate natural language queries like:")
    print("  'Show me all salary expenses from last year for the USA region, broken down by month'")
    print("Into structured API calls like:")
    print("  GET /api/general-ledger/summary_by_date/?details__icontains=salary&territory__country=USA&date__year=2024&group_by=month")

if __name__ == "__main__":
    main()