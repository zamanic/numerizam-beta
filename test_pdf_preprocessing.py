#!/usr/bin/env python3

import os
import sys
import tempfile
import logging
import io
from PIL import Image
import fitz  # PyMuPDF for PDF processing

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def preprocess_pdf(pdf_path, max_size=(2048, 2048), max_dpi=150):
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
        logger.info(f"Original PDF page size: {page_width:.1f} x {page_height:.1f} points")
        
        # Convert to image
        mat = fitz.Matrix(target_dpi / 72, target_dpi / 72)
        pix = page.get_pixmap(matrix=mat)
        
        # Convert to PIL Image
        img_data = pix.tobytes("png")
        img = Image.open(io.BytesIO(img_data))
        
        # Save as PNG
        output_path = pdf_path.replace('.pdf', '_processed.png')
        img.save(output_path, 'PNG', optimize=True)
        doc.close()
        
        logger.info(f"PDF converted to image: {img.width}x{img.height} pixels")
        logger.info(f"Total pixels: {img.width * img.height:,}")
        logger.info(f"Output saved to: {output_path}")
        return output_path
        
    except Exception as e:
        logger.error(f"Error preprocessing PDF: {e}")
        raise e

if __name__ == "__main__":
    # Test with a sample PDF (you'll need to provide a PDF file)
    test_pdf = "test_invoice.pdf"  # Replace with actual PDF path
    
    if os.path.exists(test_pdf):
        try:
            result = preprocess_pdf(test_pdf)
            print(f"✅ PDF preprocessing successful: {result}")
        except Exception as e:
            print(f"❌ PDF preprocessing failed: {e}")
    else:
        print(f"❌ Test PDF not found: {test_pdf}")
        print("Please provide a PDF file to test with.")