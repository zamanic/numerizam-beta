#!/usr/bin/env python3
"""
Comprehensive test script for OCR extraction improvements - Direct Pattern Testing
"""

import re

# Complete sample invoice content based on the provided images
sample_invoice = """
EQMS

Invoice

Bill No. : EQMS/NEPCS/2024-01    Date : 18/12/2024
                                 WO No: NEPCS-M3-AP-018-2024-036

Company Name. : China Northeast Electric Power Engineering & Services Co. Ltd.

Address : Manama M.S. Toren (12th Floor), Plot: Ga/99/3/A/B, Middle
          Badda, Badda, Dhaka-1212

Project Name : SFL Unique Nebras Meghmaghat Power PLC, 584 Mw Gas Fired
               Combined Cycle Power Project

| SL | Name of Item           | Quantity | Unit Price (BDT) | Amount (BDT) |
|----|------------------------|----------|------------------|---------------|
| 1  | Ambient Air Quality    | 5        | 10000           | 50000        |
| 2  | Noise Level Monitoring | 6        | 3500            | 21000        |
| 3  | Surface Water          | 2        | 6200            | 12400        |
| 4  | Waste Water           | 2        | 6000            | 12000        |
| 5  | Indoor Air Quality     | 1        | 7000            | 7000         |
| 6  | STP Water             | 1        | 6400            | 6400         |
| 7  | ETP Water             | 1        | 30000           | 30000        |
| 8  | Storm Water           | 1        | 7500            | 7500         |
| 9  | Soil Quality          | 1        | 15000           | 15000        |
| 10 | Occupational Noise    | 1        | 3000            | 3000         |
|    |                       |          | Sub Total       | 1,64,300     |
|    |                       |          | Tax 10%         | 18,256       |
|    |                       |          | Vat 15%         | 27,383       |
|    |                       |          | Gross Grand     | 2,09,939     |
|    |                       |          | Total           |              |

In Words : BDT Two Lakhs Nine Thousand Nine Hundred and Thirty Nine Taka only.

Bank Details : A/C Name: EQMS Consulting Limited
               A/C Number: 0201220001299
               Al-Arafah Islami Bank Limited, Banani Branch
               Routing Number: 015260435

Tauhidul Hasan
Executive Director

EQMS Consulting Limited
2nd & 3rd Floor, House#53, Road#4, Block # C, Banani, Dhaka-1213, Bangladesh
Phone: +88-02488107889-90, Mobile: +88-01911702074, E-Mail: info@eqmsbd.com, eqmsbd@gmail.com,
Web: www.eqms.com.bd
"""

# Direct extraction functions (copied from dots_ocr_service.py patterns)
def extract_supplier_name_test(md_content):
    """Extract supplier name using improved patterns"""
    lines = md_content.split('\n')
    
    # Look for company name in first 10 lines
    for i, line in enumerate(lines[:10]):
        line = line.strip()
        if len(line) > 10 and any(keyword in line.lower() for keyword in ['company', 'ltd', 'limited', 'corp', 'inc']):
            # Clean up the line
            cleaned = re.sub(r'^[^a-zA-Z]*', '', line)  # Remove leading non-letters
            if len(cleaned) > 5:
                return cleaned
    
    # Fallback patterns
    company_patterns = [
        r'(?i)Company\s*Name\.?\s*:?\s*([^\n]+)',
        r'(?i)(?:company|firm|organization)\s*:?\s*([^\n]+)',
        r'([A-Z][a-zA-Z\s&]+(?:Ltd|Limited|Corp|Inc|Co\.|Company)[^\n]*)',
    ]
    
    for pattern in company_patterns:
        match = re.search(pattern, md_content)
        if match:
            return match.group(1).strip()
    
    return ""

def extract_supplier_address_test(md_content):
    """Extract supplier address"""
    address_patterns = [
        r'(?i)Address\s*:\s*([^\n]+)',  # Exact match for "Address :"
        r'(?i)(?:address|addr)\s*:?\s*([^\n]+(?:\n[^\n]*){0,3})',
        r'(?i)([^\n]*\d+[^\n]*(?:street|st|avenue|ave|road|rd|lane|ln|drive|dr|blvd|boulevard|floor|plot)[^\n]*)',
        r'(?i)([^\n]*(?:street|st|avenue|ave|road|rd|lane|ln|drive|dr|blvd|boulevard|floor|plot)[^\n]*\d+[^\n]*)',
    ]
    
    for pattern in address_patterns:
        match = re.search(pattern, md_content, re.MULTILINE)
        if match:
            address = match.group(1).strip()
            if len(address) > 10:  # Only return substantial addresses
                return address
    
    return ""

