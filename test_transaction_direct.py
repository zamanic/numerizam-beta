#!/usr/bin/env python3
"""
Direct test of the transaction processing endpoint to debug the 500 error.
"""

import requests
import json

# Test payload matching the frontend structure
test_payload = {
    "company_data": {
        "company_name": "Test Company"
    },
    "territory_data": {
        "Country": "Bangladesh",
        "Region": "Asia"
    },
    "calendar_data": {
        "Date": "2023-10-01",
        "Year": 2023,
        "Quarter": "Q4",
        "Month": "October",
        "Day": "Sunday"
    },
    "chart_of_accounts_data": [
        {
            "Account_key": 1000,
            "Report": "Balance Sheet",
            "Class": "Asset",
            "SubClass": "Current Asset",
            "SubClass2": "Cash",
            "Account": "Cash",
            "SubAccount": "Checking"
        },
        {
            "Account_key": 4000,
            "Report": "Income Statement",
            "Class": "Revenue",
            "SubClass": "Sales Revenue",
            "SubClass2": "Product Sales",
            "Account": "Sales Revenue",
            "SubAccount": "Product Sales"
        },
        {
            "Account_key": 5000,
            "Report": "Income Statement",
            "Class": "Expense",
            "SubClass": "Cost of Goods Sold",
            "SubClass2": "Direct Costs",
            "Account": "Cost of Goods Sold",
            "SubAccount": "Product Costs"
        }
    ],
    "general_ledger_entries": [
        {
            "Account_key": 1000,
            "Amount": 1000,
            "Type": "Debit",
            "Details": "Cash received from sale"
        },
        {
            "Account_key": 4000,
            "Amount": 1000,
            "Type": "Credit",
            "Details": "Revenue from sale"
        },
        {
            "Account_key": 5000,
            "Amount": 800,
            "Type": "Debit",
            "Details": "Cost of goods sold"
        }
    ]
}

def test_transaction_endpoint():
    """Test the transaction processing endpoint."""
    url = "http://localhost:8000/api/transactions/process/"
    headers = {
        "Content-Type": "application/json"
    }
    
    print("Testing transaction endpoint...")
    print(f"URL: {url}")
    print(f"Payload: {json.dumps(test_payload, indent=2)}")
    print("-" * 50)
    
    try:
        response = requests.post(url, json=test_payload, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        print(f"Status Text: {response.reason}")
        print(f"Headers: {dict(response.headers)}")
        print("-" * 50)
        
        if response.status_code == 200 or response.status_code == 201:
            print("SUCCESS!")
            print(f"Response: {response.json()}")
        else:
            print("ERROR!")
            try:
                error_data = response.json()
                print(f"Error Response: {json.dumps(error_data, indent=2)}")
            except:
                print(f"Raw Error Response: {response.text}")
                
    except requests.exceptions.ConnectionError:
        print("ERROR: Could not connect to Django server. Make sure it's running on localhost:8000")
    except Exception as e:
        print(f"ERROR: {str(e)}")

if __name__ == "__main__":
    test_transaction_endpoint()