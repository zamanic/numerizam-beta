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

// Helper function to simulate API delay with timeout
const delayWithTimeout = (ms: number, timeoutMs: number = 10000) => {
  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      clearTimeout(timeout);
      reject(new Error('Operation timed out'));
    }, timeoutMs);
    
    setTimeout(() => {
      clearTimeout(timeout);
      resolve();
    }, ms);
  });
};

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
    
    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        result.progress = i;
        await delayWithTimeout(100);
      }
      
      // OCR stage
      result.stage = 'ocr';
      result.progress = 0;
      
      // Simulate OCR progress
      for (let i = 0; i <= 100; i += 5) {
        result.progress = i;
        await delayWithTimeout(50);
      }
      
      // Parsing stage
      result.stage = 'parsing';
      result.progress = 0;
      
      // Simulate parsing progress
      for (let i = 0; i <= 100; i += 10) {
        result.progress = i;
        await delayWithTimeout(30);
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
        await delayWithTimeout(100);
      }
      
      // Complete stage
      result.stage = 'complete';
      result.progress = 100;
      result.success = true;
      
      return result;
    } catch (error) {
      result.stage = 'error';
      result.error = error instanceof Error ? error.message : 'An unknown error occurred';
      throw error;
    }
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
    
    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        result.progress = i;
        await delayWithTimeout(100);
      }
      
      // OCR stage
      result.stage = 'ocr';
      result.progress = 0;
      
      // Simulate OCR progress
      for (let i = 0; i <= 100; i += 5) {
        result.progress = i;
        await delayWithTimeout(70);
      }
      
      // Parsing stage
      result.stage = 'parsing';
      result.progress = 0;
      
      // Simulate parsing progress
      for (let i = 0; i <= 100; i += 10) {
        result.progress = i;
        await delayWithTimeout(50);
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
        await delayWithTimeout(100);
      }
      
      // Complete stage
      result.stage = 'complete';
      result.progress = 100;
      result.success = true;
      
      return result;
    } catch (error) {
      result.stage = 'error';
      result.error = error instanceof Error ? error.message : 'An unknown error occurred';
      throw error;
    }
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
    
    try {
      // Simulate parsing progress
      for (let i = 0; i <= 100; i += 10) {
        result.progress = i;
        await delayWithTimeout(50);
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
          await delayWithTimeout(100);
        }
        
        // Complete stage
        result.stage = 'complete';
        result.progress = 100;
        result.success = true;
        
        return result;
      }
      
      // If no match, use the first sample receipt as a fallback
      result.data = sampleReceipts[0].data;
      result.stage = 'complete';
      result.progress = 100;
      result.success = true;
      
      return result;
    } catch (error) {
      result.stage = 'error';
      result.error = error instanceof Error ? error.message : 'An unknown error occurred';
      throw error;
    }
  },

  /**
   * Validate and correct OCR results
   * @param result The OCR result to validate
   * @returns Validated OCR result
   */
  validateResult: async (result: OCRResult): Promise<OCRResult> => {
    try {
      // Simulate validation delay
      await delayWithTimeout(500);
      
      // In a real app, we would validate the data and correct any issues
      // For this mock, we'll just return the result as is
      return {
        ...result,
        success: true
      };
    } catch (error) {
      return {
        ...result,
        success: false,
        error: error instanceof Error ? error.message : 'Validation failed'
      };
    }
  },
  
  /**
   * Convert OCR result to transaction data
   * @param result The OCR result to convert
   * @returns Transaction data
   */
  convertToTransaction: (result: OCRResult): Transaction => {
    try {
      if (!result.data) {
        throw new Error('No data available to convert to transaction');
      }
      
      const { vendor, date, total, items, tax, currency, invoiceNumber } = result.data;
      
      if (!vendor || !date || !total) {
        throw new Error('Missing required transaction data');
      }
      
      return {
        id: uuidv4(),
        date: date || new Date().toISOString(),
        vendor: vendor || 'Unknown Vendor',
        total: parseFloat(total) || 0,
        currency: currency || 'USD',
        items: items?.map(item => ({
          id: uuidv4(),
          description: item.description || 'Unknown Item',
          amount: parseFloat(item.amount) || 0,
          quantity: item.quantity || 1
        })) || [],
        tax: tax ? parseFloat(tax) : 0,
        invoiceNumber: invoiceNumber || '',
        notes: '',
        category: '',
        paymentMethod: '',
        status: 'pending',
        attachments: []
      };
    } catch (error) {
      console.error('Error converting OCR result to transaction:', error);
      // Return a minimal valid transaction to prevent UI errors
      return {
        id: uuidv4(),
        date: new Date().toISOString(),
        vendor: 'Error in OCR Processing',
        total: 0,
        currency: 'USD',
        items: [],
        tax: 0,
        invoiceNumber: '',
        notes: error instanceof Error ? error.message : 'Unknown error in OCR processing',
        category: '',
        paymentMethod: '',
        status: 'pending',
        attachments: []
      };
    }
  },
  
  /**
   * Check for duplicate transactions
   * @param result The OCR result to check for duplicates
   * @returns OCR result with possible duplicates
   */
  checkDuplicates: async (result: OCRResult): Promise<OCRResult> => {
    try {
      if (!result.data || !result.data.vendor) {
        return result;
      }
      
      // Simulate duplicate check delay
      await delayWithTimeout(800);
      
      // In a real app, we would check against existing transactions in the database
      // For this mock, we'll randomly decide if there are duplicates
      const hasDuplicates = Math.random() > 0.7;
      
      if (hasDuplicates) {
        // Create a fake duplicate based on the vendor name
        const duplicate = {
          id: uuidv4(),
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
          vendor: result.data.vendor,
          total: result.data.total ? parseFloat(result.data.total) : 0,
          similarity: Math.floor(Math.random() * 30 + 70) // 70-99% similarity
        };
        
        return {
          ...result,
          data: {
            ...result.data,
            possibleDuplicates: [duplicate]
          }
        };
      }
      
      return result;
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return {
        ...result,
        error: error instanceof Error ? error.message : 'Error checking for duplicates'
      };
    }
  }
};