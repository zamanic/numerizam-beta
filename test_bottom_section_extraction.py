#!/usr/bin/env python3
"""
Test script to validate OCR extraction specifically for the bottom section of the PDF
that includes bank details, signatures, and company information.
"""

import re
import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Sample bottom section of the PDF as provided by user
bottom_section_text = """
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

In Words : BDT Two Lakhs Nine Thousand Nine Hundred and Thirty Nine Taka only.

Bank Details : A/C Name: EQMS Consulting Limited
               A/C Number: 0201220001299
               Al-Arafah Islami Bank Limited, Banani Branch
               Routing Number: 015260435

Tauhidul Hasan
Executive Director

EQMS Consulting Limited
2nd & 3rd Floor, House#53, Road#4, Block # C, Banani, Dhaka-1213, Bangladesh
Phone: +88-024881078890, Mobile: +88-01911702074, E-Mail: info@eqmsbd.com, eqmsbd@gmail.com,
Web: www.eqmsbd.com
"""

def extract_itemized_list_test(md_content):
    """Test itemized list extraction from bottom section"""
    import re
    
    items = []
    
    # Enhanced markdown table pattern - more flexible spacing
    table_patterns = [
        r'\|\s*(\d+)\s*\|\s*([^|]+)\s*\|\s*(\d+)\s*\|\s*([\d,]+)\s*\|\s*([\d,]+)\s*\|',
        r'(\d+)\s+([A-Za-z][^\d]+?)\s+(\d+)\s+([\d,]+)\s+([\d,]+)',  # Space-separated format
    ]
    
    for pattern in table_patterns:
        matches = re.findall(pattern, md_content)
        if matches:
            for match in matches:
                sl_no, name, quantity, unit_price, amount = match
                # Skip header rows and summary rows
                if not any(word in name.lower() for word in ['name', 'item', 'total', 'sub', 'tax', 'vat', 'grand']):
                    items.append({
                        'sl_no': sl_no.strip(),
                        'name': name.strip(),
                        'quantity': quantity.strip(),
                        'unit_price': unit_price.strip(),
                        'amount': amount.strip()
                    })
            break  # Use first successful pattern
    
    return items

def extract_financial_totals_test(md_content):
    """Test financial totals extraction"""
    import re
    
    # Extract subtotal, tax, VAT, and grand total
    subtotal_match = re.search(r'Sub\s*Total[\s|]*([\d,]+)', md_content, re.IGNORECASE)
    tax_match = re.search(r'Tax\s*\d+%[\s|]*([\d,]+)', md_content, re.IGNORECASE)
    vat_match = re.search(r'Vat\s*\d+%[\s|]*([\d,]+)', md_content, re.IGNORECASE)
    total_match = re.search(r'(?:Gross\s*)?Grand\s*Total[\s|]*([\d,]+)', md_content, re.IGNORECASE)
    
    return {
        'subtotal': subtotal_match.group(1) if subtotal_match else '',
        'tax': tax_match.group(1) if tax_match else '',
        'vat': vat_match.group(1) if vat_match else '',
        'total': total_match.group(1) if total_match else ''
    }

def extract_bank_details_test(md_content):
    """Test bank details extraction"""
    import re
    
    bank_info = []
    
    # Look for bank details section
    bank_section = re.search(r'Bank\s*Details\s*:([^\n]*(?:\n[^\n]*)*?)(?=\n\n|\n[A-Z]|$)', md_content, re.IGNORECASE | re.DOTALL)
    
    if bank_section:
        bank_text = bank_section.group(1)
        
        # Extract account name
        ac_name_match = re.search(r'A/C\s*Name\s*:?\s*([^\n]+)', bank_text, re.IGNORECASE)
        if ac_name_match:
            bank_info.append(f"A/C Name: {ac_name_match.group(1).strip()}")
        
        # Extract account number
        ac_number_match = re.search(r'A/C\s*Number\s*:?\s*([^\n]+)', bank_text, re.IGNORECASE)
        if ac_number_match:
            bank_info.append(f"A/C Number: {ac_number_match.group(1).strip()}")
        
        # Extract bank name
        bank_name_match = re.search(r'([A-Za-z\s]+Bank[^\n]*)', bank_text, re.IGNORECASE)
        if bank_name_match:
            bank_info.append(bank_name_match.group(1).strip())
        
        # Extract routing number
        routing_match = re.search(r'Routing\s*Number\s*:?\s*([^\n]+)', bank_text, re.IGNORECASE)
        if routing_match:
            bank_info.append(f"Routing Number: {routing_match.group(1).strip()}")
    
    return ' | '.join(bank_info) if bank_info else ''

