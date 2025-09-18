import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ReportsDebug = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const [testResults, setTestResults] = useState({});

  const runDiagnostics = async () => {
    const info = {
      hasToken: !!localStorage.getItem('token'),
      tokenValue: localStorage.getItem('token')?.substring(0, 20) + '...',
      userRole: localStorage.getItem('role'),
      apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
      timestamp: new Date().toISOString()
    };

    setDebugInfo(info);

    // Test API connectivity
    const results = {};
    
    // Test 1: Basic connectivity
    try {
      const response = await fetch('http://localhost:5000/api/reports/executive-kpis', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      results.connectivity = {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      };

      if (response.ok) {
        const data = await response.json();
        results.data = {
          hasData: !!data,
          kpisCount: data?.kpis ? Object.keys(data.kpis).length : 0,
          sampleData: data?.kpis ? Object.keys(data.kpis).slice(0, 2) : []
        };
      } else {
        const errorText = await response.text();
        results.error = errorText;
      }
    } catch (error) {
      results.connectivity = {
        error: error.message,
        type: error.name
      };
    }

    // Test 2: Check if backend is running
    try {
      const healthResponse = await fetch('http://localhost:5000/api/bookings/test');
      results.backendHealth = {
        status: healthResponse.status,
        running: healthResponse.ok
      };
    } catch (error) {
      results.backendHealth = {
        running: false,
        error: error.message
      };
    }

    setTestResults(results);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔍 Reports Debug Information
          <Button onClick={runDiagnostics} size="sm" variant="outline">
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Authentication Status</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Token Available: <Badge variant={debugInfo.hasToken ? "default" : "destructive"}>{debugInfo.hasToken ? "Yes" : "No"}</Badge></div>
            <div>User Role: <Badge variant="outline">{debugInfo.userRole || "None"}</Badge></div>
            <div>API URL: <code className="text-xs bg-gray-100 px-1 rounded">{debugInfo.apiBaseUrl}</code></div>
            <div>Last Check: <span className="text-xs text-gray-500">{debugInfo.timestamp}</span></div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Backend Connectivity</h4>
          {testResults.backendHealth ? (
            <div className="space-y-1 text-sm">
              <div>Backend Running: <Badge variant={testResults.backendHealth.running ? "default" : "destructive"}>
                {testResults.backendHealth.running ? "Yes" : "No"}
              </Badge></div>
              {testResults.backendHealth.error && (
                <div className="text-red-600 text-xs">Error: {testResults.backendHealth.error}</div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 text-sm">Testing...</div>
          )}
        </div>

        <div>
          <h4 className="font-semibold mb-2">API Response</h4>
          {testResults.connectivity ? (
            <div className="space-y-1 text-sm">
              <div>Status: <Badge variant={testResults.connectivity.ok ? "default" : "destructive"}>
                {testResults.connectivity.status} {testResults.connectivity.statusText}
              </Badge></div>
              {testResults.data && (
                <div>
                  <div>Has Data: <Badge variant={testResults.data.hasData ? "default" : "secondary"}>
                    {testResults.data.hasData ? "Yes" : "No"}
                  </Badge></div>
                  <div>KPIs Count: {testResults.data.kpisCount}</div>
                  {testResults.data.sampleData.length > 0 && (
                    <div>Sample: {testResults.data.sampleData.join(", ")}</div>
                  )}
                </div>
              )}
              {testResults.error && (
                <div className="text-red-600 text-xs">Error: {testResults.error}</div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 text-sm">Testing...</div>
          )}
        </div>

        <div className="pt-2 border-t">
          <h4 className="font-semibold mb-2">Quick Fixes</h4>
          <div className="space-y-2 text-sm">
            {!debugInfo.hasToken && (
              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                <strong>No Authentication Token:</strong> Please log in again to get a valid token.
              </div>
            )}
            {!testResults.backendHealth?.running && (
              <div className="p-2 bg-red-50 border border-red-200 rounded">
                <strong>Backend Not Running:</strong> Start the backend server with <code>npm start</code> in the bmspro-backend directory.
              </div>
            )}
            {debugInfo.hasToken && testResults.backendHealth?.running && testResults.connectivity?.status === 401 && (
              <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                <strong>Authentication Failed:</strong> Token may be expired. Try logging out and back in.
              </div>
            )}
            {debugInfo.hasToken && testResults.backendHealth?.running && testResults.connectivity?.ok && !testResults.data?.hasData && (
              <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                <strong>No Data Found:</strong> The API is working but no booking data exists in the database for this user.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportsDebug;
