import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Drawer,
  AppBar,
  Toolbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Fab,
  Chip,
  Divider,
  LinearProgress
} from '@mui/material'
import { 
  CloudUpload, 
  CameraAlt, 
  Description, 
  Check, 
  Delete, 
  Visibility, 
  Save, 
  ArrowForward, 
  ArrowBack,
  CompareArrows,
  SmartToy,
  FolderOpen,
  AutoAwesome,
  Analytics,
  Storage,
  Close,
  PictureAsPdf,
  Business,
  AccountBalance,
  AttachMoney,
  List as ListIcon,
  Warning
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { formatCurrency } from '../utils/formatUtils'
import { formatDate } from '../utils/dateUtils'

// Import new components and hooks
import OCRProgressBar from '../components/OCRProgressBar'
import ConfidenceIndicator from '../components/ConfidenceIndicator'
import LoadingSpinner from '../components/LoadingSpinner'
import { useOCRStore } from '../store/ocrStore'
import { useOCRQuery } from '../hooks/useOCRQuery'
import { useAuth } from '../context/AuthContext'
import { OCRResult } from '../services/ocrService'
import { initializeMistralAi } from '../services/mistralAiService'
import { mistralAiConfig, validateMistralConfig } from '../config/mistralAiConfig'

const OCRUpload: React.FC = () => {
  // Use the OCR store for state management
  const {
    stage,
    progress,
    error: storeError,
    originalResult,
    editedResult,
    activeStep,
    uploadMethod,
    showPreviewDialog,
    showConfirmDialog,
    setActiveStep,
    setUploadMethod,
    setShowPreviewDialog,
    setShowConfirmDialog,
    setOriginalResult,
    setEditedResult,
    updateField,
    updateItem,
    deleteItem,
    reset,
    setError,
    setStage
  } = useOCRStore()

  // Use React Query for OCR operations
  const {
    processImage,
    processPdf,
    processText,
    saveResult,
    isProcessing,
    isSaving,
    error: queryError,
  } = useOCRQuery()

  // Get authentication context
  const { user, isLoading: authLoading } = useAuth()

  // Local state for file upload
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [manualText, setManualText] = useState('')  
  const [showSideBySide, setShowSideBySide] = useState(false)
  const [selectedOcrService, setSelectedOcrService] = useState<'mistral' | 'dots'>('mistral')


  // New state for AI PDF browsing
  const [showPdfBrowser, setShowPdfBrowser] = useState(false)
  const [pdfFiles, setPdfFiles] = useState<File[]>([])
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null)
  const [aiProcessingMode, setAiProcessingMode] = useState<'single' | 'batch'>('single')
  const [batchResults, setBatchResults] = useState<Array<{ file: File; result: OCRResult }>>([])
  const [isAiProcessing, setIsAiProcessing] = useState(false)
  const [aiProgress, setAiProgress] = useState(0)
  const [showDatabaseSaveDialog, setShowDatabaseSaveDialog] = useState(false)
  
  // Timer states
  const [processingStartTime, setProcessingStartTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null)
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null)

  // Combine errors from store and query
  const errorMessage = storeError || (queryError instanceof Error ? queryError.message : null)

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  
  // Timer utility functions
  const startTimer = () => {
    const startTime = Date.now()
    setProcessingStartTime(startTime)
    setElapsedTime(0)
    
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      setElapsedTime(elapsed)
      
      // Calculate estimated time remaining based on progress
       const currentProgress = isAiProcessing ? aiProgress : progress
       if (currentProgress > 0 && currentProgress < 100) {
         const estimatedTotal = (elapsed / currentProgress) * 100
         const remaining = Math.max(0, estimatedTotal - elapsed)
         setEstimatedTimeRemaining(remaining)
       }
    }, 1000)
    
    setTimerInterval(interval)
  }
  
  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval)
      setTimerInterval(null)
    }
    setProcessingStartTime(null)
    setElapsedTime(0)
    setEstimatedTimeRemaining(null)
  }
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
   }
   
   // Cleanup timer on component unmount
   useEffect(() => {
     return () => {
       if (timerInterval) {
         clearInterval(timerInterval)
       }
     }
   }, [timerInterval])
   
   // Initialize MistralAI service on component mount
   useEffect(() => {
     const initMistralAi = async () => {
       try {
         // Check if MistralAI API key is available in environment
         const apiKey = import.meta.env.VITE_MISTRAL_API_KEY
         if (apiKey) {
           console.log('🤖 Initializing MistralAI service...')
           await initializeMistralAi({
           apiKey,
           baseUrl: mistralAiConfig.apiEndpoint,
           model: mistralAiConfig.model,
           timeout: mistralAiConfig.timeout
         })
           console.log('✅ MistralAI service initialized successfully')
         } else {
           console.log('⚠️ MistralAI API key not found, using dots.ocr as fallback')
         }
       } catch (error) {
         console.error('❌ Failed to initialize MistralAI:', error)
       }
     }
     
     initMistralAi()
   }, [])
    
  // Timer display component
  const renderProcessingTimer = () => {
    if ((!isAiProcessing && !isProcessing) || !processingStartTime) return null
    
    return (
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2, 
          mb: 2, 
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
           <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
             <SmartToy sx={{ mr: 1 }} />
             {isAiProcessing ? 'AI Processing in Progress' : 'OCR Processing in Progress'}
           </Typography>
           <Chip 
             label={`${isAiProcessing ? aiProgress : progress}%`} 
             size="small" 
             sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
           />
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Elapsed Time</Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
              {formatTime(elapsedTime)}
            </Typography>
          </Box>
          
          {estimatedTimeRemaining !== null && (isAiProcessing ? aiProgress : progress) > 10 && (
             <Box sx={{ textAlign: 'center' }}>
               <Typography variant="body2" sx={{ opacity: 0.9 }}>Est. Remaining</Typography>
               <Typography variant="h5" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                 {formatTime(Math.floor(estimatedTimeRemaining))}
               </Typography>
             </Box>
           )}
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Current Stage</Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {isAiProcessing ? (
                stage || (
                  aiProgress < 30 ? 'Analyzing document structure...' :
                  aiProgress < 60 ? 'Extracting text content...' :
                  aiProgress < 90 ? 'Processing with AI...' : 'Finalizing results...'
                )
              ) : (
                progress < 30 ? 'Initializing OCR...' :
                progress < 60 ? 'Reading document...' :
                progress < 90 ? 'Extracting text...' : 'Finalizing results...'
              )}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ width: '100%' }}>
          <LinearProgress 
            variant="determinate" 
            value={isAiProcessing ? aiProgress : progress} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              bgcolor: 'rgba(255,255,255,0.2)',
              '& .MuiLinearProgress-bar': {
                bgcolor: 'white'
              }
            }} 
          />
        </Box>
        
        <Typography variant="body2" sx={{ mt: 1, opacity: 0.8, textAlign: 'center' }}>
          ⏱️ Processing may take up to 20 minutes. Please keep this tab open.
        </Typography>
      </Paper>
    )
  }

  // New AI PDF processing functions
  const handlePdfBrowse = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf'
    input.multiple = true
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || [])
      setPdfFiles(files)
      setShowPdfBrowser(true)
    }
    input.click()
  }

  const processAiInvoice = async (file: File) => {
    if (!user) {
      setError('Please log in to process invoices with AI.')
      return
    }
    
    setIsAiProcessing(true)
    setAiProgress(0)
    startTimer() // Start the processing timer
    
    try {
      // Enhanced progress tracking with DotsOCR processing info
      const stages = [
        { name: 'Uploading PDF', progress: 10 },
        { name: 'Preparing for DotsOCR Processing', progress: 20 },
        { name: 'DotsOCR AI Processing (This may take up to 5 minutes)', progress: 30 },
      ]

      for (const stage of stages) {
        setStage(stage.name as any)
        setAiProgress(stage.progress)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      // Show processing message
      setStage('DotsOCR AI Processing (Please wait, this may take up to 5 minutes)' as any)
      setAiProgress(50)

      // Process the PDF using selected OCR service
      const result = await processPdf({ file, preferredService: selectedOcrService })
      
      // Check if the result came from simulation mode
      const isSimulationMode = result.metadata?.processingMode === 'simulation' || 
                              result.data?.confidence?.aiProcessing === undefined
      
      if (isSimulationMode) {
        // Show simulation mode notification
        setStage('⚠️ Using Simulation Mode - Backend OCR Service Unavailable' as any)
        setAiProgress(75)
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Add simulation indicator to the result
        result.simulationMode = true
        result.metadata = {
          ...result.metadata,
          processingMode: 'simulation',
          notice: 'This result was generated using simulation data due to backend service unavailability'
        }
      }
      
      // Show completion stages
      setStage('Processing Complete - Preparing Results' as any)
      setAiProgress(90)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setStage('Finalizing Data' as any)
      setAiProgress(100)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Enhanced result with AI-specific metadata
      const enhancedResult = {
        ...result,
        aiEnhanced: true,
        confidence: {
          ...result.data?.confidence,
          aiProcessing: 95,
          invoiceDetection: 98
        },
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          processedAt: new Date().toISOString(),
          aiModel: 'DotsOCR-v1.0'
        }
      }

      // Store the enhanced result in the OCR store using the already available methods
      console.log('🔍 Setting OCR results:', enhancedResult)
      setOriginalResult(enhancedResult)
      setEditedResult(enhancedResult)
      
      setActiveStep(1) // Move to edit step to show the extracted data

      return enhancedResult
    } catch (error) {
      setError(error instanceof Error ? error.message : 'AI processing failed')
      throw error
    } finally {
      setIsAiProcessing(false)
      stopTimer() // Stop the processing timer
    }
  }

  const processBatchPdfs = async () => {
    if (pdfFiles.length === 0) return
    
    setIsAiProcessing(true)
    const results: Array<{ file: File; result: OCRResult }> = []
    
    for (let i = 0; i < pdfFiles.length; i++) {
      const file = pdfFiles[i]
      setAiProgress((i / pdfFiles.length) * 100)
      
      try {
        const result = await processAiInvoice(file)
        results.push({ file, result })
      } catch (error) {
        console.error(`Failed to process ${file.name}:`, error)
      }
    }
    
    setBatchResults(results)
    setIsAiProcessing(false)
    setShowDatabaseSaveDialog(true)
  }

  const saveToSupabase = async (results: Array<{ file: File; result: OCRResult }>) => {
    try {
      // Import the transaction processing service
      const { TransactionProcessingService } = await import('../services/transactionProcessingService')
      const transactionService = new TransactionProcessingService()
      
      for (const { file, result } of results) {
        if (result.data) {
          // Convert OCR result to natural language query for LangGraph processing
          const query = `Process invoice from ${result.data.vendor} dated ${result.data.date} with total amount ${result.data.total} ${result.data.currency || 'USD'}. Items: ${result.data.items?.map(item => `${item.description} (${item.quantity} x ${item.unitPrice})`).join(', ')}`
          
          // Process and save to Supabase
          await transactionService.processQuery(
            query,
            'Numerizam Corp', // Default company name
            'USA', // Default country
            'North America', // Default region
            'current-user-id' // This should come from auth context
          )
        }
      }
      
      setShowConfirmDialog(true)
      setShowDatabaseSaveDialog(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save to database')
    }
  }

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    if (!user) {
      setError('Please log in to process invoices.')
      return
    }

    setFile(selectedFile)
    
    // Create a preview URL for images
    if (selectedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile)
      setPreviewUrl(url)
    } else if (selectedFile.type === 'application/pdf') {
      setPreviewUrl('pdf')
    } else {
      setFile(null)
      setPreviewUrl(null)
    }
  }

  // Handle camera capture
  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const capturedFile = event.target.files?.[0]
    if (!capturedFile) return

    if (!user) {
      setError('Please log in to process invoices.')
      return
    }

    setFile(capturedFile)
    
    // Create a preview URL
    const url = URL.createObjectURL(capturedFile)
    setPreviewUrl(url)
  }

  // Handle manual text input
  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setManualText(event.target.value)
  }

  // Process the uploaded content
  const handleProcess = async () => {
    // Validate input before processing
    if ((!file && uploadMethod !== 'text') || (uploadMethod === 'text' && !manualText.trim())) {
      setError('Please select a file or enter text before processing')
      return
    }

    // Clear any previous errors
    setError(null)
    
    // Start timer for regular OCR processing
    startTimer()

    try {
      if (uploadMethod === 'text') {
        await processText(manualText)
      } else if (file?.type.includes('pdf')) {
        await processPdf({ file, preferredService: selectedOcrService, useFullModel: true })
      } else {
        await processImage({ file: file!, preferredService: selectedOcrService, useFullModel: true })
      }
    } catch (error) {
      console.error('OCR processing error:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred during processing')
    } finally {
      // Stop timer when processing completes
      stopTimer()
    }
  }

  // Handle editing of OCR results - now using the store
  const handleEditField = <K extends keyof NonNullable<OCRResult['data']>>(field: K, value: NonNullable<OCRResult['data']>[K]) => {
    updateField(field, value)
  }

  // Handle editing of item in OCR results - now using the store
  const handleEditItem = (index: number, field: string, value: any) => {
    updateItem(index, field, value)
  }

  // Handle deletion of item in OCR results - now using the store
  const handleDeleteItem = (index: number) => {
    deleteItem(index)
  }

  // Handle review and confirmation
  const handleReview = () => {
    setActiveStep(2)
  }

  // Handle final confirmation and save
  const handleConfirm = async () => {
    if (!editedResult) return

    try {
      // Save the result using React Query
      saveResult(editedResult)
      
      // Show confirmation dialog
      setShowConfirmDialog(true)
    } catch (error) {
      console.error('Error saving transaction:', error)
    }
  }

  // Handle reset to start over
  const handleReset = () => {
    // Reset the store
    reset()
    
    // Reset local state
    setFile(null)
    if (previewUrl && previewUrl !== 'pdf') URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setManualText('')
    setShowSideBySide(false)
  }

  // Enhanced render functions
  const renderAiPdfBrowser = () => (
    <Drawer
      anchor="right"
      open={showPdfBrowser}
      onClose={() => setShowPdfBrowser(false)}
      PaperProps={{ sx: { width: 400 } }}
    >
      <AppBar position="static" color="primary">
        <Toolbar>
          <SmartToy sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            AI Invoice PDF Browser
          </Typography>
          <IconButton color="inherit" onClick={() => setShowPdfBrowser(false)}>
            <Close />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Box sx={{ p: 3 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            AI-powered invoice processing with automatic data extraction and Supabase integration.
          </Typography>
        </Alert>
        
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            ⏱️ Processing Time Notice
          </Typography>
          <Typography variant="body2">
            DotsOCR processing may take up to 20 minutes per document. Please be patient and do not close the browser during processing.
          </Typography>
        </Alert>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Processing Mode</InputLabel>
          <Select
            value={aiProcessingMode}
            onChange={(e) => setAiProcessingMode(e.target.value as 'single' | 'batch')}
          >
            <MenuItem value="single">Single Invoice</MenuItem>
            <MenuItem value="batch">Batch Processing</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          fullWidth
          startIcon={<FolderOpen />}
          onClick={handlePdfBrowse}
          sx={{ mb: 3 }}
        >
          Browse PDF Invoices
        </Button>

        {pdfFiles.length > 0 && (
          <>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Selected Files ({pdfFiles.length})
            </Typography>
            
            <List sx={{ maxHeight: 300, overflow: 'auto', mb: 3 }}>
              {pdfFiles.map((file, index) => (
                <ListItem key={index} divider>
                  <ListItemIcon>
                    <PictureAsPdf color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary={file.name}
                    secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                  />
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedPdfFile(file)
                      processAiInvoice(file)
                      setShowPdfBrowser(false)
                    }}
                  >
                    <AutoAwesome />
                  </IconButton>
                </ListItem>
              ))}
            </List>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<SmartToy />}
                onClick={aiProcessingMode === 'batch' ? processBatchPdfs : () => {
                  if (pdfFiles[0]) {
                    setSelectedPdfFile(pdfFiles[0])
                    processAiInvoice(pdfFiles[0])
                    setShowPdfBrowser(false)
                  }
                }}
                disabled={isAiProcessing}
              >
                {aiProcessingMode === 'batch' ? 'Process All' : 'Process First'}
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => setPdfFiles([])}
              >
                Clear
              </Button>
            </Box>
          </>
        )}

        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" sx={{ mb: 2 }}>
          <Analytics sx={{ mr: 1, verticalAlign: 'middle' }} />
          AI Features
        </Typography>
        
        <List dense>
          <ListItem>
            <ListItemIcon><Check color="success" /></ListItemIcon>
            <ListItemText primary="Automatic invoice detection" />
          </ListItem>
          <ListItem>
            <ListItemIcon><Check color="success" /></ListItemIcon>
            <ListItemText primary="Smart data extraction" />
          </ListItem>
          <ListItem>
            <ListItemIcon><Check color="success" /></ListItemIcon>
            <ListItemText primary="Supabase integration" />
          </ListItem>
          <ListItem>
            <ListItemIcon><Check color="success" /></ListItemIcon>
            <ListItemText primary="Batch processing" />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  )

  const renderDatabaseSaveDialog = () => (
    <Dialog
      open={showDatabaseSaveDialog}
      onClose={() => setShowDatabaseSaveDialog(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Storage sx={{ mr: 2 }} />
          Save to Supabase Database
        </Box>
      </DialogTitle>
      <DialogContent>
        <Alert severity="success" sx={{ mb: 3 }}>
          Successfully processed {batchResults.length} invoice(s) with AI.
        </Alert>
        
        <Typography variant="h6" sx={{ mb: 2 }}>
          Processing Results:
        </Typography>
        
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>File</TableCell>
                <TableCell>Vendor</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {batchResults.map(({ file, result }, index) => (
                <TableRow key={index}>
                  <TableCell>{file.name}</TableCell>
                  <TableCell>{result.data?.vendor || 'Unknown'}</TableCell>
                  <TableCell>{result.data?.date || 'Unknown'}</TableCell>
                  <TableCell align="right">
                    {result.data?.currency || '$'}{result.data?.total || 0}
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label="Ready" 
                      color="success" 
                      size="small" 
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowDatabaseSaveDialog(false)}>
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={() => saveToSupabase(batchResults)}
        >
          Save to Database
        </Button>
      </DialogActions>
    </Dialog>
  )

  // OCR Service Selector
  const renderServiceSelector = () => {
    if (uploadMethod) return null

    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SmartToy /> Choose OCR Service
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                border: selectedOcrService === 'mistral' ? '2px solid' : '1px solid',
                borderColor: selectedOcrService === 'mistral' ? 'primary.main' : 'divider',
                background: selectedOcrService === 'mistral' ? 'primary.light' : 'background.paper',
                '&:hover': { boxShadow: 4 }
              }}
              onClick={() => setSelectedOcrService('mistral')}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <SmartToy sx={{ 
                  fontSize: 40, 
                  color: selectedOcrService === 'mistral' ? 'primary.main' : 'text.secondary',
                  mb: 1 
                }} />
                <Typography variant="h6" gutterBottom>
                  MistralAI (Recommended)
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Fast & accurate AI processing
                </Typography>
                <Chip 
                  label={validateMistralConfig() ? 'Available' : 'API Key Required'} 
                  color={validateMistralConfig() ? 'success' : 'warning'}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                border: selectedOcrService === 'dots' ? '2px solid' : '1px solid',
                borderColor: selectedOcrService === 'dots' ? 'primary.main' : 'divider',
                background: selectedOcrService === 'dots' ? 'primary.light' : 'background.paper',
                '&:hover': { boxShadow: 4 }
              }}
              onClick={() => setSelectedOcrService('dots')}
            >
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <AutoAwesome sx={{ 
                  fontSize: 40, 
                  color: selectedOcrService === 'dots' ? 'primary.main' : 'text.secondary',
                  mb: 1 
                }} />
                <Typography variant="h6" gutterBottom>
                  Dots.OCR
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Traditional OCR processing
                </Typography>
                <Chip 
                  label="45 min timeout" 
                  color="info"
                  size="small"
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    )
  }

  // Enhanced upload method selection with AI option
  const renderUploadMethodSelection = () => {
    if (uploadMethod) return null

    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Choose Upload Method
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card 
                sx={{ 
                  cursor: 'pointer', 
                  height: '100%',
                  '&:hover': { boxShadow: 4 }
                }}
                onClick={() => setUploadMethod('file')}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Upload File
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Upload images or PDF documents
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card 
                sx={{ 
                  cursor: 'pointer', 
                  height: '100%',
                  '&:hover': { boxShadow: 4 }
                }}
                onClick={() => setUploadMethod('camera')}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <CameraAlt sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Camera
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Take a photo of your document
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card 
                sx={{ 
                  cursor: 'pointer', 
                  height: '100%',
                  '&:hover': { boxShadow: 4 }
                }}
                onClick={() => setUploadMethod('text')}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Description sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Manual Entry
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Type or paste document text
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card 
                sx={{ 
                  cursor: 'pointer', 
                  height: '100%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  '&:hover': { boxShadow: 4 }
                }}
                onClick={() => setShowPdfBrowser(true)}
              >
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <SmartToy sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    AI PDF Browser
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Browse & process invoices with AI
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Box>
    )
  }

  // Render upload interface based on selected method
  const renderUploadInterface = () => {
    if (!uploadMethod) return null

    return (
      <Box sx={{ mt: 4 }}>
        {/* Progress Bar */}
        {(isProcessing || isSaving) && (
          <OCRProgressBar 
            currentStage={stage === 'idle' ? 'upload' : stage} 
            progress={progress} 
            error={errorMessage || undefined} 
          />
        )}
        
        <AnimatePresence mode="wait">
          <motion.div
            key={uploadMethod}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {uploadMethod === 'file' && (
              <Box sx={{ textAlign: 'center' }}>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <Button
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ mb: 2 }}
                >
                  Select File
                </Button>
                {file && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Selected: {file.name}
                  </Typography>
                )}
                {previewUrl && file && !file.type.includes('pdf') && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
                    />
                  </Box>
                )}
                {previewUrl && file && file.type.includes('pdf') && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Paper
                      variant="outlined"
                      sx={{ p: 3, display: 'inline-block', borderRadius: '8px' }}
                    >
                      <Description sx={{ fontSize: 60, color: 'primary.main' }} />
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        PDF Document
                      </Typography>
                    </Paper>
                  </Box>
                )}
              </Box>
            )}

            {uploadMethod === 'camera' && (
              <Box sx={{ textAlign: 'center' }}>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: 'none' }}
                  ref={cameraInputRef}
                  onChange={handleCameraCapture}
                />
                <Button
                  variant="outlined"
                  startIcon={<CameraAlt />}
                  onClick={() => cameraInputRef.current?.click()}
                  sx={{ mb: 2 }}
                >
                  Capture Image
                </Button>
                {previewUrl && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
                    />
                  </Box>
                )}
              </Box>
            )}

            {uploadMethod === 'text' && (
              <Box>
                <TextField
                  multiline
                  rows={10}
                  fullWidth
                  placeholder="Paste or type the text from your receipt or invoice here..."
                  value={manualText}
                  onChange={handleTextChange}
                  variant="outlined"
                />
              </Box>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Processing Info */}
        {uploadMethod && (
          <Box sx={{ mt: 2, mb: 2 }}>
            <Alert severity="info" sx={{ mt: 1 }}>
              {validateMistralConfig() ? (
                <>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SmartToy fontSize="small" />
                    MistralAI Document Processing (Fast & Accurate)
                  </Typography>
                  <Typography variant="body2">
                    Using MistralAI for intelligent document analysis. Faster processing with high accuracy for invoices, POs, PRs, and accounting queries.
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    Full Model OCR Processing (45 minute timeout)
                  </Typography>
                  <Typography variant="body2">
                    Using advanced AI model for maximum accuracy. Processing may take up to 45 minutes for complex documents.
                  </Typography>
                </>
              )}
            </Alert>
          </Box>
        )}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={() => setUploadMethod(null)}
            disabled={isProcessing}
          >
            Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleProcess}
            disabled={isProcessing || 
              (uploadMethod === 'file' && !file) || 
              (uploadMethod === 'camera' && !file) || 
              (uploadMethod === 'text' && !manualText.trim())}
            startIcon={isProcessing ? <LoadingSpinner type="circular" size="small" /> : undefined}
          >
            {isProcessing ? 'Processing...' : 'Process'}
          </Button>
        </Box>

        {errorMessage && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errorMessage}
          </Alert>
        )}
      </Box>
    )
  }

  // Render comprehensive review and edit interface
  const renderReviewInterface = () => {
    if (!editedResult || !editedResult.data) {
      return null
    }

    const data = editedResult.data
    const isSimulationMode = editedResult.simulationMode || editedResult.metadata?.processingMode === 'simulation'

    return (
      <Box sx={{ mt: 3 }}>
        {/* Simulation Mode Alert */}
        {isSimulationMode && (
          <Alert 
            severity="warning" 
            sx={{ mb: 3 }}
            icon={<Warning />}
          >
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              ⚠️ Simulation Mode Active
            </Typography>
            <Typography variant="body2">
              The OCR backend service is currently unavailable. This data was generated using simulation mode for demonstration purposes. 
              Please verify all information before saving.
            </Typography>
          </Alert>
        )}
        {/* Supplier Information Section */}
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Business /> Supplier Information
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Supplier Name"
                fullWidth
                value={data.supplier_name || data.vendor || ''}
                onChange={(e) => handleEditField('supplier_name', e.target.value)}
                margin="normal"
                size="small"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Supplier Email"
                fullWidth
                value={data.supplier_email || ''}
                onChange={(e) => handleEditField('supplier_email', e.target.value)}
                margin="normal"
                size="small"
                variant="outlined"
                type="email"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Supplier Address"
                fullWidth
                multiline
                rows={2}
                value={data.supplier_address || ''}
                onChange={(e) => handleEditField('supplier_address', e.target.value)}
                margin="normal"
                size="small"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Bank Details"
                fullWidth
                multiline
                rows={2}
                value={data.supplier_bank_details || ''}
                onChange={(e) => handleEditField('supplier_bank_details', e.target.value)}
                margin="normal"
                size="small"
                variant="outlined"
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Document Information Section */}
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Description /> Document Information
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Document Title"
                fullWidth
                value={data.document_title || 'Invoice'}
                onChange={(e) => handleEditField('document_title', e.target.value)}
                margin="normal"
                size="small"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Invoice Number"
                fullWidth
                value={data.invoice_number || data.invoiceNumber || ''}
                onChange={(e) => handleEditField('invoice_number', e.target.value)}
                margin="normal"
                size="small"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Date (DD-MM-YYYY)"
                fullWidth
                value={data.date || ''}
                onChange={(e) => handleEditField('date', e.target.value)}
                margin="normal"
                size="small"
                variant="outlined"
                placeholder="DD-MM-YYYY"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Work Order Number"
                fullWidth
                value={data.work_order_number || data.metadata?.workOrderNumber || ''}
                onChange={(e) => handleEditField('work_order_number', e.target.value)}
                margin="normal"
                size="small"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Purchase Order Number"
                fullWidth
                value={data.purchase_order_number || ''}
                onChange={(e) => handleEditField('purchase_order_number', e.target.value)}
                margin="normal"
                size="small"
                variant="outlined"
              />
            </Grid>
          </Grid>
        </Paper>

        {/* NEPCS Company Information Section */}
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountBalance /> NEPCS Company Information
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="NEPCS Company Name"
                fullWidth
                value={data.nepcs_company_name || 'China Northeast Electric Power Engineering & Services Co., Ltd.'}
                onChange={(e) => handleEditField('nepcs_company_name', e.target.value)}
                margin="normal"
                size="small"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Project Name"
                fullWidth
                value={data.project_name || ''}
                onChange={(e) => handleEditField('project_name', e.target.value)}
                margin="normal"
                size="small"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="NEPCS Address"
                fullWidth
                multiline
                rows={2}
                value={data.nepcs_address || ''}
                onChange={(e) => handleEditField('nepcs_address', e.target.value)}
                margin="normal"
                size="small"
                variant="outlined"
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Financial Information Section */}
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AttachMoney /> Financial Information
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Subtotal"
                fullWidth
                value={data.subtotal || 0}
                onChange={(e) => handleEditField('subtotal', parseFloat(e.target.value) || 0)}
                margin="normal"
                size="small"
                variant="outlined"
                type="number"
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>{data.currency || 'USD'}</span>
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Tax Amount"
                fullWidth
                value={data.tax_amount || 0}
                onChange={(e) => handleEditField('tax_amount', parseFloat(e.target.value) || 0)}
                margin="normal"
                size="small"
                variant="outlined"
                type="number"
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>{data.currency || 'USD'}</span>
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="VAT Amount"
                fullWidth
                value={data.vat_amount || 0}
                onChange={(e) => handleEditField('vat_amount', parseFloat(e.target.value) || 0)}
                margin="normal"
                size="small"
                variant="outlined"
                type="number"
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>{data.currency || 'USD'}</span>
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Total Amount"
                fullWidth
                value={data.total_amount || data.total || 0}
                onChange={(e) => handleEditField('total_amount', parseFloat(e.target.value) || 0)}
                margin="normal"
                size="small"
                variant="outlined"
                type="number"
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8, fontWeight: 'bold' }}>{data.currency || 'USD'}</span>
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'primary.main',
                      borderWidth: 2
                    }
                  }
                }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Items Table Section */}
        {data.items && data.items.length > 0 && (
          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ListIcon /> Itemized List
            </Typography>
            
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Sl. No.</th>
                    <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Item Name</th>
                    <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>Quantity</th>
                    <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right' }}>Unit Price</th>
                    <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item, index) => (
                    <tr key={index}>
                      <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>{item.sl_no || index + 1}</td>
                      <td style={{ padding: '12px', border: '1px solid #ddd' }}>{item.name || ''}</td>
                      <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center' }}>{item.quantity || 0}</td>
                      <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right' }}>{data.currency} {item.unit_price || 0}</td>
                      <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right' }}>{data.currency} {item.amount || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Paper>
        )}

        {/* Confidence Scores */}
        {data.confidence && (
          <Paper variant="outlined" sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
            <Typography variant="h6" gutterBottom color="primary">
              Extraction Confidence Scores
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(data.confidence).map(([key, value]) => (
                <Grid item xs={6} sm={4} md={3} key={key}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      {key.replace('_', ' ').toUpperCase()}
                    </Typography>
                    <Typography variant="h6" color={value > 80 ? 'success.main' : value > 60 ? 'warning.main' : 'error.main'}>
                      {value}%
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={() => setActiveStep(0)}
            startIcon={<ArrowBack />}
          >
            Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleReview}
            endIcon={<ArrowForward />}
            size="large"
          >
            Continue to Review
          </Button>
        </Box>
      </Box>
    )
  }

  // Render final review interface (simplified for brevity)
  const renderFinalReview = () => {
    if (!editedResult || !editedResult.data) return null

    return (
      <Box sx={{ mt: 3 }}>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Review Transaction
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Vendor
              </Typography>
              <Typography variant="body1">
                {editedResult.data.vendor || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Total Amount
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {formatCurrency(editedResult.data.total || 0)}
              </Typography>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={() => setActiveStep(1)}
            >
              Back to Edit
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirm}
              disabled={isSaving}
              startIcon={isSaving ? <LoadingSpinner type="circular" size="small" /> : <Save />}
            >
              {isSaving ? 'Processing...' : 'Confirm & Save'}
            </Button>
          </Box>
        </Paper>
      </Box>
    )
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        OCR Document Processing
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Upload receipts, invoices, or other financial documents to automatically extract and process the information.
      </Typography>
      {!user && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Please log in to process invoices and save transactions to your account.
        </Alert>
      )}

      <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          <Step>
            <StepLabel>Upload</StepLabel>
          </Step>
          <Step>
            <StepLabel>Extract & Edit</StepLabel>
          </Step>
          <Step>
            <StepLabel>Review & Confirm</StepLabel>
          </Step>
        </Stepper>

        {/* Processing Timer Display */}
        {renderProcessingTimer()}

        {activeStep === 0 && (
          <>
            {renderServiceSelector()}
            {renderUploadMethodSelection()}
            {renderUploadInterface()}
          </>
        )}

        {activeStep === 1 && (
          <>
    
            {renderReviewInterface()}
          </>
        )}

        {activeStep === 2 && renderFinalReview()}
      </Paper>

      {/* AI PDF Browser Drawer */}
      {renderAiPdfBrowser()}

      {/* Database Save Dialog */}
      {renderDatabaseSaveDialog()}

      {/* Floating Action Button for Quick AI Access */}
      <Fab
        color="secondary"
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
        onClick={() => setShowPdfBrowser(true)}
      >
        <SmartToy />
      </Fab>

      {/* Original Text Preview Dialog */}
      <Dialog
        open={showPreviewDialog}
        onClose={() => setShowPreviewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Original Document Text</DialogTitle>
        <DialogContent>
          <Paper variant="outlined" sx={{ p: 2, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
            {editedResult?.text || 'No text available'}
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreviewDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Transaction Saved</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'success.light',
                  color: 'success.contrastText',
                  mb: 2,
                }}
              >
                <Check sx={{ fontSize: 40 }} />
              </Box>
            </motion.div>
            <Typography variant="h6" gutterBottom>
              Transaction Successfully Saved
            </Typography>
            <Typography variant="body1" align="center">
              The transaction has been processed and saved to your accounting records.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleReset}>
            Process Another Document
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setShowConfirmDialog(false)
              handleReset()
            }}
          >
            View Transaction
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default OCRUpload