def extract_amount_in_words_test(md_content):
    """Test amount in words extraction"""
    import re
    
    words_match = re.search(r'In\s*Words\s*:?\s*([^\n]+)', md_content, re.IGNORECASE)
    return words_match.group(1).strip() if words_match else ''

def extract_signature_info_test(md_content):
    """Test signature and executive info extraction"""
    import re
    
    # Look for executive director info
    exec_match = re.search(r'([A-Za-z\s]+)\s*\n\s*Executive\s*Director', md_content, re.IGNORECASE)
    exec_name = exec_match.group(1).strip() if exec_match else ''
    
    return exec_name

def run_bottom_section_tests():
    """Run all bottom section extraction tests"""
    print("=== Bottom Section OCR Extraction Test ===")
    print()
    
    # Test itemized list extraction
    print("1. Testing Itemized List Extraction:")
    items = extract_itemized_list_test(bottom_section_text)
    print(f"   Items found: {len(items)}")
    if items:
        print(f"   First item: {items[0]}")
        print(f"   Last item: {items[-1]}")
    print()
    
    # Test financial totals
    print("2. Testing Financial Totals Extraction:")
    totals = extract_financial_totals_test(bottom_section_text)
    print(f"   Subtotal: {totals['subtotal']}")
    print(f"   Tax: {totals['tax']}")
    print(f"   VAT: {totals['vat']}")
    print(f"   Grand Total: {totals['total']}")
    print()
    
    # Test bank details
    print("3. Testing Bank Details Extraction:")
    bank_details = extract_bank_details_test(bottom_section_text)
    print(f"   Bank Details: {bank_details}")
    print()
    
    # Test amount in words
    print("4. Testing Amount in Words Extraction:")
    amount_words = extract_amount_in_words_test(bottom_section_text)
    print(f"   Amount in Words: {amount_words}")
    print()
    
    # Test signature info
    print("5. Testing Signature Info Extraction:")
    signature_info = extract_signature_info_test(bottom_section_text)
    print(f"   Executive Director: {signature_info}")
    print()
    
    # Validation
    print("=== Validation Results ===")
    tests_passed = 0
    total_tests = 0
    
    # Validate items count
    total_tests += 1
    if len(items) == 9:  # Items 2-10 from the table
        print("   ✓ PASS: Items count (9 items extracted)")
        tests_passed += 1
    else:
        print(f"   ✗ FAIL: Items count (expected 9, got {len(items)})")
    
    # Validate financial totals
    expected_totals = {'subtotal': '1,64,300', 'tax': '18,256', 'vat': '27,383', 'total': '2,09,939'}
    for key, expected in expected_totals.items():
        total_tests += 1
        if totals[key] == expected:
            print(f"   ✓ PASS: {key.capitalize()} ({expected})")
            tests_passed += 1
        else:
            print(f"   ✗ FAIL: {key.capitalize()} (expected {expected}, got {totals[key]})")
    
    # Validate bank details
    total_tests += 1
    if 'EQMS Consulting Limited' in bank_details and '0201220001299' in bank_details:
        print("   ✓ PASS: Bank details contain account name and number")
        tests_passed += 1
    else:
        print("   ✗ FAIL: Bank details missing key information")
    
    # Validate amount in words
    total_tests += 1
    if 'Two Lakhs Nine Thousand' in amount_words:
        print("   ✓ PASS: Amount in words extracted correctly")
        tests_passed += 1
    else:
        print("   ✗ FAIL: Amount in words not extracted correctly")
    
    # Validate signature
    total_tests += 1
    if signature_info == 'Tauhidul Hasan':
        print("   ✓ PASS: Executive Director name extracted correctly")
        tests_passed += 1
    else:
        print(f"   ✗ FAIL: Executive Director (expected 'Tauhidul Hasan', got '{signature_info}')")
    
    print()
    print(f"=== Summary: {tests_passed}/{total_tests} tests passed ({tests_passed/total_tests*100:.1f}%) ===")
    
    return tests_passed == total_tests

if __name__ == "__main__":
    success = run_bottom_section_tests()
    sys.exit(0 if success else 1)