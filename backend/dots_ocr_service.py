#!/usr/bin/env python3
"""
Dots OCR Backend Service

A Flask-based service that integrates the dots.ocr library for document processing.
This service provides REST API endpoints for processing images and PDFs.
"""

import os
import sys
import json
import tempfile
import logging
import io
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from PIL import Image
import traceback
import fitz  # PyMuPDF for PDF processing

# Import the DotsOCR parser
try:
    # Add dots.ocr to path
    import sys
    from pathlib import Path
    dots_ocr_path = Path(__file__).parent.parent / "dots.ocr"
    sys.path.insert(0, str(dots_ocr_path))
    
    from dots_ocr.parser import DotsOCRParser
    from dots_ocr.utils.consts import MIN_PIXELS, MAX_PIXELS
except ImportError as e:
    print(f"Error importing dots.ocr: {e}")
    print("Please ensure dots.ocr is properly installed")
    sys.exit(1)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Configuration
CONFIG = {
    'UPLOAD_FOLDER': tempfile.gettempdir(),
    'MAX_CONTENT_LENGTH': 16 * 1024 * 1024,  # 16MB max file size
    'ALLOWED_EXTENSIONS': {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'pdf'},
    'DOTS_OCR_IP': '127.0.0.1',
    'DOTS_OCR_PORT': 8000,
    'MIN_PIXELS': MIN_PIXELS,
    'MAX_PIXELS': 1 * 1024 * 1024,  # 1M pixels (e.g., 1024x1024)
    'MAX_IMAGE_SIZE': (1024, 1024)  # Maximum width/height in pixels
}

app.config.update(CONFIG)

# Initialize DotsOCR Parser
dots_parser = None
model_available = False

def initialize_dots_parser():
    """Initialize DotsOCR Parser with proper error handling"""
    global dots_parser, model_available
    
    # Check if model weights exist
    model_path = os.path.join(os.path.dirname(__file__), '..', 'dots.ocr', 'weights', 'DotsOCR')
    if not os.path.exists(model_path):
        logger.warning(f"Model weights not found at {model_path}")
        logger.info("Please run: python dots.ocr/tools/download_model.py --type huggingface --name rednote-hilab/dots.ocr")
        return False
    
    try:
        # Change to the dots.ocr directory so it can find the weights
        original_cwd = os.getcwd()
        dots_ocr_dir = os.path.join(os.path.dirname(__file__), '..', 'dots.ocr')
        os.chdir(dots_ocr_dir)
        
        # Initialize with the modified parser that doesn't use flash attention
        try:
            dots_parser = DotsOCRParser(
                ip=CONFIG['DOTS_OCR_IP'],
                port=CONFIG['DOTS_OCR_PORT'],
                dpi=200,
                min_pixels=CONFIG['MIN_PIXELS'],
                max_pixels=CONFIG['MAX_PIXELS'],
                use_hf=True  # Use HuggingFace model for local processing
            )
        except Exception as init_error:
            logger.warning(f"Failed to initialize DotsOCR parser: {init_error}")
            raise init_error
        
        # Change back to original directory
        os.chdir(original_cwd)
        logger.info("DotsOCR Parser initialized successfully")
        model_available = True
        return True
    except Exception as e:
        logger.error(f"Failed to initialize DotsOCR Parser: {e}")
        dots_parser = None
        model_available = False
        return False

# Try to initialize on startup
initialize_dots_parser()

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def preprocess_image(image_path, max_size=(1024, 1024)):
    """Preprocess image to ensure it doesn't exceed memory limits"""
    try:
        with Image.open(image_path) as img:
            # Convert to RGB if necessary
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Calculate current pixels
            current_pixels = img.width * img.height
            max_pixels = max_size[0] * max_size[1]
            
            # Resize if image is too large
            if current_pixels > max_pixels:
                # Calculate scaling factor to fit within max_pixels
                scale_factor = (max_pixels / current_pixels) ** 0.5
                new_width = int(img.width * scale_factor)
                new_height = int(img.height * scale_factor)
                
                logger.info(f"Resizing image from {img.width}x{img.height} to {new_width}x{new_height}")
                img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            
            # Save the processed image
            img.save(image_path, 'PNG', optimize=True)
            logger.info(f"Image preprocessed: {img.width}x{img.height} pixels")
            
    except Exception as e:
        logger.error(f"Error preprocessing image: {e}")
        raise e

