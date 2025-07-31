import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
} from '@mui/material';

// TypeScript interfaces for the component props
export interface ReportData {
  message?: string;
  params?: Record<string, any>;
  [key: string]: any;
}

interface AccountingTableProps {
  data: ReportData;
}

// Helper function to render different types of values
const renderValue = (value: any): React.ReactNode => {
  if (value === null || value === undefined) {
    return <Typography variant="body2" color="text.secondary">-</Typography>;
  }
  
  if (typeof value === 'string') {
    return <Chip label={value} size="small" variant="outlined" />;
  }
  
  if (typeof value === 'number') {
    return <Typography variant="body2">{value.toLocaleString()}</Typography>;
  }
  
  if (typeof value === 'boolean') {
    return <Chip 
      label={value ? 'Yes' : 'No'} 
      size="small" 
      color={value ? 'success' : 'default'} 
    />;
  }
  
  if (Array.isArray(value)) {
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {value.map((item, index) => (
          <Chip key={index} label={String(item)} size="small" variant="outlined" />
        ))}
      </Box>
    );
  }
  
  return <Typography variant="body2">{String(value)}</Typography>;
};

// Component to render a table from array data
const DataTable: React.FC<{ title: string; rows: any[] }> = ({ title, rows }) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }

  const headers = Object.keys(rows[0]);

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
        {title}
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableCell 
                  key={header} 
                  sx={{ 
                    fontWeight: 'bold',
                    backgroundColor: 'grey.100'
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index} hover>
                {headers.map((header) => (
                  <TableCell key={header}>
                    {renderValue(row[header])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

// Component to render key-value pairs
const ParametersTable: React.FC<{ data: Record<string, any> }> = ({ data }) => {
  const entries = Object.entries(data);
  
  if (entries.length === 0) {
    return null;
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }}>
              Parameter
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', backgroundColor: 'grey.100' }}>
              Value
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entries.map(([key, value]) => (
            <TableRow key={key} hover>
              <TableCell sx={{ fontWeight: 'medium' }}>
                {key}
              </TableCell>
              <TableCell>
                {renderValue(value)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Main AccountingTable component
const AccountingTable: React.FC<AccountingTableProps> = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No data available to display.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Display message if present */}
      {data.message && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" color="text.secondary">
            {data.message}
          </Typography>
        </Box>
      )}

      {/* Display parameters if present */}
      {data.params && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Report Parameters
          </Typography>
          <ParametersTable data={data.params} />
        </Box>
      )}

      {/* Display other data sections */}
      {Object.entries(data).map(([sectionTitle, sectionData]) => {
        // Skip message and params as they're handled above
        if (sectionTitle === 'message' || sectionTitle === 'params') {
          return null;
        }

        // Handle array data (tables)
        if (Array.isArray(sectionData)) {
          return (
            <DataTable 
              key={sectionTitle} 
              title={sectionTitle} 
              rows={sectionData} 
            />
          );
        }

        // Handle object data (key-value pairs)
        if (typeof sectionData === 'object' && sectionData !== null) {
          return (
            <Box key={sectionTitle} sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                {sectionTitle}
              </Typography>
              <ParametersTable data={sectionData} />
            </Box>
          );
        }

        // Handle primitive values
        return (
          <Box key={sectionTitle} sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {sectionTitle}: {renderValue(sectionData)}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

export default AccountingTable;