def extract_supplier_email_test(md_content):
    """Extract supplier email address"""
    email_patterns = [
        r'(?i)(?:email|e-mail|mail)\s*:?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})',
        r'([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})',
        r'(?i)contact\s*:?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})'  # Look for contact email
    ]
    
    for pattern in email_patterns:
        match = re.search(pattern, md_content)
        if match:
            return match.group(1).strip()
    
    return ""

def extract_itemized_list_test(md_content):
    """Extract itemized list from markdown table"""
    items = []
    
    # Look for markdown table format
    table_pattern = r'\|\s*(\d+)\s*\|\s*([^|]+)\s*\|\s*(\d+)\s*\|\s*([\d,]+)\s*\|\s*([\d,]+)\s*\|'
    matches = re.findall(table_pattern, md_content)
    
    for match in matches:
        sl_no, name, quantity, unit_price, amount = match
        items.append({
            'sl_no': sl_no.strip(),
            'name': name.strip(),
            'quantity': quantity.strip(),
            'unit_price': unit_price.strip(),
            'amount': amount.strip()
        })
    
    return items

def extract_subtotal_test(md_content):
    """Extract subtotal amount"""
    subtotal_patterns = [
        r'(?i)Sub\s*Total\s*[|\s]*([\d,]+)',
        r'(?i)subtotal\s*:?\s*([\d,]+)',
        r'(?i)sub-total\s*:?\s*([\d,]+)'
    ]
    
    for pattern in subtotal_patterns:
        match = re.search(pattern, md_content)
        if match:
            return match.group(1).strip()
    
    return ""

def extract_tax_amount_test(md_content):
    """Extract tax amount"""
    tax_patterns = [
        r'(?i)Tax\s*\d+%\s*[|\s]*([\d,]+)',
        r'(?i)tax\s*:?\s*([\d,]+)',
        r'(?i)tax\s*\(?\d+%\)?\s*:?\s*([\d,]+)'
    ]
    
    for pattern in tax_patterns:
        match = re.search(pattern, md_content)
        if match:
            return match.group(1).strip()
    
    return ""

def extract_vat_amount_test(md_content):
    """Extract VAT amount"""
    vat_patterns = [
        r'(?i)Vat\s*\d+%\s*[|\s]*([\d,]+)',
        r'(?i)vat\s*:?\s*([\d,]+)',
        r'(?i)vat\s*\(?\d+%\)?\s*:?\s*([\d,]+)'
    ]
    
    for pattern in vat_patterns:
        match = re.search(pattern, md_content)
        if match:
            return match.group(1).strip()
    
    return ""

def extract_total_test(md_content):
    """Extract total amount"""
    total_patterns = [
        r'(?i)Gross\s*Grand\s*[|\s]*([\d,]+)',
        r'(?i)grand\s*total\s*:?\s*([\d,]+)',
        r'(?i)total\s*amount\s*:?\s*([\d,]+)',
        r'(?i)final\s*total\s*:?\s*([\d,]+)'
    ]
    
    for pattern in total_patterns:
        match = re.search(pattern, md_content)
        if match:
            return match.group(1).strip()
    
    return ""

def extract_bank_details_test(md_content):
    """Extract bank details"""
    bank_patterns = [
        r'(?i)Bank\s*Details\s*:?\s*([^\n]+(?:\n[^\n]*){0,5})',
        r'(?i)A/C\s*Name\s*:?\s*([^\n]+)',
        r'(?i)A/C\s*Number\s*:?\s*([^\n]+)',
        r'(?i)(?:bank\s*name|routing\s*number)\s*:?\s*([^\n]+)'
    ]
    
    bank_info = []
    for pattern in bank_patterns:
        matches = re.findall(pattern, md_content, re.MULTILINE)
        for match in matches:
            if isinstance(match, tuple):
                bank_info.extend([m.strip() for m in match if m.strip()])
            else:
                bank_info.append(match.strip())
    
    return ' | '.join(bank_info) if bank_info else ""

