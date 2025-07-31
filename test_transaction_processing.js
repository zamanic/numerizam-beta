// Test script to debug transaction processing
import { TransactionProcessingService } from './src/services/transactionProcessingService.js';

async function testTransactionProcessing() {
  try {
    console.log('Creating transaction processing service...');
    const service = new TransactionProcessingService();
    
    console.log('Processing query...');
    const result = await service.processQuery(
      "Record a sale of $500 for cash on July 18, 2025",
      "Test Company",
      "USA",
      "North America"
    );
    
    console.log('Final result:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Error in test:', error);
  }
}

testTransactionProcessing();