def preprocess_pdf(pdf_path, max_size=(1024, 1024), max_dpi=100):
    """Preprocess PDF to prevent memory issues by converting to image with size limits"""
    try:
        # Open PDF
        doc = fitz.open(pdf_path)
        
        if len(doc) == 0:
            raise ValueError("PDF has no pages")
        
        # Process first page only to prevent memory issues
        page = doc[0]
        
        # Calculate appropriate DPI to stay within memory limits
        page_rect = page.rect
        page_width = page_rect.width
        page_height = page_rect.height
        
        # Calculate DPI that would result in max_size dimensions
        dpi_for_width = (max_size[0] * 72) / page_width
        dpi_for_height = (max_size[1] * 72) / page_height
        target_dpi = min(dpi_for_width, dpi_for_height, max_dpi)
        
        logger.info(f"Converting PDF page to image at {target_dpi:.1f} DPI")
        
        # Convert to image
        mat = fitz.Matrix(target_dpi / 72, target_dpi / 72)
        pix = page.get_pixmap(matrix=mat)
        
        # Convert to PIL Image
        img_data = pix.tobytes("png")
        img = Image.open(io.BytesIO(img_data))
        
        # Save as PNG
        img.save(pdf_path.replace('.pdf', '_processed.png'), 'PNG', optimize=True)
        doc.close()
        
        logger.info(f"PDF converted to image: {img.width}x{img.height} pixels")
        return pdf_path.replace('.pdf', '_processed.png')
        
    except Exception as e:
        logger.error(f"Error preprocessing PDF: {e}")
        raise e

def process_ocr_result(result_data, filename, file_size):
    """Convert dots.ocr result to our expected format"""
    try:
        # Debug: Log the raw result_data
        logger.info(f"🔍 Raw result_data for {filename}: {result_data}")
        logger.info(f"🔍 Result_data keys: {list(result_data.keys()) if isinstance(result_data, dict) else 'Not a dict'}")
        
        # Handle dots.ocr result format (list of page results)
        if isinstance(result_data, list) and len(result_data) > 0:
            page_result = result_data[0]  # Get first page
            
            # Read markdown content from the generated file
            md_content = ""
            layout_info = {}
            
            if 'md_content_path' in page_result:
                try:
                    with open(page_result['md_content_path'], 'r', encoding='utf-8') as f:
                        md_content = f.read()
                    logger.info(f"🔍 Read markdown content: {md_content[:200]}...")
                except Exception as e:
                    logger.error(f"Error reading markdown content: {e}")
            
            if 'layout_info_path' in page_result:
                try:
                    import json
                    with open(page_result['layout_info_path'], 'r', encoding='utf-8') as f:
                        layout_info = json.load(f)
                    logger.info(f"🔍 Read layout info keys: {list(layout_info.keys()) if isinstance(layout_info, dict) else 'Not a dict'}")
                except Exception as e:
                    logger.error(f"Error reading layout info: {e}")
            
            # Extract comprehensive data from markdown content and layout info
            comprehensive_data = extract_comprehensive_data(md_content, layout_info)
            
            processed_result = {
                'success': True,
                'text': md_content,
                'data': {
                    # Supplier Information
                    'supplier_name': comprehensive_data['supplier_name'],
                    'supplier_address': comprehensive_data['supplier_address'],
                    'supplier_email': comprehensive_data['supplier_email'],
                    'supplier_bank_details': comprehensive_data['supplier_bank_details'],
                    
                    # Document Information
                    'document_title': comprehensive_data['document_title'],
                    'invoice_number': comprehensive_data['invoice_number'],
                    'date': comprehensive_data['date'],
                    'work_order_number': comprehensive_data['work_order_number'],
                    'purchase_order_number': comprehensive_data['purchase_order_number'],
                    
                    # NEPCS Company Information
                    'nepcs_company_name': comprehensive_data['nepcs_company_name'],
                    'nepcs_address': comprehensive_data['nepcs_address'],
                    'project_name': comprehensive_data['project_name'],
                    
                    # Financial Information
                    'items': comprehensive_data['items'],
                    'subtotal': comprehensive_data['subtotal'],
                    'tax_amount': comprehensive_data['tax_amount'],
                    'vat_amount': comprehensive_data['vat_amount'],
                    'total_amount': comprehensive_data['total_amount'],
                    
                    # Legacy fields for backward compatibility
                    'vendor': comprehensive_data['supplier_name'],
                    'total': str(comprehensive_data['total_amount']),
                    'invoiceNumber': comprehensive_data['invoice_number'],
                    'currency': comprehensive_data['currency'],
                    'confidence': comprehensive_data['confidence']
                },
                'stage': 'complete',
                'progress': 100,
                'metadata': {
                    'fileName': filename,
                    'fileSize': file_size,
                    'processedWith': 'dots.ocr',
                    'processingTime': 0
                }
            }
            
            logger.info(f"🔍 Processed result for {filename}: {processed_result}")
            logger.info(f"🔍 Processed result type: {type(processed_result)}")
            return processed_result
    except Exception as e:
        logger.error(f"Error processing OCR result: {e}")
        logger.error(f"🔍 Exception details: {str(e)}")
        return {
            'success': False,
            'error': f'Failed to process OCR result: {str(e)}',
            'stage': 'error'
        }

