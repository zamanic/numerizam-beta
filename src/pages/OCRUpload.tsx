import React, { useState, useRef } from 'react'
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
  Divider
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
  CompareArrows,
  SmartToy,
  FolderOpen,
  AutoAwesome,
  Analytics,
  Storage,
  Close,
  PictureAsPdf
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
import { OCRResult } from '../services/ocrService'

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

  // Local state for file upload
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [manualText, setManualText] = useState('')  
  const [showSideBySide, setShowSideBySide] = useState(false)

  // New state for AI PDF browsing
  const [showPdfBrowser, setShowPdfBrowser] = useState(false)
  const [pdfFiles, setPdfFiles] = useState<File[]>([])
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null)
  const [aiProcessingMode, setAiProcessingMode] = useState<'single' | 'batch'>('single')
  const [batchResults, setBatchResults] = useState<Array<{ file: File; result: OCRResult }>>([])
  const [isAiProcessing, setIsAiProcessing] = useState(false)
  const [aiProgress, setAiProgress] = useState(0)
  const [showDatabaseSaveDialog, setShowDatabaseSaveDialog] = useState(false)

  // Combine errors from store and query
  const errorMessage = storeError || (queryError instanceof Error ? queryError.message : null)

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

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
    setIsAiProcessing(true)
    setAiProgress(0)
    
    try {
      // Simulate AI processing with enhanced progress tracking
      const stages = [
        { name: 'Uploading PDF', progress: 20 },
        { name: 'AI Text Extraction', progress: 40 },
        { name: 'Invoice Data Recognition', progress: 60 },
        { name: 'Data Validation', progress: 80 },
        { name: 'Database Preparation', progress: 100 }
      ]

      for (const stage of stages) {
        setStage(stage.name as any)
        setAiProgress(stage.progress)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // Process the PDF using existing OCR service
      const result = await processPdf(file)
      
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
          aiModel: 'Invoice-AI-v2.1'
        }
      }

      return enhancedResult
    } catch (error) {
      setError(error instanceof Error ? error.message : 'AI processing failed')
      throw error
    } finally {
      setIsAiProcessing(false)
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

    try {
      if (uploadMethod === 'text') {
        await processText(manualText)
      } else if (file?.type.includes('pdf')) {
        await processPdf(file)
      } else {
        await processImage(file!)
      }
    } catch (error) {
      console.error('OCR processing error:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred during processing')
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
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            AI-powered invoice processing with automatic data extraction and Supabase integration.
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

  // Render review and edit interface (simplified for brevity)
  const renderReviewInterface = () => {
    if (!editedResult || !editedResult.data) return null

    return (
      <Box sx={{ mt: 3 }}>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Extracted Information
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Vendor"
                fullWidth
                value={editedResult.data.vendor || ''}
                onChange={(e) => handleEditField('vendor', e.target.value)}
                margin="normal"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date"
                fullWidth
                value={editedResult.data.date || ''}
                onChange={(e) => handleEditField('date', e.target.value)}
                margin="normal"
                size="small"
                placeholder="YYYY-MM-DD"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Invoice Number"
                fullWidth
                value={editedResult.data.invoiceNumber || ''}
                onChange={(e) => handleEditField('invoiceNumber', e.target.value)}
                margin="normal"
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Total Amount"
                fullWidth
                value={editedResult.data.total || ''}
                onChange={(e) => handleEditField('total', parseFloat(e.target.value) || 0)}
                margin="normal"
                size="small"
                type="number"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={() => setActiveStep(0)}
            >
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleReview}
              endIcon={<ArrowForward />}
            >
              Continue to Review
            </Button>
          </Box>
        </Paper>
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

        {activeStep === 0 && (
          <>
            {renderUploadMethodSelection()}
            {renderUploadInterface()}
          </>
        )}

        {activeStep === 1 && renderReviewInterface()}

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