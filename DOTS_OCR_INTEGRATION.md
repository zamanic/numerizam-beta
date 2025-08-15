# Dots.ocr Integration Guide

This document provides comprehensive instructions for setting up and using the dots.ocr multilingual document parsing integration in the Numerizam accounting application.

## Overview

The dots.ocr integration enables automatic extraction of structured data from invoices and receipts in multiple languages, including:

- Supplier name and address
- Invoice items with quantities and prices
- Total amounts, taxes, and subtotals
- Purchase order and work order numbers
- Issue dates and due dates
- Currency and payment terms

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the project root with the following variables:

```bash
# Dots.ocr API Configuration
VITE_DOTS_OCR_ENDPOINT=https://api.dots.ocr.com/v1/process
VITE_DOTS_OCR_API_KEY=your_api_key_here
VITE_DOTS_OCR_TIMEOUT=30000
VITE_DOTS_OCR_MAX_FILE_SIZE=10485760
VITE_DOTS_OCR_CONFIDENCE_THRESHOLD=0.7
VITE_DOTS_OCR_ENABLE_MOCK=true
```

### 2. API Key Setup

To obtain an API key:
1. Visit the dots.ocr GitHub repository: https://github.com/rednote-hilab/dots.ocr
2. Follow the setup instructions to deploy your own instance or use the cloud service
3. Generate an API key from your deployed instance
4. Add the API key to your `.env` file

### 3. Supported File Formats

The integration supports:
- **Images**: JPEG, PNG, WebP
- **Documents**: PDF files
- **Maximum size**: 10MB (configurable)

## Usage

### OCR Upload Page

Navigate to `/app/ocr` to access the OCR upload interface:

1. **Authentication Required**: Users must be logged in to process invoices
2. **File Upload**: Drag and drop or click to upload files
3. **Processing Options**:
   - Standard OCR processing
   - AI-enhanced processing for complex invoices
   - Batch processing for multiple files

### Data Extraction

The system extracts the following fields:

#### Supplier Information
- **Name**: Full supplier/company name
- **Address**: Complete address including country/region
- **Contact**: Phone, email, website (if available)

#### Invoice Details
- **Invoice Number**: Unique identifier
- **Issue Date**: When the invoice was created
- **Due Date**: Payment deadline
- **Purchase Order Number**: Associated PO number
- **Work Order Number**: Associated WO number

#### Financial Data
- **Currency**: Transaction currency
- **Subtotal**: Amount before tax
- **Tax Amount**: Tax/VAT amount
- **Total Amount**: Final amount due
- **Payment Terms**: Net 30, Net 60, etc.

#### Line Items
- **Item Name**: Product/service description
- **Quantity**: Number of units
- **Unit**: kg, pcs, hours, etc.
- **Unit Price**: Price per unit
- **Total**: Line total (quantity × unit price)

### Integration with QueryPage

OCR-extracted data automatically integrates with the AI Query system:

1. **Automatic Classification**: Items are classified using the app's product categories
2. **Database Persistence**: Transactions are saved with full invoice metadata
3. **Search Integration**: OCR data becomes searchable in queries
4. **Export Options**: Data can be exported to Excel or other formats

## API Endpoints

### Frontend Services

- `POST /api/transactions/process` - Process OCR results
- `GET /api/transactions/ocr/:id` - Retrieve OCR transaction
- `POST /api/ocr/upload` - Upload file for processing

### Backend Integration

The system uses the following services:
- `dotsOcrService.ts` - Direct API integration
- `ocrService.ts` - Enhanced OCR processing
- `supabaseAccountingService.ts` - Database persistence

## Error Handling

### Common Issues

1. **Authentication Errors**
   - Ensure user is logged in
   - Check API key configuration

2. **File Upload Errors**
   - Verify file format is supported
   - Check file size limits
   - Ensure stable internet connection

3. **Processing Errors**
   - Low image quality may reduce accuracy
   - Complex layouts might need manual review
   - Non-standard invoice formats may require custom handling

### Debug Mode

Enable debug logging:
```javascript
// In browser console
localStorage.setItem('debug', 'dots-ocr:*');
```

## Testing

### Test Files

Use the provided test files in `tests/fixtures/`:
- `sample-invoice.pdf` - Standard invoice format
- `multilingual-receipt.jpg` - Receipt in multiple languages
- `complex-invoice.png` - Invoice with multiple line items

### Manual Testing

1. Upload a test invoice
2. Verify all fields are extracted correctly
3. Check database persistence
4. Test search functionality
5. Validate Excel export

## Security

### Data Protection
- All file uploads are encrypted in transit
- API keys are stored securely in environment variables
- User authentication is required for all operations
- File processing is isolated and secure

### Privacy
- Uploaded files are processed temporarily and deleted
- No data is stored permanently without user consent
- All processing follows GDPR compliance standards

## Troubleshooting

### Performance Issues
- Large PDFs may take longer to process
- Consider file compression for better performance
- Use batch processing for multiple files

### Accuracy Issues
- Ensure high-quality scans (300+ DPI recommended)
- Use well-lit, straight-on photos
- Avoid shadows and reflections
- Check for text clarity and completeness

### Support

For technical support:
1. Check browser console for error messages
2. Review server logs for backend issues
3. Consult the dots.ocr documentation
4. Submit issues to the project repository

## Advanced Configuration

### Custom Categories

Map OCR-extracted items to custom categories:

```javascript
// In category mapping configuration
const categoryMap = {
  'Office Supplies': ['pen', 'paper', 'printer'],
  'Software': ['license', 'subscription', 'saas'],
  'Travel': ['hotel', 'flight', 'taxi']
};
```

### Language Support

Configure language detection:
```javascript
const languageConfig = {
  primary: 'en',
  fallback: ['ms', 'zh', 'ar'],
  confidence: 0.8
};
```

## Development

### Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start development server: `npm run dev`
5. Access OCR upload at: `http://localhost:5173/app/ocr`

### Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Submit pull request with detailed description

## License

This integration follows the same license as the main Numerizam project. Refer to the main LICENSE file for details.