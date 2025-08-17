const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testAPI() {
  console.log('🧪 Testing AI Meeting Summarizer API...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health Check:', healthResponse.data);
    
    // Test 2: Generate Summary
    console.log('\n2️⃣ Testing Summary Generation...');
    const summaryResponse = await axios.post(`${BASE_URL}/api/generate-summary`, {
      transcript: `Meeting started at 2:00 PM. John discussed the Q1 results which showed 15% growth. Sarah mentioned the new product launch is scheduled for March. Mike raised concerns about the budget allocation. The team agreed to review the marketing strategy next week.`,
      prompt: 'Summarize in bullet points highlighting key decisions and action items'
    });
    console.log('✅ Summary Generated:', summaryResponse.data.message);
    console.log('📝 Meeting ID:', summaryResponse.data.meetingId);
    
    const meetingId = summaryResponse.data.meetingId;
    
    // Test 3: Get Meeting
    console.log('\n3️⃣ Testing Get Meeting...');
    const meetingResponse = await axios.get(`${BASE_URL}/api/meeting/${meetingId}`);
    console.log('✅ Meeting Retrieved:', meetingResponse.data.id === meetingId ? 'Yes' : 'No');
    
    // Test 4: Update Summary
    console.log('\n4️⃣ Testing Update Summary...');
    const updatedSummary = summaryResponse.data.summary + '\n\n[Edited by test script]';
    const updateResponse = await axios.put(`${BASE_URL}/api/meeting/${meetingId}/summary`, {
      summary: updatedSummary
    });
    console.log('✅ Summary Updated:', updateResponse.data.message);
    
    // Test 5: Get All Meetings
    console.log('\n5️⃣ Testing Get All Meetings...');
    const meetingsResponse = await axios.get(`${BASE_URL}/api/meetings`);
    console.log('✅ Meetings Retrieved:', meetingsResponse.data.length, 'meetings found');
    
    console.log('\n🎉 All API tests passed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('- Health Check: ✅');
    console.log('- Summary Generation: ✅');
    console.log('- Get Meeting: ✅');
    console.log('- Update Summary: ✅');
    console.log('- Get All Meetings: ✅');
    
  } catch (error) {
    console.error('\n❌ API Test Failed:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/api/health`);
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('🔍 Checking if server is running...');
  
  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.error('❌ Server is not running on http://localhost:5000');
    console.log('💡 Please start the server first:');
    console.log('   cd server && npm run dev');
    process.exit(1);
  }
  
  console.log('✅ Server is running!\n');
  await testAPI();
}

main();
