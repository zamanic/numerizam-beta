import React from 'react';
import { Typography, Paper, Container } from '@mui/material';

const AIAssistant: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          AI Assistant
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This page is under development. Please use the Query Page for AI-powered accounting assistance.
        </Typography>
      </Paper>
    </Container>
  );
};

export default AIAssistant;