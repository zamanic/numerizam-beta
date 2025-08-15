// Configuration for dots.ocr integration
export interface DotsOcrConfig {
  apiEndpoint: string;
  apiKey?: string;
  timeout: number;
  maxFileSize: number;
  supportedFormats: string[];
  confidenceThreshold: number;
  languageSupport: string[];
  enableMockFallback: boolean;
}

export const dotsOcrConfig: DotsOcrConfig = {
  // Default configuration - can be overridden via environment variables
  apiEndpoint: import.meta.env.VITE_DOTS_OCR_ENDPOINT || 'https://api.dots.ocr.com/v1/process',
  apiKey: import.meta.env.VITE_DOTS_OCR_API_KEY,
 timeout: parseInt(import.meta.env.VITE_DOTS_OCR_TIMEOUT || '1200000'), // 20 minutes timeout for DotsOCR processing
  maxFileSize: parseInt(import.meta.env.VITE_DOTS_OCR_MAX_FILE_SIZE || '10485760'), // 10MB
  supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  confidenceThreshold: parseFloat(import.meta.env.VITE_DOTS_OCR_CONFIDENCE_THRESHOLD || '0.7'),
  languageSupport: [
    'en', // English
    'ms', // Malay
    'zh', // Chinese
    'ar', // Arabic
    'hi', // Hindi
    'th', // Thai
    'vi', // Vietnamese
    'id', // Indonesian
  ],
  enableMockFallback: import.meta.env.VITE_DOTS_OCR_ENABLE_MOCK !== 'false',
};

export const validateConfig = (): boolean => {
  if (!dotsOcrConfig.apiEndpoint) {
    console.warn('Dots OCR API endpoint not configured. Using mock fallback.');
    return false;
  }
  
  if (!dotsOcrConfig.apiKey && !dotsOcrConfig.enableMockFallback) {
    console.warn('Dots OCR API key not provided. Authentication may fail.');
    return false;
  }
  
  return true;
};

export const getSupportedFormats = (): string[] => {
  return dotsOcrConfig.supportedFormats;
};

export const isFileSupported = (file: File): boolean => {
  return dotsOcrConfig.supportedFormats.includes(file.type);
};

export const getFileSizeLimit = (): number => {
  return dotsOcrConfig.maxFileSize;
};

export const isFileSizeValid = (file: File): boolean => {
  return file.size <= dotsOcrConfig.maxFileSize;
};