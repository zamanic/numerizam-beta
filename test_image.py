from PIL import Image, ImageDraw, ImageFont
import os

# Create a more realistic invoice image for testing
width, height = 800, 600
image = Image.new('RGB', (width, height), 'white')
draw = ImageDraw.Draw(image)

# Try to use a default font, fallback to basic if not available
try:
    title_font = ImageFont.truetype("arial.ttf", 24)
    header_font = ImageFont.truetype("arial.ttf", 16)
    text_font = ImageFont.truetype("arial.ttf", 12)
except:
    title_font = ImageFont.load_default()
    header_font = ImageFont.load_default()
    text_font = ImageFont.load_default()

# Draw invoice content
draw.text((50, 30), "INVOICE", fill='black', font=title_font)
draw.text((50, 80), "Invoice #: INV-2024-001", fill='black', font=header_font)
draw.text((50, 110), "Date: January 15, 2024", fill='black', font=header_font)
draw.text((50, 140), "Bill To:", fill='black', font=header_font)
draw.text((50, 170), "ABC Company Ltd.", fill='black', font=text_font)
draw.text((50, 190), "123 Business Street", fill='black', font=text_font)
draw.text((50, 210), "City, State 12345", fill='black', font=text_font)

# Add some line items
draw.text((50, 260), "Description", fill='black', font=header_font)
draw.text((400, 260), "Quantity", fill='black', font=header_font)
draw.text((500, 260), "Price", fill='black', font=header_font)
draw.text((600, 260), "Total", fill='black', font=header_font)

# Draw a line
draw.line([(50, 280), (650, 280)], fill='black', width=1)

# Add items
draw.text((50, 300), "Professional Services", fill='black', font=text_font)
draw.text((400, 300), "10", fill='black', font=text_font)
draw.text((500, 300), "$150.00", fill='black', font=text_font)
draw.text((600, 300), "$1,500.00", fill='black', font=text_font)

draw.text((50, 320), "Consulting Hours", fill='black', font=text_font)
draw.text((400, 320), "5", fill='black', font=text_font)
draw.text((500, 320), "$200.00", fill='black', font=text_font)
draw.text((600, 320), "$1,000.00", fill='black', font=text_font)

# Add total
draw.line([(500, 350), (650, 350)], fill='black', width=1)
draw.text((500, 370), "Subtotal:", fill='black', font=header_font)
draw.text((600, 370), "$2,500.00", fill='black', font=header_font)
draw.text((500, 390), "Tax (8%):", fill='black', font=header_font)
draw.text((600, 390), "$200.00", fill='black', font=header_font)
draw.text((500, 410), "Total:", fill='black', font=header_font)
draw.text((600, 410), "$2,700.00", fill='black', font=header_font)

# Save the image
image.save('test_invoice_detailed.png')
print("Detailed test invoice image created: test_invoice_detailed.png")