def extract_comprehensive_data(md_content, layout_info):
    """Extract comprehensive invoice data including all required fields"""
    import re
    from datetime import datetime
    
    data = {
        # Supplier Information
        'supplier_name': extract_supplier_name(md_content),
        'supplier_address': extract_supplier_address(md_content),
        'supplier_email': extract_supplier_email(md_content),
        'supplier_bank_details': extract_bank_details(md_content),
        
        # Buyer Information
        'buyer_name': extract_buyer_name(md_content),
        'buyer_address': extract_buyer_address(md_content),
        
        # Document Information
        'document_title': extract_document_title(md_content),
        'invoice_number': extract_invoice_number_enhanced(md_content),
        'date': extract_date_enhanced(md_content),
        'work_order_number': extract_work_order(md_content),
        'purchase_order_number': extract_purchase_order(md_content),
        
        # NEPCS Company Information
        'nepcs_company_name': extract_nepcs_company(md_content),
        'nepcs_address': extract_nepcs_address(md_content),
        'project_name': extract_project_name(md_content),
        
        # Buyer Information
        'buyer_name': extract_buyer_name(md_content),
        'buyer_address': extract_buyer_address(md_content),
        
        # Financial Information
        'items': extract_itemized_list(md_content),
        'subtotal': extract_subtotal(md_content),
        'tax_amount': extract_tax_amount(md_content),
        'vat_amount': extract_vat_amount(md_content),
        'total_amount': extract_total_enhanced(md_content),
        
        # Currency and confidence
        'currency': extract_currency(md_content),
        'confidence': calculate_comprehensive_confidence(md_content)
    }
    
    return data

def extract_supplier_name(md_content):
    """Extract supplier company name from header or logo area"""
    import re
    
    # Primary pattern for "Company Name. :" format
    company_patterns = [
        r'(?i)Company\s*Name\.?\s*:?\s*([^\n]+)',
        r'(?i)(?:company|firm|organization)\s*:?\s*([^\n]+)',
        r'([A-Z][a-zA-Z\s&]+(?:Ltd|Limited|Corp|Inc|Co\.|Company)[^\n]*)',
    ]
    
    for pattern in company_patterns:
        match = re.search(pattern, md_content)
        if match:
            name = match.group(1).strip()
            # Clean up common prefixes
            name = re.sub(r'^[^a-zA-Z]*', '', name)
            if len(name) > 5:
                return name
    
    # Fallback: Look for company name in first 10 lines
    lines = md_content.split('\n')[:8]  # Check first 8 lines
    
    for line in lines:
        line = line.strip()
        if len(line) > 10 and any(keyword in line.lower() for keyword in ['company', 'ltd', 'limited', 'corp', 'inc']):
            # Clean up the line
            cleaned = re.sub(r'^[^a-zA-Z]*', '', line)  # Remove leading non-letters
            if len(cleaned) > 5:
                return cleaned
    
    return ""

def extract_supplier_address(md_content):
    """Extract supplier address"""
    import re
    
    # Look for address patterns, especially after "Address :"
    address_patterns = [
        r'(?i)Address\s*:\s*([^\n]+)',  # Exact match for "Address :"
        r'(?i)(?:address|addr):\s*([^\n]+(?:\n[^\n]+)*?)(?:\n\n|\nPhone|\nEmail|$)',
        r'(?i)([^\n]*\d+[^\n]*(?:street|st|avenue|ave|road|rd|lane|ln|drive|dr|blvd|boulevard|floor|plot)[^\n]*)',
        r'(?i)([^\n]*(?:street|st|avenue|ave|road|rd|lane|ln|drive|dr|blvd|boulevard|floor|plot)[^\n]*\d+[^\n]*)',
        r'([^\n]*\d{5,6}[^\n]*)'  # Postal code pattern
    ]
    
    for pattern in address_patterns:
        match = re.search(pattern, md_content, re.MULTILINE | re.DOTALL)
        if match:
            address = match.group(1).strip().replace('\n', ', ')
            # Clean up the address
            if len(address) > 10:  # Only return substantial addresses
                return address
    
    return ""

def extract_supplier_email(md_content):
    """Extract supplier email"""
    import re
    
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

