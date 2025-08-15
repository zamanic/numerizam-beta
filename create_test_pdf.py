#!/usr/bin/env python3

from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

def create_test_pdf(filename="test_invoice.pdf"):
    """Create a simple test PDF invoice"""
    c = canvas.Canvas(filename, pagesize=letter)
    width, height = letter
    
    # Add some content to make it look like an invoice
    c.setFont("Helvetica-Bold", 16)
    c.drawString(100, height - 100, "INVOICE")
    
    c.setFont("Helvetica", 12)
    c.drawString(100, height - 150, "Invoice #: INV-2024-001")
    c.drawString(100, height - 170, "Date: January 15, 2024")
    
    c.drawString(100, height - 220, "Bill To:")
    c.drawString(100, height - 240, "ACME Corporation")
    c.drawString(100, height - 260, "123 Business St")
    c.drawString(100, height - 280, "City, State 12345")
    
    c.drawString(100, height - 330, "Description")
    c.drawString(300, height - 330, "Quantity")
    c.drawString(400, height - 330, "Price")
    c.drawString(500, height - 330, "Total")
    
    c.drawString(100, height - 360, "Consulting Services")
    c.drawString(300, height - 360, "10 hours")
    c.drawString(400, height - 360, "$150.00")
    c.drawString(500, height - 360, "$1,500.00")
    
    c.drawString(100, height - 390, "Software License")
    c.drawString(300, height - 390, "1")
    c.drawString(400, height - 390, "$500.00")
    c.drawString(500, height - 390, "$500.00")
    
    c.setFont("Helvetica-Bold", 12)
    c.drawString(400, height - 440, "Total: $2,000.00")
    
    c.save()
    print(f"Test PDF created: {filename}")

if __name__ == "__main__":
    create_test_pdf()