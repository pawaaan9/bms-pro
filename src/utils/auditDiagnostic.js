// Diagnostic utility to help troubleshoot audit log issues
export const auditDiagnostic = {
  
  // Check if backend is running
  async checkBackendStatus() {
    try {
      const response = await fetch('http://localhost:5000/api/audit/actions', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log('✅ Backend is running and accessible');
        return true;
      } else {
        console.log(`❌ Backend responded with status: ${response.status}`);
        return false;
      }
    } catch (error) {
      console.log('❌ Backend is not accessible:', error.message);
      return false;
    }
  },
  
  // Check authentication token
  checkAuthToken() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    console.log('🔐 Authentication Status:');
    console.log(`   Token exists: ${!!token}`);
    console.log(`   Role: ${role}`);
    console.log(`   Token preview: ${token ? token.substring(0, 20) + '...' : 'None'}`);
    
    return { hasToken: !!token, role };
  },
  
  // Test audit API endpoints
  async testAuditEndpoints() {
    const token = localStorage.getItem('token');
    const baseUrl = 'http://localhost:5000/api';
    
    console.log('🧪 Testing Audit API Endpoints:');
    
    // Test 1: Actions endpoint
    try {
      const actionsResponse = await fetch(`${baseUrl}/audit/actions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log(`   Actions endpoint: ${actionsResponse.status === 200 ? '✅' : '❌'} (${actionsResponse.status})`);
    } catch (error) {
      console.log(`   Actions endpoint: ❌ (${error.message})`);
    }
    
    // Test 2: Target types endpoint
    try {
      const typesResponse = await fetch(`${baseUrl}/audit/target-types`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log(`   Target types endpoint: ${typesResponse.status === 200 ? '✅' : '❌'} (${typesResponse.status})`);
    } catch (error) {
      console.log(`   Target types endpoint: ❌ (${error.message})`);
    }
    
    // Test 3: Audit logs endpoint
    try {
      const logsResponse = await fetch(`${baseUrl}/audit?limit=1`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log(`   Audit logs endpoint: ${logsResponse.status === 200 ? '✅' : '❌'} (${logsResponse.status})`);
      
      if (logsResponse.ok) {
        const data = await logsResponse.json();
        console.log(`   Logs count: ${data.auditLogs?.length || 0}`);
        console.log(`   Total logs: ${data.pagination?.total || 0}`);
      }
    } catch (error) {
      console.log(`   Audit logs endpoint: ❌ (${error.message})`);
    }
    
    // Test 4: Stats endpoint
    try {
      const statsResponse = await fetch(`${baseUrl}/audit/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log(`   Stats endpoint: ${statsResponse.status === 200 ? '✅' : '❌'} (${statsResponse.status})`);
    } catch (error) {
      console.log(`   Stats endpoint: ❌ (${error.message})`);
    }
  },
  
  // Run full diagnostic
  async runFullDiagnostic() {
    console.log('🔍 Running Audit System Diagnostic...\n');
    
    // Check authentication
    this.checkAuthToken();
    console.log('');
    
    // Check backend status
    const backendRunning = await this.checkBackendStatus();
    console.log('');
    
    if (backendRunning) {
      // Test endpoints
      await this.testAuditEndpoints();
    }
    
    console.log('\n📋 Diagnostic Summary:');
    console.log('   1. Check if backend server is running: npm start (in bmspro-backend directory)');
    console.log('   2. Check if you are logged in with a valid token');
    console.log('   3. Check browser console for any CORS or network errors');
    console.log('   4. Create some audit logs by performing actions in the system');
  }
};

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  window.auditDiagnostic = auditDiagnostic;
}
