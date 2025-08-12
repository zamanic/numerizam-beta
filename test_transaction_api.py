#!/usr/bin/env python3
"""
Test script to directly test the transaction processing API
This will help us identify the exact cause of the 500 error
"""

import requests
import json

# Test payload based on the serializer requirements
test_payload = {
    "company_data": {
        "company_name": "Test Company"
    },
    "calendar_data": {
        "Date": "2024-12-15",
        "Year": 2024,
        "Quarter": "Q4",
        "Month": 12,
        "Day": 15
    },
    "territory_data": {
        "Country": "USA",
        "Region": "Main Territory"
    },
    "chart_of_accounts_data": [
        {
            "Account_key": "1000",
            "Report": "Balance Sheet",
            "Class": "Asset",
            "SubClass": "Current Asset",
            "SubClass2": "Cash",
            "Account": "Cash",
            "SubAccount": "Operating Cash"
        },
        {
            "Account_key": "5000",
            "Report": "Income Statement",
            "Class": "Expense",
            "SubClass": "Operating Expense",
            "SubClass2": "Payroll",
            "Account": "Wages Expense",
            "SubAccount": "Regular Wages"
        },
        {
            "Account_key": "4000",
            "Report": "Income Statement",
            "Class": "Revenue",
            "SubClass": "Operating Revenue",
            "SubClass2": "Sales",
            "Account": "Sales Revenue",
            "SubAccount": "Product Sales"
        }
    ],
    "general_ledger_entries": [
        {
            "Account_key": "5000",
            "Amount": 5000.00,
            "Type": "Debit",
            "Details": "Paid wages to employees"
        },
        {
            "Account_key": "1000",
            "Amount": 5000.00,
            "Type": "Credit",
            "Details": "Cash payment for wages"
        },
        {
            "Account_key": "1000",
            "Amount": 3000.00,
            "Type": "Debit",
            "Details": "Cash received from sales"
        },
        {
            "Account_key": "4000",
            "Amount": 3000.00,
            "Type": "Credit",
            "Details": "Revenue from goods sold"
        }
    ]
}

def test_transaction_api():
    """Test the transaction processing API"""
    url = "http://localhost:8000/api/transactions/process/"
    
    print("Testing transaction processing API...")
    print(f"URL: {url}")
    print(f"Payload: {json.dumps(test_payload, indent=2)}")
    
    try:
        response = requests.post(
            url,
            json=test_payload,
            headers={
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout=30
        )
        
        print(f"\nResponse Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ SUCCESS!")
            print(f"Response: {response.json()}")
        else:
            print("❌ ERROR!")
            print(f"Response Text: {response.text}")
            
            # Try to parse as JSON if possible
            try:
                error_data = response.json()
                print(f"Error JSON: {json.dumps(error_data, indent=2)}")
            except:
                print("Could not parse response as JSON")
                
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    test_transaction_api()