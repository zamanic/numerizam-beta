import React, { useState, useRef } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  CircularProgress,
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
  Alert
} from '@mui/material'
import { CloudUpload, CameraAlt, Description, Check, Delete, Visibility, Save, ArrowForward, CompareArrows } from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { formatCurrency } from '../utils/formatUtils'
import { formatDate } from '../utils/dateUtils'

// Import new components and hooks
import OCRProgressBar from '../components/OCRProgressBar'
import ConfidenceIndicator from '../components/ConfidenceIndicator'
// import DuplicateWarning from '../components/DuplicateWarning' // Commented out as duplicate functionality is not implemented
import { useOCRStore } from '../store/ocrStore'
import { useOCRQuery } from '../hooks/useOCRQuery'
import { OCRResult } from '../services/ocrService'

const OCRUpload = () => {
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

  // Combine errors from store and query
  const errorMessage = storeError || (queryError instanceof Error ? queryError.message : null)

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

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
      // For PDFs, we just show an icon, but we set the preview URL to a non-null value
      // to indicate that we have a preview
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
    if ((!file && uploadMethod !== 'text') || (uploadMethod === 'text' && !manualText.trim())) {
      return
    }

    try {
      if (uploadMethod === 'text') {
        processText(manualText)
      } else if (file?.type.includes('pdf')) {
        processPdf(file)
      } else {
        processImage(file!)
      }
    } catch (error) {
      console.error('OCR processing error:', error)
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
  
  // Handle duplicate transaction viewing - placeholder for future implementation
  // const handleViewDuplicate = (id: string) => {
  //   console.log('View duplicate transaction:', id)
  // }

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
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setManualText('')
    setShowSideBySide(false)
  }

  // Render upload method selection
  const renderUploadMethodSelection = () => (
    <Grid container spacing={3} justifyContent="center">
      <Grid item xs={12} md={4}>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
          <Card 
            variant="outlined" 
            sx={{
              p: 2,
              height: '100%',
              cursor: 'pointer',
              borderColor: uploadMethod === 'file' ? 'primary.main' : 'divider',
              bgcolor: uploadMethod === 'file' ? 'primary.light' : 'background.paper',
              opacity: uploadMethod === null || uploadMethod === 'file' ? 1 : 0.6,
            }}
            onClick={() => setUploadMethod('file')}
          >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <CloudUpload sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Upload File
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Upload an image or PDF of your receipt or invoice
              </Typography>
            </CardContent>
          </Card>
        </motion.div>
      </Grid>

      <Grid item xs={12} md={4}>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
          <Card 
            variant="outlined" 
            sx={{
              p: 2,
              height: '100%',
              cursor: 'pointer',
              borderColor: uploadMethod === 'camera' ? 'primary.main' : 'divider',
              bgcolor: uploadMethod === 'camera' ? 'primary.light' : 'background.paper',
              opacity: uploadMethod === null || uploadMethod === 'camera' ? 1 : 0.6,
            }}
            onClick={() => setUploadMethod('camera')}
          >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <CameraAlt sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Take Photo
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Use your camera to capture a receipt or invoice
              </Typography>
            </CardContent>
          </Card>
        </motion.div>
      </Grid>

      <Grid item xs={12} md={4}>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
          <Card 
            variant="outlined" 
            sx={{
              p: 2,
              height: '100%',
              cursor: 'pointer',
              borderColor: uploadMethod === 'text' ? 'primary.main' : 'divider',
              bgcolor: uploadMethod === 'text' ? 'primary.light' : 'background.paper',
              opacity: uploadMethod === null || uploadMethod === 'text' ? 1 : 0.6,
            }}
            onClick={() => setUploadMethod('text')}
          >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Description sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Manual Entry
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Paste or type the text from your receipt or invoice
              </Typography>
            </CardContent>
          </Card>
        </motion.div>
      </Grid>
    </Grid>
  )

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
          >
            Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleProcess}
            disabled={isProcessing}
            startIcon={isProcessing ? <CircularProgress size={20} /> : undefined}
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

  // Render review and edit interface
  const renderReviewInterface = () => {
    if (!editedResult || !editedResult.data) return null

    return (
      <Box sx={{ mt: 3 }}>
        {/* Show duplicate warnings if any */}
        {/* Duplicate detection functionality would need to be implemented separately */}
        
        {/* Toggle for side-by-side view */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<CompareArrows />}
            onClick={() => setShowSideBySide(!showSideBySide)}
            size="small"
          >
            {showSideBySide ? 'Standard View' : 'Side-by-Side View'}
          </Button>
        </Box>
        
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Extracted Information
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Review and edit the extracted information below.
          </Typography>

          {showSideBySide ? (
            // Side-by-side view
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, height: '100%' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Original Document
                  </Typography>
                  {previewUrl && !file?.type.includes('pdf') ? (
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                      <img
                        src={previewUrl}
                        alt="Preview"
                        style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
                      />
                    </Box>
                  ) : (
                    <Paper
                      variant="outlined"
                      sx={{ p: 2, whiteSpace: 'pre-wrap', fontFamily: 'monospace', mb: 2, maxHeight: '300px', overflow: 'auto' }}
                    >
                      {originalResult?.text || 'No text available'}
                    </Paper>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Extracted Data
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Vendor"
                        fullWidth
                        value={editedResult.data.vendor || ''}
                        onChange={(e) => handleEditField('vendor', e.target.value)}
                        margin="normal"
                        size="small"
                        InputProps={{}}
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
                        InputProps={{}}
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
                        InputProps={{}}
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
                        InputProps={{ 
                          startAdornment: editedResult.data.currency ? editedResult.data.currency : '$'
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          ) : (
            // Standard view
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Vendor"
                  fullWidth
                  value={editedResult.data.vendor || ''}
                  onChange={(e) => handleEditField('vendor', e.target.value)}
                  margin="normal"
                  size="small"
                  InputProps={{}}
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
                  InputProps={{}}
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
                  InputProps={{}}
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
                  InputProps={{ 
                    startAdornment: editedResult.data.currency ? editedResult.data.currency : '$'
                  }}
                />
              </Grid>
            </Grid>
          )}

          <Typography variant="subtitle1" sx={{ mt: 4, mb: 2 }}>
            Line Items
          </Typography>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {editedResult.data.items?.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        fullWidth
                        value={item.description}
                        onChange={(e) => handleEditItem(index, 'description', e.target.value)}
                        size="small"
                        variant="standard"
                        InputProps={{
                          endAdornment: item.confidence !== undefined && (
                            <ConfidenceIndicator score={item.confidence} size="small" />
                          )
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        value={item.quantity}
                        onChange={(e) => handleEditItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        size="small"
                        variant="standard"
                        type="number"
                        sx={{ width: 70 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        value={item.unitPrice}
                        onChange={(e) => handleEditItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        size="small"
                        variant="standard"
                        type="number"
                        sx={{ width: 100 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(item.amount)}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="error" onClick={() => handleDeleteItem(index)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {(!editedResult.data.items || editedResult.data.items.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="textSecondary">
                        No line items found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {editedResult.text && (
            <Box sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                startIcon={<Visibility />}
                onClick={() => setShowPreviewDialog(true)}
                size="small"
              >
                View Original Text
              </Button>
            </Box>
          )}

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

  // Render final review interface
  const renderFinalReview = () => {
    if (!editedResult || !editedResult.data) return null

    return (
      <Box sx={{ mt: 3 }}>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Review Transaction
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Please review the transaction details before confirming.
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
                Date
              </Typography>
              <Typography variant="body1">
                {editedResult.data.date ? formatDate(new Date(editedResult.data.date)) : 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Invoice Number
              </Typography>
              <Typography variant="body1">
                {editedResult.data.invoiceNumber || 'N/A'}
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

          {editedResult.data.items && editedResult.data.items.length > 0 && (
            <>
              <Typography variant="subtitle1" sx={{ mt: 4, mb: 2 }}>
                Line Items
              </Typography>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {editedResult.data.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell align="right">{formatCurrency(item.amount)}</TableCell>
                      </TableRow>
                    ))}
                    {editedResult.data.taxAmount && (
                      <TableRow>
                        <TableCell colSpan={3} align="right">
                          <Typography variant="body2">Tax:</Typography>
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(editedResult.data.taxAmount)}
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell colSpan={3} align="right">
                        <Typography variant="subtitle2">Total:</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle2">
                          {formatCurrency(editedResult.data.total || 0)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

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
              startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
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
              // In a real app, we would navigate to the transaction details
              // For now, we'll just reset
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