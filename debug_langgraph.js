// Debug script to test LangGraph API response
const API_BASE_URL = 'http://localhost:8000/api';

async function testLangGraphAPI() {
  try {
    console.log('Testing LangGraph API...');
    
    const response = await fetch(`${API_BASE_URL}/ai/process-query/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: "Record a sale of $500 for cash on July 18, 2025",
        company_id: 1
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('LangGraph API Response:');
    console.log(JSON.stringify(data, null, 2));

  } catch (error) {
    console.error('Error testing LangGraph API:', error);
  }
}

testLangGraphAPI();