def extract_bank_details(md_content):
    """Extract bank details"""
    import re
    
    bank_patterns = [
        r'(?i)(?:bank|account)\s*(?:details?|info|information)\s*:?\s*([^\n]+(?:\n[^\n]*){0,5})',
        r'(?i)(?:account\s*(?:no|number)|routing|swift|iban)\s*:?\s*([A-Z0-9-]+)',
        r'(?i)bank\s*name\s*:?\s*([^\n]+)',  # Bank name
        r'(?i)account\s*holder\s*:?\s*([^\n]+)',  # Account holder
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

def extract_document_title(md_content):
    """Extract document title (Invoice, Bill, etc.)"""
    import re
    
    title_patterns = [
        r'(?i)^(invoice|bill|receipt|statement)\s*(?:#|no\.?|number)?',
        r'(?i)(invoice|bill|receipt|statement)'
    ]
    
    for pattern in title_patterns:
        match = re.search(pattern, md_content, re.MULTILINE)
        if match:
            return match.group(1).title()
    
    return "Invoice"

def extract_invoice_number_enhanced(md_content):
    """Enhanced invoice number extraction"""
    import re
    
    patterns = [
        r'(?i)(?:invoice|bill)\s*(?:#|no\.?|number)\s*:?\s*([A-Z0-9-]+)',
        r'(?i)(?:#|no\.?)\s*([A-Z0-9-]{3,20})',
        r'(?i)INV[-#]?([0-9A-Z-]+)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, md_content)
        if match:
            return match.group(1).strip()
    
    return ""

def extract_date_enhanced(md_content):
    """Enhanced date extraction with dd-mm-yyyy format"""
    import re
    from datetime import datetime
    
    date_patterns = [
        r'(?i)(?:date|dated)\s*:?\s*(\d{1,2}[-/]\d{1,2}[-/]\d{4})',
        r'(\d{1,2}[-/]\d{1,2}[-/]\d{4})',
        r'(\d{4}[-/]\d{1,2}[-/]\d{1,2})'
    ]
    
    for pattern in date_patterns:
        match = re.search(pattern, md_content)
        if match:
            date_str = match.group(1)
            # Convert to dd-mm-yyyy format
            try:
                if '/' in date_str or '-' in date_str:
                    parts = re.split('[-/]', date_str)
                    if len(parts) == 3:
                        if len(parts[0]) == 4:  # yyyy-mm-dd format
                            return f"{parts[2]}-{parts[1]}-{parts[0]}"
                        else:  # dd-mm-yyyy or mm-dd-yyyy
                            return f"{parts[0]}-{parts[1]}-{parts[2]}"
            except:
                pass
            return date_str
    
    return datetime.now().strftime("%d-%m-%Y")

def extract_work_order(md_content):
    """Extract Work Order number"""
    import re
    
    patterns = [
        r'(?i)(?:work\s*order|wo)\s*(?:#|no\.?|number)?\s*:?\s*([A-Z0-9-]+)',
        r'(?i)WO[-#]?([0-9A-Z-]+)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, md_content)
        if match:
            return match.group(1).strip()
    
    return ""

def extract_purchase_order(md_content):
    """Extract Purchase Order number"""
    import re
    
    patterns = [
        r'(?i)(?:purchase\s*order|po)\s*(?:#|no\.?|number)?\s*:?\s*([A-Z0-9-]+)',
        r'(?i)PO[-#]?([0-9A-Z-]+)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, md_content)
        if match:
            return match.group(1).strip()
    
    return ""

def extract_nepcs_company(md_content):
    """Extract NEPCS company name"""
    import re
    
    nepcs_patterns = [
        r'(?i)(China\s+Northeast\s+Electric\s+Power\s+Engineering\s+&\s+Services\s+Co\.?,?\s*Ltd\.?)',
        r'(?i)(NEPCS)',
        r'(?i)(?:bill\s+to|client|customer):\s*([^\n]*(?:NEPCS|Northeast\s+Electric)[^\n]*)',
    ]
    
    for pattern in nepcs_patterns:
        match = re.search(pattern, md_content, re.MULTILINE)
        if match:
            return match.group(1).strip()
    
    return ""

def extract_nepcs_address(md_content):
    """Extract NEPCS company address"""
    import re
    
    # Look for address after NEPCS mention
    nepcs_section = re.search(r'(?i)(NEPCS|Northeast\s+Electric)([^\n]*(?:\n[^\n]*){0,5})', md_content, re.MULTILINE)
    if nepcs_section:
        section_text = nepcs_section.group(2)
        address_match = re.search(r'([^\n]*\d+[^\n]*)', section_text)
        if address_match:
            return address_match.group(1).strip()
    
    return ""

def extract_project_name(md_content):
    """Extract project name"""
    import re
    
    project_patterns = [
        r'(?i)(?:project|job)\s*(?:name|title)?\s*:?\s*([^\n]+)',
        r'(?i)(?:for|regarding)\s*:?\s*([^\n]+)',
    ]
    
    for pattern in project_patterns:
        match = re.search(pattern, md_content)
        if match:
            return match.group(1).strip()
    
    return ""

def extract_buyer_name(md_content):
    """Extract buyer/customer name"""
    import re
    
    buyer_patterns = [
        r'(?i)(?:bill\s*to|customer|buyer|client)\s*:?\s*([^\n]+)',
        r'(?i)(?:to|for)\s*:?\s*([^\n]+)',
        r'(?i)Company\s*Name\.?\s*:?\s*([^\n]+)',  # Look for "Company Name."
        r'(?i)(?:invoice\s*to|billed\s*to)\s*:?\s*([^\n]+)',
    ]
    
    for pattern in buyer_patterns:
        match = re.search(pattern, md_content)
        if match:
            name = match.group(1).strip()
            # Filter out common non-name patterns
            if len(name) > 3 and not re.match(r'^[0-9/-]+$', name):
                return name
    
    return ""

def extract_buyer_address(md_content):
    """Extract buyer/customer address"""
    import re
    
    # Look for address after buyer name patterns or specific address indicators
    buyer_address_patterns = [
        r'(?i)(?:bill\s*to|customer|buyer|client)\s*:?\s*[^\n]+\n\s*([^\n]+(?:\n[^\n]*){0,3})',
        r'(?i)(?:to|for)\s*:?\s*[^\n]+\n\s*([^\n]+(?:\n[^\n]*){0,3})',
        r'(?i)Company\s*Name\.?\s*:?\s*[^\n]+\n\s*Address\s*:?\s*([^\n]+)',  # After company name, look for address
        r'(?i)(?:invoice\s*to|billed\s*to)\s*:?\s*[^\n]+\n\s*([^\n]+(?:\n[^\n]*){0,2})',
    ]
    
    for pattern in buyer_address_patterns:
        match = re.search(pattern, md_content, re.MULTILINE)
        if match:
            address = match.group(1).strip()
            # Only return substantial addresses
            if len(address) > 10:
                return address
    
    return ""

def extract_itemized_list(md_content):
    """Extract itemized list with Sl.No, Name, Quantity, Unit Price, Amount"""
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
                        'sl_no': int(sl_no.strip()),
                        'name': name.strip(),
                        'quantity': int(quantity.strip().replace(',', '')),
                        'unit_price': float(unit_price.strip().replace(',', '')),
                        'amount': float(amount.strip().replace(',', ''))
                    })
            break  # Use first successful pattern
    
    # If no items found, try HTML table pattern
    if not items:
        html_pattern = r'<tr[^>]*>\s*<td[^>]*>(\d+)</td>\s*<td[^>]*>([^<]+)</td>\s*<td[^>]*>(\d+)</td>\s*<td[^>]*>([\d,]+)</td>\s*<td[^>]*>([\d,]+)</td>\s*</tr>'
        html_matches = re.findall(html_pattern, md_content, re.IGNORECASE)
        
        for match in html_matches:
            sl_no, name, quantity, unit_price, amount = match
            items.append({
                'sl_no': int(sl_no.strip()),
                'name': name.strip(),
                'quantity': int(quantity.strip().replace(',', '')),
                'unit_price': float(unit_price.strip().replace(',', '')),
                'amount': float(amount.strip().replace(',', ''))
            })
    
    return items

def extract_subtotal(md_content):
    """Extract subtotal amount"""
    import re
    
    patterns = [
        r'(?i)Sub Total\s*\|\s*([0-9,]+)',  # Exact match for "Sub Total |"
        r'(?i)(?:sub\s*total|subtotal)\s*:?\s*\$?([0-9,]+\.?[0-9]*)',
        r'(?i)\|\s*(?:sub\s*total|subtotal)\s*\|[^|]*\|\s*\$?([0-9,]+\.[0-9]{2})\s*\|'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, md_content, re.MULTILINE)
        if match:
            return float(match.group(1).replace(',', ''))
    
    return 0.0

def extract_tax_amount(md_content):
    """Extract tax amount"""
    import re
    
    patterns = [
        r'(?i)Tax \d+%\s*\|\s*([0-9,]+)',  # Exact match for "Tax 10% |"
        r'(?i)(?:tax|gst)\s*:?\s*\$?([0-9,]+\.?[0-9]*)',
        r'(?i)\|\s*(?:tax|gst)\s*\|[^|]*\|\s*\$?([0-9,]+\.[0-9]{2})\s*\|'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, md_content, re.MULTILINE)
        if match:
            return float(match.group(1).replace(',', ''))
    
    return 0.0

def extract_vat_amount(md_content):
    """Extract VAT amount"""
    import re
    
    patterns = [
        r'(?i)Vat \d+%\s*\|\s*([0-9,]+)',  # Exact match for "Vat 15% |"
        r'(?i)(?:vat|value\s*added\s*tax)\s*:?\s*\$?([0-9,]+\.?[0-9]*)',
        r'(?i)\|\s*(?:vat|value\s*added\s*tax)\s*\|[^|]*\|\s*\$?([0-9,]+\.[0-9]{2})\s*\|'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, md_content, re.MULTILINE)
        if match:
            return float(match.group(1).replace(',', ''))
    
    return 0.0

def extract_total_enhanced(md_content):
    """Enhanced total extraction"""
    import re
    
    patterns = [
        r'(?i)Gross Grand Total\s*\|\s*([0-9,]+)',  # Exact match for "Gross Grand Total |"
        r'(?i)(?:grand\s*total|total)\s*\|\s*([0-9,]+)',  # General total in table
        r'(?i)\|\s*total\s*\|[^|]*\|\s*\$?([0-9,]+\.?[0-9]*)\s*\|',
        r'(?i)<td>\s*total\s*</td>.*?<td>\s*\$?([0-9,]+\.[0-9]{2})\s*</td>',
        r'(?i)(?:total|grand\s*total|amount\s*due)\s*:?\s*\$?([0-9,]+\.?[0-9]*)',
        r'(?i)total.*?\$([0-9,]+\.[0-9]{2})'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, md_content, re.MULTILINE | re.DOTALL)
        if match:
            amount = match.group(1).replace(',', '')
            if float(amount) > 0:
                return float(amount)
    
    # Fallback to largest amount
    all_amounts = re.findall(r'\$([0-9,]+\.[0-9]{2})', md_content)
    if all_amounts:
        amounts = [float(amt.replace(',', '')) for amt in all_amounts]
        return max(amounts) if amounts else 0.0
    
    return 0.0

def extract_currency(md_content):
    """Extract currency symbol"""
    import re
    
    if '$' in md_content:
        return 'USD'
    elif '€' in md_content:
        return 'EUR'
    elif '£' in md_content:
        return 'GBP'
    elif '¥' in md_content:
        return 'JPY'
    
    return 'USD'  # Default

def extract_number(text):
    """Extract number from text"""
    import re
    match = re.search(r'([0-9,]+\.?[0-9]*)', str(text))
    return float(match.group(1).replace(',', '')) if match else 0

def extract_price(text):
    """Extract price from text"""
    import re
    match = re.search(r'\$?([0-9,]+\.[0-9]{2})', str(text))
    return float(match.group(1).replace(',', '')) if match else 0

def calculate_comprehensive_confidence(md_content):
    """Calculate confidence scores for all extracted fields"""
    confidence = {
        'supplier_name': 90 if extract_supplier_name(md_content) else 0,
        'supplier_address': 85 if extract_supplier_address(md_content) else 0,
        'invoice_number': 90 if extract_invoice_number_enhanced(md_content) else 0,
        'date': 95 if extract_date_enhanced(md_content) else 0,
        'total': 95 if extract_total_enhanced(md_content) > 0 else 0,
        'items': 80 if extract_itemized_list(md_content) else 0
    }
    return confidence

def extract_total_from_content(md_content, layout_info):
    """Extract total amount from markdown content"""
    import re
    
    # Look for total amount patterns - enhanced for table formats
    total_patterns = [
        # Table format: |Total|  |$123.00|
        r'(?i)\|\s*total\s*\|[^|]*\|\s*\$?([0-9,]+\.?[0-9]*)\s*\|',
        # HTML table format: <td>Total</td><td></td><td>$123.00</td>
        r'(?i)<td>\s*total\s*</td>.*?<td>\s*\$?([0-9,]+\.[0-9]{2})\s*</td>',
        # Standard patterns
        r'(?i)(?:total|amount\s+due|grand\s+total|balance\s+due):\s*\$?([0-9,]+\.?[0-9]*)',
        r'(?i)\$([0-9,]+\.[0-9]{2})(?:\s*$|\s+total)',
        r'(?i)([0-9,]+\.[0-9]{2})\s*(?:total|due|amount)',
        # Look for last monetary amount in table context
        r'(?i)total.*?\$([0-9,]+\.[0-9]{2})'
    ]
    
    for pattern in total_patterns:
        match = re.search(pattern, md_content, re.MULTILINE | re.DOTALL)
        if match:
            amount = match.group(1).replace(',', '')
            # Validate it's a reasonable amount (not 0.00)
            if float(amount) > 0:
                return amount
    
    # If no pattern matches, look for the largest monetary amount
    all_amounts = re.findall(r'\$([0-9,]+\.[0-9]{2})', md_content)
    if all_amounts:
        amounts = [float(amt.replace(',', '')) for amt in all_amounts]
        largest = max(amounts)
        if largest > 0:
            return f"{largest:.2f}"
    
    return "0.00"

def extract_date_from_content(md_content, layout_info):
    """Extract date information from markdown content"""
    import re
    from datetime import datetime
    
    # Look for date patterns
    date_patterns = [
        r'(?i)(?:date|invoice\s+date|bill\s+date):\s*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4})',
        r'([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4})',
        r'([0-9]{4}-[0-9]{1,2}-[0-9]{1,2})'
    ]
    
    for pattern in date_patterns:
        match = re.search(pattern, md_content)
        if match:
            date_str = match.group(1)
            try:
                # Try to parse and format the date
                if '/' in date_str:
                    parsed_date = datetime.strptime(date_str, '%m/%d/%Y')
                elif '-' in date_str and len(date_str.split('-')[0]) == 4:
                    parsed_date = datetime.strptime(date_str, '%Y-%m-%d')
                else:
                    parsed_date = datetime.strptime(date_str, '%m-%d-%Y')
                return parsed_date.strftime('%Y-%m-%d')
            except:
                return date_str
    
    return datetime.now().strftime('%Y-%m-%d')

def extract_invoice_number_from_content(md_content, layout_info):
    """Extract invoice number from markdown content"""
    import re
    from datetime import datetime
    
    # Look for invoice number patterns
    invoice_patterns = [
        r'(?i)(?:invoice\s+(?:number|#)|inv\s*#?):\s*([A-Z0-9-]+)',
        r'(?i)(?:invoice|inv)\s*[#:]?\s*([A-Z0-9-]{3,})',
        r'(?i)#([A-Z0-9-]{3,})'
    ]
    
    for pattern in invoice_patterns:
        match = re.search(pattern, md_content)
        if match:
            return match.group(1).strip()
    
    return "INV-" + datetime.now().strftime('%Y%m%d')

def extract_items_from_content(md_content, layout_info):
    """Extract line items from markdown content"""
    import re
    
    # Look for table-like structures or itemized lists
    items = []
    
    # Simple pattern for items with quantities and prices
    item_patterns = [
        r'(?i)([^\n]+?)\s+([0-9]+)\s+\$?([0-9,]+\.?[0-9]*)\s*$',
        r'(?i)([^\n]+?)\s+\$?([0-9,]+\.[0-9]{2})\s*$'
    ]
    
    lines = md_content.split('\n')
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        for pattern in item_patterns:
            match = re.search(pattern, line)
            if match:
                if len(match.groups()) == 3:
                    items.append({
                        'description': match.group(1).strip(),
                        'quantity': int(match.group(2)),
                        'price': float(match.group(3).replace(',', ''))
                    })
                elif len(match.groups()) == 2:
                    items.append({
                        'description': match.group(1).strip(),
                        'quantity': 1,
                        'price': float(match.group(2).replace(',', ''))
                    })
                break
    
    return items

def calculate_confidence_from_content(vendor, total, date, invoice_number):
    """Calculate confidence scores based on extracted content"""
    from datetime import datetime
    
    confidence = {
        'date': 85 if date and date != datetime.now().strftime('%Y-%m-%d') else 50,
        'vendor': 90 if vendor and vendor != "Unknown Vendor" else 30,
        'total': 95 if total and total != "0.00" else 40,
        'invoice': 80 if invoice_number and not invoice_number.startswith('INV-202') else 50
    }
    return confidence

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    model_path = os.path.join(os.path.dirname(__file__), '..', 'dots.ocr', 'weights', 'DotsOCR')
    model_exists = os.path.exists(model_path)
    
    return jsonify({
        'status': 'healthy',
        'dots_ocr_available': dots_parser is not None,
        'model_available': model_available,
        'model_path_exists': model_exists,
        'model_path': model_path,
        'service': 'dots-ocr-backend',
        'message': 'Model weights downloading...' if not model_exists else 'Ready' if model_available else 'Model initialization failed'
    })

@app.route('/initialize', methods=['POST'])
def reinitialize_parser():
    """Reinitialize DotsOCR Parser (useful after model download)"""
    success = initialize_dots_parser()
    return jsonify({
        'success': success,
        'dots_ocr_available': dots_parser is not None,
        'model_available': model_available,
        'message': 'Parser initialized successfully' if success else 'Failed to initialize parser'
    })

@app.route('/parse', methods=['POST'])
def parse_document():
    """Parse uploaded document using dots.ocr"""
    try:
        # Check if dots.ocr is available
        if not dots_parser or not model_available:
            model_path = os.path.join(os.path.dirname(__file__), '..', 'dots.ocr', 'weights', 'DotsOCR')
            if not os.path.exists(model_path):
                return jsonify({
                    'success': False,
                    'error': 'DotsOCR model weights not found. Please download the model first.',
                    'stage': 'error',
                    'instructions': 'Run: python dots.ocr/tools/download_model.py --type huggingface --name rednote-hilab/dots.ocr'
                }), 503
            else:
                return jsonify({
                    'success': False,
                    'error': 'DotsOCR parser initialization failed. Try reinitializing.',
                    'stage': 'error',
                    'instructions': 'POST to /initialize endpoint to retry initialization'
                }), 503
        
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No file provided',
                'stage': 'error'
            }), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected',
                'stage': 'error'
            }), 400
        
        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'error': 'File type not allowed',
                'stage': 'error'
            }), 400
        
        # Save uploaded file temporarily
        filename = secure_filename(file.filename)
        temp_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(temp_path)
        
        try:
            # Get file info
            file_size = os.path.getsize(temp_path)
            
            # Get processing parameters
            use_extraction_function = request.form.get('use_extraction_function', 'false').lower() == 'true'
            skip_full_model = request.form.get('skip_full_model', 'false').lower() == 'true'
            
            # Process with dots.ocr
            processing_mode = "quick extraction" if use_extraction_function else "full model"
            logger.info(f"Processing file: {filename} ({file_size} bytes) using {processing_mode}")
            
            # Preprocess files to prevent memory issues
            processed_path = temp_path
            if filename.lower().endswith('.pdf'):
                logger.info(f"Processing PDF file: {filename}")
                try:
                    # Convert PDF to image to prevent memory issues
                    logger.info("Starting PDF preprocessing...")
                    processed_path = preprocess_pdf(temp_path, app.config['MAX_IMAGE_SIZE'])
                    logger.info(f"PDF preprocessed successfully: {processed_path}")
                    
                    # Process as image after conversion
                    prompt_mode = "prompt_layout_simple_en" if use_extraction_function else "prompt_layout_all_en"
                    result = dots_parser.parse_image(
                        input_path=processed_path,
                        filename=os.path.basename(processed_path),
                        prompt_mode=prompt_mode,
                        save_dir=tempfile.gettempdir()
                    )
                except Exception as pdf_error:
                    logger.error(f"PDF preprocessing failed: {pdf_error}")
                    raise pdf_error
            else:
                logger.info(f"Processing image file: {filename}")
                # Preprocess image files
                preprocess_image(temp_path, app.config['MAX_IMAGE_SIZE'])
                prompt_mode = "prompt_layout_simple_en" if use_extraction_function else "prompt_layout_all_en"
                result = dots_parser.parse_image(
                    input_path=temp_path,
                    filename=filename,
                    prompt_mode=prompt_mode,
                    save_dir=tempfile.gettempdir()
                )
            
            # Convert result to our expected format
            processed_result = process_ocr_result(result, filename, file_size)
            
            # Debug: Log the processed result before returning
            logger.info(f"🔍 Processed result for {filename}: {processed_result}")
            logger.info(f"🔍 Processed result type: {type(processed_result)}")
            
            logger.info(f"Successfully processed {filename}")
            return jsonify(processed_result)
            
        except Exception as e:
            logger.error(f"Error processing file {filename}: {e}")
            logger.error(traceback.format_exc())
            return jsonify({
                'success': False,
                'error': f'Processing failed: {str(e)}',
                'stage': 'error'
            }), 500
        
        finally:
            # Clean up temporary files
            try:
                os.remove(temp_path)
            except OSError:
                pass
            
            # Clean up processed PDF image if it exists
            if filename.lower().endswith('.pdf'):
                processed_image_path = temp_path.replace('.pdf', '_processed.png')
                try:
                    if os.path.exists(processed_image_path):
                        os.remove(processed_image_path)
                except OSError:
                    pass
    
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': f'Unexpected error: {str(e)}',
            'stage': 'error'
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    logger.info(f"Starting DotsOCR Backend Service on port {port}")
    logger.info(f"Debug mode: {debug}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)