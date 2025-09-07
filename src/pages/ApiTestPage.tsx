import React, { useState } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import {
  propertiesApi,
  unitsApi,
  leasesApi,
  paymentsApi,
  maintenanceApi,
  tasksApi,
  reportsApi,
  dashboardApi,
  notificationsApi
} from '../services/api.ts';

function ApiTestPage() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const [selectedTest, setSelectedTest] = useState('');

  const navItems = [
    { path: '/admin', label: 'Dashboard', active: false },
    { path: '/admin/api-test', label: 'API Test', active: true },
    { path: '/admin/users', label: 'Users' },
    { path: '/admin/security', label: 'Security' }
  ];

  const tests = [
    {
      id: 'properties',
      name: 'Properties API',
      tests: [
        { name: 'Get All Properties', fn: () => propertiesApi.getAll() },
        { name: 'Create Property', fn: () => propertiesApi.create({
          name: 'Test Property',
          address: '123 Test St',
          type: 'apartment',
          totalUnits: 10,
          occupiedUnits: 8,
          amenities: ['pool', 'parking']
        }) }
      ]
    },
    {
      id: 'units',
      name: 'Units API',
      tests: [
        { name: 'Get All Units', fn: () => unitsApi.getAll() },
        { name: 'Create Unit', fn: () => unitsApi.create({
          unitNumber: 'Test-1',
          propertyId: '507f1f77bcf86cd799439011',
          rent: 5000,
          bedrooms: 1,
          bathrooms: 1,
          sqft: 500,
          status: 'vacant'
        }) }
      ]
    },
    {
      id: 'leases',
      name: 'Leases API',
      tests: [
        { name: 'Get All Leases', fn: () => leasesApi.getAll() },
        { name: 'Create Lease', fn: () => leasesApi.create({
          tenantId: '507f1f77bcf86cd799439012',
          unitId: '507f1f77bcf86cd799439013',
          propertyId: '507f1f77bcf86cd799439014',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          monthlyRent: 5000,
          deposit: 10000,
          status: 'active'
        }) }
      ]
    },
    {
      id: 'payments',
      name: 'Payments API',
      tests: [
        { name: 'Get All Payments', fn: () => paymentsApi.getAll() },
        { name: 'Create Payment', fn: () => paymentsApi.create({
          tenantId: '507f1f77bcf86cd799439012',
          leaseId: '507f1f77bcf86cd799439015',
          amount: 5000,
          dueDate: '2024-09-01',
          status: 'pending',
          type: 'rent'
        }) }
      ]
    },
    {
      id: 'maintenance',
      name: 'Maintenance API',
      tests: [
        { name: 'Get All Requests', fn: () => maintenanceApi.getAll() },
        { name: 'Create Request', fn: () => maintenanceApi.create({
          tenantId: '507f1f77bcf86cd799439012',
          unitId: '507f1f77bcf86cd799439013',
          propertyId: '507f1f77bcf86cd799439014',
          title: 'Test Maintenance Request',
          description: 'Test description',
          priority: 'medium'
        }) }
      ]
    },
    {
      id: 'tasks',
      name: 'Tasks API',
      tests: [
        { name: 'Get All Tasks', fn: () => tasksApi.getAll() },
        { name: 'Create Task', fn: () => tasksApi.create({
          caretakerId: '507f1f77bcf86cd799439016',
          propertyId: '507f1f77bcf86cd799439014',
          title: 'Test Task',
          description: 'Test task description',
          dueDate: '2024-09-10',
          priority: 'medium'
        }) }
      ]
    },
    {
      id: 'dashboard',
      name: 'Dashboard API',
      tests: [
        { name: 'Get Dashboard Stats', fn: () => dashboardApi.getStats() }
      ]
    }
  ];

  const runTest = async (testId, testName, testFn) => {
    setLoading(prev => ({ ...prev, [testId]: true }));
    try {
      const result = await testFn();
      setResults(prev => ({
        ...prev,
        [testId]: {
          ...prev[testId],
          [testName]: { success: true, data: result }
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [testId]: {
          ...prev[testId],
          [testName]: { success: false, error: error.message }
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [testId]: false }));
    }
  };

  const runAllTests = async () => {
    for (const testGroup of tests) {
      for (const test of testGroup.tests) {
        await runTest(testGroup.id, test.name, test.fn);
      }
    }
  };

  return (
    <div className="app-container mobile-only">
      <TopNav showLogout={true} />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">API Testing</div>
          <div className="page-subtitle">Test all API endpoints</div>
        </div>

        <div className="test-controls">
          <button 
            className="btn btn-primary"
            onClick={runAllTests}
            disabled={Object.keys(loading).some(key => loading[key])}
          >
            Run All Tests
          </button>
        </div>

        <div className="test-groups">
          {tests.map((testGroup) => (
            <div key={testGroup.id} className="test-group">
              <h3>{testGroup.name}</h3>
              <div className="test-items">
                {testGroup.tests.map((test) => (
                  <div key={test.name} className="test-item">
                    <div className="test-info">
                      <span className="test-name">{test.name}</span>
                      {loading[testGroup.id] && (
                        <span className="loading-indicator">Testing...</span>
                      )}
                    </div>
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => runTest(testGroup.id, test.name, test.fn)}
                      disabled={loading[testGroup.id]}
                    >
                      Test
                    </button>
                    {results[testGroup.id]?.[test.name] && (
                      <div className={`test-result ${results[testGroup.id][test.name].success ? 'success' : 'error'}`}>
                        {results[testGroup.id][test.name].success ? 'PASS' : 'FAIL'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {results[testGroup.id] && (
                <div className="test-results">
                  <h4>Results:</h4>
                  {Object.entries(results[testGroup.id]).map(([testName, result]) => (
                    <div key={testName} className="result-item">
                      <strong>{testName}:</strong>
                      {result.success ? (
                        <pre className="result-success">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      ) : (
                        <div className="result-error">
                          Error: {result.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default ApiTestPage;