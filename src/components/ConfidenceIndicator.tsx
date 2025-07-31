import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';

interface ConfidenceIndicatorProps {
  score: number; // 0-100
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({ 
  score, 
  size = 'medium', 
  showLabel = false 
}) => {
  // Determine color based on confidence score
  const getColor = (score: number) => {
    if (score >= 90) return '#4caf50'; // Green - high confidence
    if (score >= 70) return '#ffb74d'; // Orange - medium confidence
    return '#f44336'; // Red - low confidence
  };

  // Determine size dimensions
  const getDimensions = (size: string) => {
    switch (size) {
      case 'small': return { width: 40, height: 4, fontSize: 10 };
      case 'large': return { width: 80, height: 8, fontSize: 14 };
      default: return { width: 60, height: 6, fontSize: 12 };
    }
  };

  const { width, height, fontSize } = getDimensions(size);
  const color = getColor(score);

  return (
    <Tooltip title={`AI Confidence: ${score}%`} arrow placement="top">
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box 
          sx={{ 
            width: width, 
            height: height, 
            bgcolor: '#e0e0e0', 
            borderRadius: height, 
            overflow: 'hidden',
            mb: showLabel ? 0.5 : 0
          }}
        >
          <Box 
            sx={{ 
              width: `${score}%`, 
              height: '100%', 
              bgcolor: color,
              transition: 'width 0.5s ease-in-out'
            }} 
          />
        </Box>
        {showLabel && (
          <Typography variant="caption" sx={{ fontSize, color }}>
            {score}%
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
};

export default ConfidenceIndicator;