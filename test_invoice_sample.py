#!/usr/bin/env python3
"""
Test script to analyze extraction issues with the sample invoice
"""

import sys
import os
import re

# Sample invoice text structure from the user's image
sample_text = """
EQMS

Invoice

Bill No. : EQMS/NEPCS/2024-01    Date : 18/12/2024
WO No: NEPCS-M3-AP-018-2024-036

Company Name. : China Northeast Electric Power Engineering & Services Co. Ltd.
Address : Manama M.S. Toren (12th Floor), Plot: Ga/99/3/A/B, Middle Badda, Badda, Dhaka-1212

Project Name : SFL Unique Nebras Meghnaghat Power PLC, 584 Mw Gas Fired Combined Cycle Power Project

| SL | Name of Item | Quantity | Unit Price (BDT) | Amount (BDT) |
| 1 | Ambient Air Quality | 5 | 10000 | 50000 |
| 2 | Noise Level Monitoring | 6 | 3500 | 21000 |
| 3 | Surface Water | 2 | 6200 | 12400 |
| 4 | Waste Water | 2 | 6000 | 12000 |
| 5 | Indoor Air Quality | 1 | 7000 | 7000 |
| 6 | STP Water | 1 | 6400 | 6400 |
| 7 | ETP Water | 1 | 30000 | 30000 |
| 8 | Storm Water | 1 | 7500 | 7500 |
| 9 | Soil Quality | 1 | 15000 | 15000 |
| 10 | Occupational Noise | 1 | 3000 | 3000 |
|  |  |  | Sub Total | 1,64,300 |
|  |  |  | Tax 10% | 18,256 |
|  |  |  | Vat 15% | 27,383 |
|  |  |  | Gross Grand Total | 2,09,939 |
"""

def test_extraction_functions():
    """Test individual extraction functions"""
    
    print("TESTING EXTRACTION FUNCTIONS")
    print("=" * 50)
    
    # Test supplier name extraction
    def extract_supplier_name(md_content):
        """Extract supplier company name from header or logo area"""
        import re
        
        # Look for company names at the beginning of document
        patterns = [
            r'^([A-Z][^\n]{5,80}(?:Inc|LLC|Corp|Ltd|Co|Company|Corporation|Limited)\.?)\s*$',
            r'^([A-Z][A-Z\s&.,()-]{10,80})\s*$',  # All caps company names
            r'(?i)(?:company|supplier|vendor):\s*([^\n]+)',
            r'^([^\n]{2,60})\s*(?:\n|$)'  # First substantial line
        ]
        
        lines = md_content.split('\n')[:5]  # Check first 5 lines
        
        for line in lines:
            line = line.strip()
            if len(line) > 2 and not re.match(r'^\d', line):  # Not starting with number
                for pattern in patterns:
                    match = re.search(pattern, line, re.MULTILINE)
                    if match:
                        return match.group(1).strip()
        
        return ""
    
    # Test itemized list extraction
    def extract_itemized_list(md_content):
        """Extract itemized list from table"""
        import re
        
        items = []
        
        # Look for table rows with | separators
        table_rows = re.findall(r'\|\s*(\d+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|', md_content)
        
        for row in table_rows:
            sl_no, name, quantity, unit_price, amount = row
            
            # Extract numbers
            qty_match = re.search(r'(\d+)', quantity.strip())
            price_match = re.search(r'(\d+)', unit_price.strip())
            amt_match = re.search(r'(\d+)', amount.strip())
            
            item = {
                'sl_no': int(sl_no.strip()),
                'name': name.strip(),
                'quantity': int(qty_match.group(1)) if qty_match else 0,
                'unit_price': float(price_match.group(1)) if price_match else 0,
                'amount': float(amt_match.group(1)) if amt_match else 0
            }
            items.append(item)
        
        return items
    
    # Test financial extraction
    def extract_subtotal(md_content):
        """Extract subtotal"""
        import re
        match = re.search(r'Sub Total\s*\|\s*([0-9,]+)', md_content)
        if match:
            return float(match.group(1).replace(',', ''))
        return 0.0
    
    def extract_tax_amount(md_content):
        """Extract tax amount"""
        import re
        match = re.search(r'Tax \d+%\s*\|\s*([0-9,]+)', md_content)
        if match:
            return float(match.group(1).replace(',', ''))
        return 0.0
    
    def extract_vat_amount(md_content):
        """Extract VAT amount"""
        import re
        match = re.search(r'Vat \d+%\s*\|\s*([0-9,]+)', md_content)
        if match:
            return float(match.group(1).replace(',', ''))
        return 0.0
    
    def extract_total_amount(md_content):
        """Extract total amount"""
        import re
        match = re.search(r'Gross Grand Total\s*\|\s*([0-9,]+)', md_content)
        if match:
            return float(match.group(1).replace(',', ''))
        return 0.0
    
    # Run tests
    print("Sample text:")
    print(sample_text[:200] + "...")
    print("\n" + "=" * 50)
    
    # Test supplier name
    supplier = extract_supplier_name(sample_text)
    print(f"Supplier Name: '{supplier}' (Expected: 'EQMS')")
    if supplier == 'EQMS':
        print("✅ Supplier name extraction: PASS")
    else:
        print("❌ Supplier name extraction: FAIL")
    
    # Test items
    items = extract_itemized_list(sample_text)
    print(f"\nItems extracted: {len(items)} (Expected: 10)")
    if len(items) == 10:
        print("✅ Items extraction: PASS")
        print("First 3 items:")
        for i, item in enumerate(items[:3]):
            print(f"  {i+1}. {item['name']} - Qty: {item['quantity']}, Price: {item['unit_price']}, Amount: {item['amount']}")
    else:
        print("❌ Items extraction: FAIL")
        if items:
            print("Items found:")
            for item in items:
                print(f"  - {item}")
    
    # Test financial data
    subtotal = extract_subtotal(sample_text)
    print(f"\nSubtotal: {subtotal} (Expected: 164300)")
    if subtotal == 164300:
        print("✅ Subtotal extraction: PASS")
    else:
        print("❌ Subtotal extraction: FAIL")
    
    tax = extract_tax_amount(sample_text)
    print(f"Tax: {tax} (Expected: 18256)")
    if tax == 18256:
        print("✅ Tax extraction: PASS")
    else:
        print("❌ Tax extraction: FAIL")
    
    vat = extract_vat_amount(sample_text)
    print(f"VAT: {vat} (Expected: 27383)")
    if vat == 27383:
        print("✅ VAT extraction: PASS")
    else:
        print("❌ VAT extraction: FAIL")
    
    total = extract_total_amount(sample_text)
    print(f"Total: {total} (Expected: 209939)")
    if total == 209939:
        print("✅ Total extraction: PASS")
    else:
        print("❌ Total extraction: FAIL")
    
    print("\n" + "=" * 50)
    print("ANALYSIS COMPLETE")
    print("=" * 50)

if __name__ == "__main__":
    test_extraction_functions()