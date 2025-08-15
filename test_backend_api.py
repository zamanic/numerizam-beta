#!/usr/bin/env python3

import requests
import os

def test_pdf_processing(pdf_path="test_invoice.pdf"):
    """Test the backend API with a PDF file"""
    if not os.path.exists(pdf_path):
        print(f"Error: {pdf_path} not found")
        return
    
    url = "http://localhost:5001/parse"
    
    try:
        with open(pdf_path, 'rb') as f:
            files = {'file': (pdf_path, f, 'application/pdf')}
            print(f"Sending {pdf_path} to {url}...")
            response = requests.post(url, files=files, timeout=60)
            
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ Success!")
            result = response.json()
            print(f"Result keys: {list(result.keys())}")
            if 'text' in result:
                print(f"Extracted text length: {len(result['text'])}")
                print(f"First 200 chars: {result['text'][:200]}...")
        else:
            print("❌ Error!")
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")

if __name__ == "__main__":
    test_pdf_processing()