import React from 'react';
import { Box, LinearProgress, Typography, Paper, Stepper, Step, StepLabel } from '@mui/material';
import { motion } from 'framer-motion';

// Define the processing stages
export type ProcessingStage = 'upload' | 'ocr' | 'parsing' | 'duplicate-check' | 'complete' | 'error';

interface OCRProgressBarProps {
  currentStage: ProcessingStage;
  progress: number; // 0-100
  error?: string;
}

const OCRProgressBar: React.FC<OCRProgressBarProps> = ({ currentStage, progress, error }) => {
  // Map stages to step indices
  const stageToStepIndex = {
    'upload': 0,
    'ocr': 1,
    'parsing': 2,
    'duplicate-check': 3,
    'complete': 4,
    'error': -1
  };

  const activeStep = stageToStepIndex[currentStage];
  
  // Define stage labels and descriptions
  const stages = [
    { label: 'Upload', description: 'Uploading document...' },
    { label: 'OCR', description: 'Extracting text from document...' },
    { label: 'Parsing', description: 'Identifying fields and values...' },
    { label: 'Duplicate Check', description: 'Checking for similar transactions...' },
    { label: 'Complete', description: 'Processing complete!' },
  ];

  return (
    <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {stages.map((stage, index) => (
          <Step key={stage.label} completed={activeStep > index}>
            <StepLabel>{stage.label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {currentStage !== 'complete' && currentStage !== 'error' && (
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="textSecondary" sx={{ flexGrow: 1 }}>
              {stages[activeStep]?.description || 'Processing...'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {Math.round(progress)}%
            </Typography>
          </Box>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5 }}
          >
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                }
              }} 
            />
          </motion.div>
        </Box>
      )}
      
      {currentStage === 'complete' && (
        <Box sx={{ mt: 3 }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="body1" color="success.main" align="center">
              {stages[4].description}
            </Typography>
          </motion.div>
        </Box>
      )}
      
      {currentStage === 'error' && error && (
        <Box sx={{ mt: 3 }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="body1" color="error" align="center">
              {error}
            </Typography>
          </motion.div>
        </Box>
      )}
    </Paper>
  );
};

export default OCRProgressBar;