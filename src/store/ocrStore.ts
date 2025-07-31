import { create } from 'zustand';
import { OCRResult } from '../services/ocrService';

// Simple Transaction type for OCR store
interface Transaction {
  id: string;
  [key: string]: any;
}

// Define the store state type
type OCRState = {
  // OCR processing state
  stage: 'idle' | 'upload' | 'ocr' | 'parsing' | 'duplicate-check' | 'complete' | 'error';
  progress: number;
  error: string | null;
  
  // OCR results
  originalResult: OCRResult | null;
  editedResult: OCRResult | null;
  savedTransaction: Transaction | null;
  
  // UI state
  activeStep: number;
  uploadMethod: 'file' | 'camera' | 'text' | null;
  showPreviewDialog: boolean;
  showConfirmDialog: boolean;
  
  // Actions
  setStage: (stage: OCRState['stage']) => void;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  setOriginalResult: (result: OCRResult | null) => void;
  setEditedResult: (result: OCRResult | null) => void;
  setSavedTransaction: (transaction: Transaction | null) => void;
  setActiveStep: (step: number) => void;
  setUploadMethod: (method: OCRState['uploadMethod']) => void;
  setShowPreviewDialog: (show: boolean) => void;
  setShowConfirmDialog: (show: boolean) => void;
  reset: () => void;
  
  // Editing actions
  updateField: <K extends keyof NonNullable<OCRResult['data']>>(field: K, value: NonNullable<OCRResult['data']>[K]) => void;
  updateItem: (index: number, field: string, value: any) => void;
  deleteItem: (index: number) => void;
};

// Create the store
export const useOCRStore = create<OCRState>((set) => ({
  // Initial state
  stage: 'idle',
  progress: 0,
  error: null,
  originalResult: null,
  editedResult: null,
  savedTransaction: null,
  activeStep: 0,
  uploadMethod: null,
  showPreviewDialog: false,
  showConfirmDialog: false,
  
  // Actions
  setStage: (stage) => set({ stage }),
  setProgress: (progress) => set({ progress }),
  setError: (error) => set({ error }),
  setOriginalResult: (result) => set({ originalResult: result }),
  setEditedResult: (result) => set({ editedResult: result }),
  setSavedTransaction: (transaction) => set({ savedTransaction: transaction }),
  setActiveStep: (step) => set({ activeStep: step }),
  setUploadMethod: (method) => set({ uploadMethod: method }),
  setShowPreviewDialog: (show) => set({ showPreviewDialog: show }),
  setShowConfirmDialog: (show) => set({ showConfirmDialog: show }),
  
  // Reset the store to initial state
  reset: () => set({
    stage: 'idle',
    progress: 0,
    error: null,
    originalResult: null,
    editedResult: null,
    savedTransaction: null,
    activeStep: 0,
    uploadMethod: null,
    showPreviewDialog: false,
    showConfirmDialog: false,
  }),
  
  // Editing actions
  updateField: (field, value) => set((state) => {
    if (!state.editedResult || !state.editedResult.data) return state;
    
    return {
      editedResult: {
        ...state.editedResult,
        data: {
          ...state.editedResult.data,
          [field]: value,
        },
      },
    };
  }),
  
  updateItem: (index, field, value) => set((state) => {
    if (!state.editedResult || !state.editedResult.data || !state.editedResult.data.items) return state;
    
    const updatedItems = [...state.editedResult.data.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
      
      // Recalculate amount if quantity or unitPrice changes
      ...(field === 'quantity' || field === 'unitPrice' ? {
        amount: updatedItems[index].quantity * updatedItems[index].unitPrice,
      } : {}),
    };
    
    // Recalculate total
    const total = updatedItems.reduce((sum, item) => sum + item.amount, 0);
    
    return {
      editedResult: {
        ...state.editedResult,
        data: {
          ...state.editedResult.data,
          items: updatedItems,
          total: total + (state.editedResult.data.taxAmount || 0),
        },
      },
    };
  }),
  
  deleteItem: (index) => set((state) => {
    if (!state.editedResult || !state.editedResult.data || !state.editedResult.data.items) return state;
    
    const updatedItems = state.editedResult.data.items.filter((_, i) => i !== index);
    
    // Recalculate total
    const total = updatedItems.reduce((sum, item) => sum + item.amount, 0);
    
    return {
      editedResult: {
        ...state.editedResult,
        data: {
          ...state.editedResult.data,
          items: updatedItems,
          total: total + (state.editedResult.data.taxAmount || 0),
        },
      },
    };
  }),
}));