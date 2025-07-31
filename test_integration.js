// Test script to verify the complete frontend integration
const testQuery = async () => {
  try {
    console.log('Testing LangGraph API integration...');
    
    // Test the LangGraph API directly
    const langGraphResponse = await fetch('http://localhost:8000/api/ai/process-query/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'Record a sale of $500 for cash on July 18, 2025',
        company_id: 1
      })
    });
    
    const langGraphData = await langGraphResponse.json();
    console.log('LangGraph API Response:', JSON.stringify(langGraphData, null, 2));
    
    if (langGraphData.success) {
      console.log('\n✅ LangGraph API is working correctly');
      
      // Test fetching chart of accounts data for the entries
      const debitEntryId = langGraphData.debit_entry_id;
      const creditEntryId = langGraphData.credit_entry_id;
      
      console.log(`\nFetching chart of accounts data for entries: ${debitEntryId}, ${creditEntryId}`);
      
      // Fetch general ledger entries
      const debitEntryResponse = await fetch(`http://localhost:8000/api/general-ledger/${debitEntryId}/`);
      const creditEntryResponse = await fetch(`http://localhost:8000/api/general-ledger/${creditEntryId}/`);
      
      if (debitEntryResponse.ok && creditEntryResponse.ok) {
        const debitEntry = await debitEntryResponse.json();
        const creditEntry = await creditEntryResponse.json();
        
        console.log('Debit Entry Account Key:', debitEntry.account);
        console.log('Credit Entry Account Key:', creditEntry.account);
        
        // Fetch chart of accounts data
        const debitAccountResponse = await fetch(`http://localhost:8000/api/chart-of-accounts/${debitEntry.account}/`);
        const creditAccountResponse = await fetch(`http://localhost:8000/api/chart-of-accounts/${creditEntry.account}/`);
        
        if (debitAccountResponse.ok && creditAccountResponse.ok) {
          const debitAccount = await debitAccountResponse.json();
          const creditAccount = await creditAccountResponse.json();
          
          console.log('\nChart of Accounts Data:');
          console.log('Debit Account:', JSON.stringify(debitAccount, null, 2));
          console.log('Credit Account:', JSON.stringify(creditAccount, null, 2));
          
          // Simulate the frontend transformation
          const chartOfAccountsData = [
            {
              account_key: debitAccount.account_key,
              report: debitAccount.report || 'Balance Sheet',
              class: debitAccount.class_name || '',
              subclass: debitAccount.sub_class || debitAccount.class_name || '',
              subclass2: debitAccount.sub_class2 || debitAccount.sub_class || debitAccount.class_name || '',
              account: debitAccount.account,
              subaccount: debitAccount.sub_account || debitAccount.account
            },
            {
              account_key: creditAccount.account_key,
              report: creditAccount.report || 'Balance Sheet',
              class: creditAccount.class_name || '',
              subclass: creditAccount.sub_class || creditAccount.class_name || '',
              subclass2: creditAccount.sub_class2 || creditAccount.sub_class || creditAccount.class_name || '',
              account: creditAccount.account,
              subaccount: creditAccount.sub_account || creditAccount.account
            }
          ];
          
          console.log('\n✅ Expected Frontend Chart of Accounts Data:');
          console.log(JSON.stringify(chartOfAccountsData, null, 2));
          
          console.log('\n🎉 Integration test completed successfully!');
          console.log('The frontend should now be able to process the query without validation errors.');
        } else {
          console.log('❌ Failed to fetch chart of accounts data');
        }
      } else {
        console.log('❌ Failed to fetch general ledger entries');
      }
    } else {
      console.log('❌ LangGraph API failed:', langGraphData.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testQuery();