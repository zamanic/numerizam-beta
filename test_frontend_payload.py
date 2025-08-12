#!/usr/bin/env python3
"""
Test script to simulate the frontend payload structure and identify the exact issue
"""
import json
import requests

# Simulate the payload structure that the frontend might be sending
frontend_payload = {
    "companies": {
        "company_name": "Test Company"
    },
    "territory": {
        "country": "Bangladesh",
        "region": "Asia"
    },
    "calendar": {
        "date": "2024-01-15",
        "year": 2024,
        "quarter": "Q1",
        "month": 1,
        "day": 15
    },
    "chartofaccounts": [
        {
            "account_key": 1001,
            "report": "Balance Sheet",
            "class": "Assets",
            "subclass": "Current Assets",
            "subclass2": "Cash",
            "account": "Cash",
            "subaccount": "Petty Cash"
        }
    ],
    "generalledger": [
        {
            "account_key": 1001,
            "amount": 500,
            "type": "Debit",
            "details": "Cash sale transaction"
        }
    ]
}

# Transform to backend format (similar to what the frontend does)
backend_payload = {
    "company_data": {
        "company_name": frontend_payload["companies"]["company_name"]
    },
    "territory_data": {
        "Country": frontend_payload["territory"]["country"],
        "Region": frontend_payload["territory"]["region"]
    },
    "calendar_data": {
        "Date": frontend_payload["calendar"]["date"],
        "Year": frontend_payload["calendar"]["year"],
        "Quarter": frontend_payload["calendar"]["quarter"],
        "Month": frontend_payload["calendar"]["month"],
        "Day": frontend_payload["calendar"]["day"]
    },
    "chart_of_accounts_data": [
        {
            "Account_key": account["account_key"],
            "Report": account["report"],
            "Class": account["class"],
            "SubClass": account["subclass"],
            "SubClass2": account["subclass2"],
            "Account": account["account"],
            "SubAccount": account["subaccount"]
        }
        for account in frontend_payload["chartofaccounts"]
    ],
    "general_ledger_entries": [
        {
            "Account_key": entry["account_key"],
            "Amount": entry["amount"],
            "Type": entry["type"],
            "Details": entry["details"]
        }
        for entry in frontend_payload["generalledger"]
    ]
}

print("Frontend payload structure:")
print(json.dumps(frontend_payload, indent=2))
print("\nBackend payload structure:")
print(json.dumps(backend_payload, indent=2))

# Test the API call
try:
    response = requests.post(
        "http://localhost:8000/api/transactions/process/",
        json=backend_payload,
        headers={"Content-Type": "application/json"}
    )
    print(f"\nAPI Response Status: {response.status_code}")
    print(f"API Response Content: {response.text}")
except Exception as e:
    print(f"\nError making API call: {e}")