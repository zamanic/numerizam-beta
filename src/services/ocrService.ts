/**
 * Mock OCR (Optical Character Recognition) service
 * In a real application, this would integrate with a real OCR API
 */

// Types
export type OCRResult = {
  success: boolean;
  text?: string;
  data?: {
    date?: string;
    vendor?: string;
    total?: number;
    items?: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      amount: number;
      confidence?: number; // 0-100
    }>;
    taxAmount?: number;
    currency?: string;
    invoiceNumber?: string;
    confidence?: {
      date?: number; // 0-100
      vendor?: number; // 0-100
      total?: number; // 0-100
      invoiceNumber?: number; // 0-100
    };
    possibleDuplicates?: Array<{
      id: string;
      date: string;
      vendor: string;
      amount: number;
      similarity: number; // 0-100
    }>;
  };
  error?: string;
  stage?: 'upload' | 'ocr' | 'parsing' | 'duplicate-check' | 'complete' | 'error';
  progress?: number; // 0-100
};

// Sample receipt data for demo purposes
const sampleReceipts = [
  {
    text: "ACME OFFICE SUPPLIES\n123 Business St\nNew York, NY 10001\n\nINVOICE #: INV-2023-0568\nDATE: 06/15/2023\n\nBill To:\nGlobex Corporation\n456 Corporate Ave\nNew York, NY 10002\n\nITEM          QTY   PRICE    AMOUNT\n----------------------------------------\nPrinter Paper  5    $12.99   $64.95\nInk Cartridges 2    $45.50   $91.00\nStapler        1    $8.75    $8.75\n----------------------------------------\nSubtotal:                    $164.70\nTax (8.875%):                $14.62\nTotal:                       $179.32\n\nPayment Terms: Net 30\nThank you for your business!",
    data: {
      date: "2023-06-15",
      vendor: "ACME OFFICE SUPPLIES",
      total: 179.32,
      items: [
        { description: "Printer Paper", quantity: 5, unitPrice: 12.99, amount: 64.95, confidence: 98 },
        { description: "Ink Cartridges", quantity: 2, unitPrice: 45.50, amount: 91.00, confidence: 95 },
        { description: "Stapler", quantity: 1, unitPrice: 8.75, amount: 8.75, confidence: 92 }
      ],
      taxAmount: 14.62,
      currency: "USD",
      invoiceNumber: "INV-2023-0568",
      confidence: {
        date: 97,
        vendor: 99,
        total: 98,
        invoiceNumber: 96
      },
      possibleDuplicates: [
        {
          id: "dup1",
          date: "2023-06-14",
          vendor: "ACME OFFICE SUPPLIES",
          amount: 179.32,
          similarity: 95
        }
      ]
    }
  },
  {
    text: "CITY UTILITIES\n789 Power Lane\nNew York, NY 10003\n\nBILL #: UTIL-2023-1245\nDATE: 06/20/2023\n\nService Address:\nGlobex Corporation\n456 Corporate Ave\nNew York, NY 10002\n\nSERVICE PERIOD: 05/15/2023 - 06/14/2023\n\nElectricity: 1,250 kWh    $187.50\nWater: 8,500 gallons      $42.50\nSewer                      $35.00\n----------------------------------------\nSubtotal:                 $265.00\nTax:                       $13.25\nTotal Due:                $278.25\n\nDue Date: 07/05/2023\nPlease pay by the due date to avoid late fees.",
    data: {
      date: "2023-06-20",
      vendor: "CITY UTILITIES",
      total: 278.25,
      items: [
        { description: "Electricity: 1,250 kWh", quantity: 1, unitPrice: 187.50, amount: 187.50 },
        { description: "Water: 8,500 gallons", quantity: 1, unitPrice: 42.50, amount: 42.50 },
        { description: "Sewer", quantity: 1, unitPrice: 35.00, amount: 35.00 }
      ],
      taxAmount: 13.25,
      currency: "USD",
      invoiceNumber: "UTIL-2023-1245"
    }
  },
  {
    text: "DOWNTOWN CATERING\n321 Food Court\nNew York, NY 10004\n\nRECEIPT #: CAT-2023-0789\nDATE: 06/22/2023\n\nCustomer: Globex Corporation\n\nITEM                  QTY   PRICE    AMOUNT\n----------------------------------------\nExecutive Lunch       15   $22.50   $337.50\nPremium Coffee        20   $3.75    $75.00\nAssorted Pastries     30   $2.50    $75.00\n----------------------------------------\nSubtotal:                       $487.50\nService Fee (18%):              $87.75\nTax (8.875%):                   $43.27\nTotal:                         $618.52\n\nPaid by Corporate Card: XXXX-XXXX-XXXX-4567\nThank you for your business!",
    data: {
      date: "2023-06-22",
      vendor: "DOWNTOWN CATERING",
      total: 618.52,
      items: [
        { description: "Executive Lunch", quantity: 15, unitPrice: 22.50, amount: 337.50 },
        { description: "Premium Coffee", quantity: 20, unitPrice: 3.75, amount: 75.00 },
        { description: "Assorted Pastries", quantity: 30, unitPrice: 2.50, amount: 75.00 }
      ],
      taxAmount: 43.27,
      currency: "USD",
      invoiceNumber: "CAT-2023-0789"
    }
  }
];

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// OCR service
export const ocrService = {
  /**
   * Process an image file and extract text and structured data
   * @param file The image file to process
   * @returns OCR result with extracted text and structured data
   */
  processImage: async (_file: File): Promise<OCRResult> => {
    // Initial state - uploading
    const result: OCRResult = {
      success: false,
      stage: 'upload',
      progress: 0
    };
    
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      result.progress = i;
      await delay(100);
    }
    
    // OCR stage
    result.stage = 'ocr';
    result.progress = 0;
    
    // Simulate OCR progress
    for (let i = 0; i <= 100; i += 5) {
      result.progress = i;
      await delay(50);
    }
    
    // Parsing stage
    result.stage = 'parsing';
    result.progress = 0;
    
    // Simulate parsing progress
    for (let i = 0; i <= 100; i += 10) {
      result.progress = i;
      await delay(30);
    }
    
    // In a real app, we would send the file to an OCR API
    // For this mock, we'll randomly select one of our sample receipts
    const randomIndex = Math.floor(Math.random() * sampleReceipts.length);
    const sampleReceipt = sampleReceipts[randomIndex];
    
    result.text = sampleReceipt.text;
    result.data = sampleReceipt.data;
    
    // Duplicate check stage
    result.stage = 'duplicate-check';
    result.progress = 0;
    
    // Simulate duplicate check progress
    for (let i = 0; i <= 100; i += 20) {
      result.progress = i;
      await delay(100);
    }
    
    // Complete stage
    result.stage = 'complete';
    result.progress = 100;
    result.success = true;
    
    return result;
  },
  
  /**
   * Process a PDF file and extract text and structured data
   * @param file The PDF file to process
   * @returns OCR result with extracted text and structured data
   */
  processPdf: async (_file: File): Promise<OCRResult> => {
    // Initial state - uploading
    const result: OCRResult = {
      success: false,
      stage: 'upload',
      progress: 0
    };
    
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      result.progress = i;
      await delay(100);
    }
    
    // OCR stage
    result.stage = 'ocr';
    result.progress = 0;
    
    // Simulate OCR progress
    for (let i = 0; i <= 100; i += 5) {
      result.progress = i;
      await delay(70);
    }
    
    // Parsing stage
    result.stage = 'parsing';
    result.progress = 0;
    
    // Simulate parsing progress
    for (let i = 0; i <= 100; i += 10) {
      result.progress = i;
      await delay(50);
    }
    
    // In a real app, we would send the file to an OCR API
    // For this mock, we'll randomly select one of our sample receipts
    const randomIndex = Math.floor(Math.random() * sampleReceipts.length);
    const sampleReceipt = sampleReceipts[randomIndex];
    
    result.text = sampleReceipt.text;
    result.data = sampleReceipt.data;
    
    // Duplicate check stage
    result.stage = 'duplicate-check';
    result.progress = 0;
    
    // Simulate duplicate check progress
    for (let i = 0; i <= 100; i += 20) {
      result.progress = i;
      await delay(100);
    }
    
    // Complete stage
    result.stage = 'complete';
    result.progress = 100;
    result.success = true;
    
    return result;
  },
  
  /**
   * Process text directly and extract structured data
   * @param text The text to process
   * @returns OCR result with structured data
   */
  processText: async (text: string): Promise<OCRResult> => {
    // Initial state - parsing
    const result: OCRResult = {
      success: false,
      stage: 'parsing',
      progress: 0
    };
    
    // Simulate parsing progress
    for (let i = 0; i <= 100; i += 10) {
      result.progress = i;
      await delay(50);
    }
    
    // In a real app, we would send the text to an NLP/OCR API
    // For this mock, we'll check if the text contains keywords from our samples
    let matchedReceipt = null;
    
    for (const receipt of sampleReceipts) {
      if (receipt.text.includes(text) || text.includes(receipt.data.vendor || '')) {
        matchedReceipt = receipt;
        break;
      }
    }
    
    if (matchedReceipt) {
      result.data = matchedReceipt.data;
      
      // Duplicate check stage
      result.stage = 'duplicate-check';
      result.progress = 0;
      
      // Simulate duplicate check progress
      for (let i = 0; i <= 100; i += 20) {
        result.progress = i;
        await delay(100);
      }
      
      // Complete stage
      result.stage = 'complete';
      result.progress = 100;
      result.success = true;
      
      return result;
    }
    
    // If no match, return a generic structure with error
    result.stage = 'error';
    result.error = 'Could not extract structured data from the provided text.';
    return result;
  },
  
  /**
   * Validate and correct OCR results
   * @param result The OCR result to validate
   * @returns Validated and potentially corrected OCR result
   */
  validateResult: async (result: OCRResult): Promise<OCRResult> => {
    // Simulate processing delay
    await delay(800);
    
    // In a real app, we would apply validation rules and corrections
    // For this mock, we'll just return the result as is with stage information
    return {
      ...result,
      stage: 'complete',
      progress: 100
    };
  },
  
  /**
   * Convert OCR result to a transaction
   * @param result The OCR result to convert
   * @returns Transaction data that can be saved to the system
   */
  convertToTransaction: async (result: OCRResult): Promise<any> => {
    // Simulate processing delay
    await delay(500);
    
    if (!result.success || !result.data) {
      throw new Error('Cannot convert invalid OCR result to transaction');
    }
    
    // In a real app, we would map the OCR data to our transaction model
    return {
      date: result.data.date ? new Date(result.data.date) : new Date(),
      description: `Payment to ${result.data.vendor}`,
      amount: result.data.total || 0,
      type: 'debit', // Assuming it's an expense
      account: 'Accounts Payable',
      category: 'Expense',
      metadata: {
        vendor: result.data.vendor,
        invoiceNumber: result.data.invoiceNumber,
        items: result.data.items,
        taxAmount: result.data.taxAmount,
        confidence: result.data.confidence,
        possibleDuplicates: result.data.possibleDuplicates
      }
    };
  },
  
  /**
   * Check for duplicate transactions
   * @param data The transaction data to check for duplicates
   * @returns Array of potential duplicate transactions
   */
  checkDuplicates: async (data: any): Promise<any[]> => {
    // Simulate processing delay
    await delay(1000);
    
    // In a real app, we would query the database for similar transactions
    // For this mock, we'll return some sample duplicates
    if (data.vendor && data.vendor.includes('ACME')) {
      return [
        {
          id: 'dup1',
          date: '2023-06-14',
          vendor: 'ACME OFFICE SUPPLIES',
          amount: 179.32,
          similarity: 95
        }
      ];
    }
    
    if (data.vendor && data.vendor.includes('CITY')) {
      return [
        {
          id: 'dup2',
          date: '2023-05-20',
          vendor: 'CITY UTILITIES',
          amount: 278.25,
          similarity: 85
        }
      ];
    }
    
    return [];
  }
};