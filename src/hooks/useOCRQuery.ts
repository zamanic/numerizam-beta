import { useMutation } from '@tanstack/react-query';
import { ocrService, OCRResult } from '../services/ocrService';
import { useOCRStore } from '../store/ocrStore';

// Hook for OCR operations using React Query
export const useOCRQuery = () => {
  // Get state and actions from the OCR store
  const {
    setStage,
    setProgress,
    setError,
    setOriginalResult,
    setEditedResult,
    setSavedTransaction,
    setActiveStep,
  } = useOCRStore();

  // Mutation for processing an image
  const processImageMutation = useMutation({
    mutationFn: async (file: File) => {
      // Start processing
      setStage('upload');
      setProgress(0);
      setError(null);
      
      // Simulate upload progress
      let currentProgress = 0;
      const uploadInterval = setInterval(() => {
        currentProgress += 5;
        if (currentProgress >= 30) {
          clearInterval(uploadInterval);
          setProgress(30);
        } else {
          setProgress(currentProgress);
        }
      }, 200);
      
      // Process the image
      try {
        const result = await ocrService.processImage(file);
        
        // Clear the upload interval
        clearInterval(uploadInterval);
        
        // Poll for progress updates
        pollProgress(result);
        
        return result;
      } catch (error) {
        // Clear the upload interval
        clearInterval(uploadInterval);
        
        // Set error state
        setStage('error');
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
        throw error;
      }
    },
    onSuccess: (result) => {
      // Set the results
      setOriginalResult(result);
      setEditedResult(result);
      
      // Move to the next step
      setActiveStep(1);
    },
  });
  
  // Mutation for processing a PDF
  const processPdfMutation = useMutation({
    mutationFn: async (file: File) => {
      // Start processing
      setStage('upload');
      setProgress(0);
      setError(null);
      
      // Simulate upload progress
      let currentProgress = 0;
      const uploadInterval = setInterval(() => {
        currentProgress += 3;
        if (currentProgress >= 30) {
          clearInterval(uploadInterval);
          setProgress(30);
        } else {
          setProgress(currentProgress);
        }
      }, 200);
      
      // Process the PDF
      try {
        const result = await ocrService.processPdf(file);
        
        // Clear the upload interval
        clearInterval(uploadInterval);
        
        // Poll for progress updates
        pollProgress(result);
        
        return result;
      } catch (error) {
        // Clear the upload interval
        clearInterval(uploadInterval);
        
        // Set error state
        setStage('error');
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
        throw error;
      }
    },
    onSuccess: (result) => {
      // Set the results
      setOriginalResult(result);
      setEditedResult(result);
      
      // Move to the next step
      setActiveStep(1);
    },
  });
  
  // Mutation for processing text
  const processTextMutation = useMutation({
    mutationFn: async (text: string) => {
      // Start processing
      setStage('parsing');
      setProgress(40);
      setError(null);
      
      // Process the text
      try {
        const result = await ocrService.processText(text);
        
        // Poll for progress updates
        pollProgress(result);
        
        return result;
      } catch (error) {
        // Set error state
        setStage('error');
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
        throw error;
      }
    },
    onSuccess: (result) => {
      // Set the results
      setOriginalResult(result);
      setEditedResult(result);
      
      // Move to the next step
      setActiveStep(1);
    },
  });
  
  // Mutation for validating and saving the result
  const saveResultMutation = useMutation({
    mutationFn: async (result: OCRResult) => {
      // Start saving
      setStage('complete');
      setProgress(90);
      setError(null);
      
      // Validate the result
      const validatedResult = await ocrService.validateResult(result);
      
      // Convert to transaction
      const transaction = await ocrService.convertToTransaction(validatedResult);
      
      // For now, just return the transaction without saving to database
      // In a real implementation, you would use supabaseAccountingService.saveTransactionData
      // const saveResult = await supabaseAccountingService.saveTransactionData('user-id', transaction);
      
      // Complete the process
      setProgress(100);
      
      return transaction;
    },
    onSuccess: (transaction) => {
      // Set the saved transaction
      setSavedTransaction(transaction);
    },
  });
  
  // Helper function to poll for progress updates
  const pollProgress = (result: OCRResult) => {
    // If the result already has a stage and progress, use those
    if (result.stage && typeof result.progress === 'number') {
      setStage(result.stage);
      setProgress(result.progress);
      return;
    }
    
    // Otherwise, simulate progress
    let currentProgress = 30;
    const progressInterval = setInterval(() => {
      currentProgress += 5;
      
      if (currentProgress < 50) {
        setStage('ocr');
      } else if (currentProgress < 70) {
        setStage('parsing');
      } else if (currentProgress < 90) {
        setStage('duplicate-check');
      } else {
        setStage('complete');
        clearInterval(progressInterval);
      }
      
      setProgress(Math.min(currentProgress, 100));
      
      if (currentProgress >= 100) {
        clearInterval(progressInterval);
      }
    }, 300);
  };
  
  return {
    processImage: processImageMutation.mutate,
    processPdf: processPdfMutation.mutate,
    processText: processTextMutation.mutate,
    saveResult: saveResultMutation.mutate,
    isProcessing: processImageMutation.isPending || processPdfMutation.isPending || processTextMutation.isPending,
    isSaving: saveResultMutation.isPending,
    error: processImageMutation.error || processPdfMutation.error || processTextMutation.error || saveResultMutation.error,
  };
};