def extract_invoice_number_test(md_content):
    """Extract invoice number"""
    invoice_patterns = [
        r'(?i)Bill\s*No\.?\s*:?\s*([^\n\s]+)',
        r'(?i)Invoice\s*(?:No|Number)\.?\s*:?\s*([^\n\s]+)',
        r'(?i)(?:invoice|bill)\s*#\s*([^\n\s]+)'
    ]
    
    for pattern in invoice_patterns:
        match = re.search(pattern, md_content)
        if match:
            return match.group(1).strip()
    
    return ""

def extract_date_test(md_content):
    """Extract date"""
    date_patterns = [
        r'(?i)Date\s*:?\s*([0-9]{1,2}/[0-9]{1,2}/[0-9]{4})',
        r'(?i)Date\s*:?\s*([0-9]{1,2}-[0-9]{1,2}-[0-9]{4})',
        r'([0-9]{1,2}/[0-9]{1,2}/[0-9]{4})',
        r'([0-9]{1,2}-[0-9]{1,2}-[0-9]{4})'
    ]
    
    for pattern in date_patterns:
        match = re.search(pattern, md_content)
        if match:
            return match.group(1).strip()
    
    return ""

def test_extraction_functions():
    """Test all extraction functions"""
    print("=== Comprehensive OCR Extraction Test ===")
    print()
    
    # Test all extraction functions
    results = {
        'supplier_name': extract_supplier_name_test(sample_invoice),
        'supplier_address': extract_supplier_address_test(sample_invoice),
        'supplier_email': extract_supplier_email_test(sample_invoice),
        'invoice_number': extract_invoice_number_test(sample_invoice),
        'date': extract_date_test(sample_invoice),
        'items': extract_itemized_list_test(sample_invoice),
        'subtotal': extract_subtotal_test(sample_invoice),
        'tax': extract_tax_amount_test(sample_invoice),
        'vat': extract_vat_amount_test(sample_invoice),
        'total': extract_total_test(sample_invoice),
        'bank_details': extract_bank_details_test(sample_invoice)
    }
    
    # Display results
    print("1. Extraction Results:")
    for field, value in results.items():
        if field == 'items':
            print(f"   {field}: {len(value)} items extracted")
            if value:
                print(f"      Sample: {value[0]}")
        else:
            print(f"   {field}: '{value}'")
    print()
    
    # Expected values for validation
    expected = {
        'supplier_name': 'China Northeast Electric Power Engineering & Services Co. Ltd.',
        'supplier_address': 'Manama M.S. Toren',
        'supplier_email': 'info@eqmsbd.com',
        'invoice_number': 'EQMS/NEPCS/2024-01',
        'date': '18/12/2024',
        'items_count': 10,
        'subtotal': '1,64,300',
        'tax': '18,256',
        'vat': '27,383',
        'total': '2,09,939'
    }
    
    # Validation
    print("2. Validation Results:")
    passed = 0
    total = len(expected)
    
    for field, expected_val in expected.items():
        if field == 'items_count':
            actual = len(results['items'])
            success = actual == expected_val
        else:
            actual = results[field.replace('_count', '')]
            success = str(expected_val).lower() in str(actual).lower() if actual else False
        
        status = "✓ PASS" if success else "✗ FAIL"
        print(f"   {status} {field}: Expected '{expected_val}', Got '{actual}'")
        
        if success:
            passed += 1
    
    print(f"\n=== Summary ===")
    print(f"Validation: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    
    # Additional insights
    print(f"\n=== Additional Analysis ===")
    print(f"Bank Details Found: {'Yes' if results['bank_details'] else 'No'}")
    if results['bank_details']:
        print(f"Bank Info: {results['bank_details'][:100]}...")
    
    print(f"Items Extracted: {len(results['items'])}")
    if results['items']:
        print(f"First Item: {results['items'][0]}")
        print(f"Last Item: {results['items'][-1]}")
    
    return passed, total

if __name__ == "__main__":
    test_extraction_functions()