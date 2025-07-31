import React from 'react';
import { Box, Paper, Typography, Button, Chip } from '@mui/material';
import { Warning, ArrowForward } from '@mui/icons-material';
import { motion } from 'framer-motion';

export interface DuplicateTransaction {
  id: string;
  date: string;
  vendor: string;
  amount: number;
  similarity: number; // 0-100
}

interface DuplicateWarningProps {
  duplicates: DuplicateTransaction[];
  onViewTransaction: (id: string) => void;
}

const DuplicateWarning: React.FC<DuplicateWarningProps> = ({ duplicates, onViewTransaction }) => {
  if (!duplicates || duplicates.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          mb: 3, 
          borderRadius: 2, 
          bgcolor: 'warning.light',
          border: '1px solid',
          borderColor: 'warning.main'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Warning color="warning" sx={{ mr: 1 }} />
          <Typography variant="subtitle1" color="warning.dark" fontWeight="medium">
            Potential Duplicate{duplicates.length > 1 ? 's' : ''} Detected
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          We found {duplicates.length} similar transaction{duplicates.length > 1 ? 's' : ''} in your records.
          Please review before proceeding.
        </Typography>
        
        {duplicates.map((duplicate) => (
          <Box 
            key={duplicate.id}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              p: 1.5,
              mb: 1,
              bgcolor: 'background.paper',
              borderRadius: 1,
              '&:last-child': { mb: 0 }
            }}
          >
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {duplicate.vendor}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {duplicate.date} • ${duplicate.amount.toFixed(2)}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip 
                label={`${Math.round(duplicate.similarity)}% match`}
                size="small"
                color={duplicate.similarity > 90 ? "error" : "warning"}
                sx={{ mr: 1 }}
              />
              <Button
                size="small"
                endIcon={<ArrowForward />}
                onClick={() => onViewTransaction(duplicate.id)}
              >
                View
              </Button>
            </Box>
          </Box>
        ))}
      </Paper>
    </motion.div>
  );
};

export default DuplicateWarning;