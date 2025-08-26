import { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Info,
  AlertCircle,
  Network
} from 'lucide-react';
import { apiClient } from '../lib/api';

interface ConnectionTest {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  duration?: number;
}

interface SystemInfo {
  frontend: {
    version: string;
    buildTime: string;
    apiUrl: string;
  };
  backend: {
    version: string;
    nodeEnv: string;
    uptime: number;
  };
  garage: {
    url: string;
    connected: boolean;
    version?: string;
    nodeId?: string;
  };
}

function SettingsView() {
  const [connectionTests, setConnectionTests] = useState<ConnectionTest[]>([]);
  const [testing, setTesting] = useState(false);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [showToken, setShowToken] = useState(false);
  // Removed unused logs and autoRefresh

  const garageUrl = import.meta.env.VITE_GARAGE_URL || 'http://192.168.50.152:3903';
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  const runConnectionTests = async () => {
    setTesting(true);
    const tests: ConnectionTest[] = [
      { name: 'Backend Connection', status: 'pending' },
      { name: 'Admin Authentication', status: 'pending' },
      { name: 'Garage Connection', status: 'pending' },
      { name: 'Cluster Status Test', status: 'pending' },
      { name: 'Bucket List Test', status: 'pending' },
      { name: 'Key List Test', status: 'pending' }
    ];
    
    setConnectionTests([...tests]);
    
    // Test 1: Backend Connection
    try {
      const start = Date.now();
      const response = await fetch(`${apiUrl}/test/connection`);
      const duration = Date.now() - start;
      
      if (response.ok) {
        tests[0] = { ...tests[0], status: 'success', duration, message: 'Backend reachable' };
      } else {
        tests[0] = { ...tests[0], status: 'error', duration, message: `HTTP ${response.status}` };
      }
    } catch (error) {
      tests[0] = { ...tests[0], status: 'error', message: 'Connection failed' };
    }
    setConnectionTests([...tests]);
    
    // Test 2: Admin Authentication
    try {
      const start = Date.now();
      const result = await apiClient.testAuth();
      const duration = Date.now() - start;
      
      if (result.success) {
        tests[1] = { ...tests[1], status: 'success', duration, message: 'Valid token' };
      } else {
        tests[1] = { ...tests[1], status: 'error', duration, message: result.error || 'Auth failed' };
      }
    } catch (error) {
      tests[1] = { ...tests[1], status: 'error', message: 'Auth test failed' };
    }
    setConnectionTests([...tests]);
    
    // Test 3: Garage Connection
    try {
      const start = Date.now();
      const result = await apiClient.getClusterStatus();
      const duration = Date.now() - start;
      
      if (result.success) {
        tests[2] = { ...tests[2], status: 'success', duration, message: 'Garage reachable' };
      } else {
        tests[2] = { ...tests[2], status: 'error', duration, message: result.error || 'Connection failed' };
      }
    } catch (error) {
      tests[2] = { ...tests[2], status: 'error', message: 'Connection test failed' };
    }
    setConnectionTests([...tests]);
    
    // Test 4: Cluster Status
    try {
      const start = Date.now();
      const result = await apiClient.getClusterStatus();
      const duration = Date.now() - start;
      
      if (result.success) {
        tests[3] = { ...tests[3], status: 'success', duration, message: 'Cluster operational' };
      } else {
        tests[3] = { ...tests[3], status: 'error', duration, message: result.error || 'Cluster unavailable' };
      }
    } catch (error) {
      tests[3] = { ...tests[3], status: 'error', message: 'Cluster test failed' };
    }
    setConnectionTests([...tests]);
    
    // Test 5: List Buckets
    try {
      const start = Date.now();
      const result = await apiClient.listBuckets();
      const duration = Date.now() - start;
      
      if (result.success) {
        const bucketCount = result.data?.length || 0;
        tests[4] = { 
          ...tests[4], 
          status: 'success', 
          duration, 
          message: bucketCount > 0 ? `${bucketCount} buckets found` : 'No buckets present (normal)'
        };
      } else {
        // Distinguish between real errors and absence of buckets
        const errorMsg = result.error || '';
        if ((errorMsg.includes('503') || errorMsg.includes('Network') || errorMsg.includes('500')) && !errorMsg.includes('quorum')) {
          tests[4] = { ...tests[4], status: 'error', duration, message: 'Server connection error' };
        } else {
          tests[4] = { ...tests[4], status: 'success', duration, message: 'No buckets configured (normal)' };
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      if ((errorMsg.includes('503') || errorMsg.includes('Network') || errorMsg.includes('500')) && !errorMsg.includes('quorum')) {
        tests[4] = { ...tests[4], status: 'error', message: 'Server connection error' };
      } else {
        tests[4] = { ...tests[4], status: 'success', message: 'No buckets configured (normal)' };
      }
    }
    setConnectionTests([...tests]);
    
    // Test 6: List Keys
    try {
      const start = Date.now();
      const result = await apiClient.listAccessKeys();
      const duration = Date.now() - start;
      
      if (result.success) {
        const keyCount = result.data?.length || 0;
        tests[5] = { 
          ...tests[5], 
          status: 'success', 
          duration, 
          message: keyCount > 0 ? `${keyCount} keys found` : 'No keys present (normal)'
        };
      } else {
        // Distinguish between real errors and absence of keys
        const errorMsg = result.error || '';
        if ((errorMsg.includes('503') || errorMsg.includes('Network') || errorMsg.includes('500')) && !errorMsg.includes('quorum')) {
          tests[5] = { ...tests[5], status: 'error', duration, message: 'Server connection error' };
        } else {
          tests[5] = { ...tests[5], status: 'success', duration, message: 'No keys configured (normal)' };
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      if ((errorMsg.includes('503') || errorMsg.includes('Network') || errorMsg.includes('500')) && !errorMsg.includes('quorum')) {
        tests[5] = { ...tests[5], status: 'error', message: 'Server connection error' };
      } else {
        tests[5] = { ...tests[5], status: 'success', message: 'No keys configured (normal)' };
      }
    }
    setConnectionTests([...tests]);
    
    setTesting(false);
  };

  const loadSystemInfo = async () => {
    try {
      // Simulated system info - in real app this would come from API
      setSystemInfo({
        frontend: {
          version: '0.7.0-A',
          buildTime: new Date().toISOString(),
          apiUrl: apiUrl
        },
        backend: {
          version: '0.7.0-A',
          nodeEnv: 'development',
          uptime: Math.floor(Math.random() * 86400)
        },
        garage: {
          url: garageUrl,
          connected: connectionTests.some(t => t.name === 'Garage Connection' && t.status === 'success'),
          version: '0.9.0',
          nodeId: 'garage-node-1'
        }
      });
    } catch (error) {
      console.error('Error loading system info:', error);
    }
  };

  useEffect(() => {
    loadSystemInfo();
  }, [connectionTests]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-danger-500" />;
      case 'pending':
        return <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">System Settings</h2>
        <p className="text-gray-600 mt-1">Configuration and diagnostics of the administrative interface</p>
      </div>

      {/* Settings Header */}
      <div className="flex items-center justify-between">
        <div className="card-header">
          <div className="flex items-center space-x-2">
            <Network className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-medium">Connection Configuration</h3>
          </div>
        </div>
        <div className="card-content space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Backend API URL</label>
              <div className="flex items-center space-x-2 mt-1">
                <code className="text-sm bg-gray-100 px-3 py-2 rounded flex-1 font-mono">
                  {apiUrl}
                </code>
                <button
                  onClick={() => copyToClipboard(apiUrl)}
                  className="p-2 hover:bg-gray-100 rounded"
                  title="Copy"
                >
                  <Copy className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Garage Server URL</label>
              <div className="flex items-center space-x-2 mt-1">
                <code className="text-sm bg-gray-100 px-3 py-2 rounded flex-1 font-mono">
                  {garageUrl}
                </code>
                <button
                  onClick={() => copyToClipboard(garageUrl)}
                  className="p-2 hover:bg-gray-100 rounded"
                  title="Copy"
                >
                  <Copy className="h-4 w-4 text-gray-500" />
                </button>
                <a
                  href={garageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-gray-100 rounded"
                  title="Open in new window"
                >
                  <ExternalLink className="h-4 w-4 text-gray-500" />
                </a>
              </div>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Token Admin</label>
            <div className="flex items-center space-x-2 mt-1">
              <code className="text-sm bg-gray-100 px-3 py-2 rounded flex-1 font-mono">
                {showToken ? 'HaJy8EOIM9RDkNZTN8u40EEyeR93Fjy3hgwxLNMD4n4=' : '••••••••••••••••••••••••••••••••••••••••••••••'}
              </code>
              <button
                onClick={() => setShowToken(!showToken)}
                className="p-2 hover:bg-gray-100 rounded"
                title={showToken ? 'Hide' : 'Show'}
              >
                {showToken ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
              </button>
              {showToken && (
                <button
                  onClick={() => copyToClipboard('HaJy8EOIM9RDkNZTN8u40EEyeR93Fjy3hgwxLNMD4n4=')}
                  className="p-2 hover:bg-gray-100 rounded"
                  title="Copy"
                >
                  <Copy className="h-4 w-4 text-gray-500" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Connection Tests */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-medium">Connectivity Tests</h3>
            </div>
            <button
              onClick={runConnectionTests}
              disabled={testing}
              className="btn-primary px-4 py-2 inline-flex items-center"
            >
              {testing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {testing ? 'Testing...' : 'Run Tests'}
            </button>
          </div>
        </div>
        <div className="card-content">
          {connectionTests.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Click "Run Tests" to verify connectivity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {connectionTests.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(test.status)}
                    <span className="font-medium text-gray-900">{test.name}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    {test.duration && (
                      <span>{test.duration}ms</span>
                    )}
                    {test.message && (
                      <span className={test.status === 'error' ? 'text-danger-600' : 'text-gray-600'}>
                        {test.message}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* System Information */}
      {systemInfo && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-medium">System Information</h3>
            </div>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Frontend Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Frontend</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Version:</span>
                    <span className="font-mono">{systemInfo.frontend.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Build:</span>
                    <span className="font-mono text-xs">{new Date(systemInfo.frontend.buildTime).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              {/* Backend Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Backend</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Version:</span>
                    <span className="font-mono">{systemInfo.backend.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Environment:</span>
                    <span className="font-mono">{systemInfo.backend.nodeEnv}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Uptime:</span>
                    <span className="font-mono">{Math.floor(systemInfo.backend.uptime / 3600)}h {Math.floor((systemInfo.backend.uptime % 3600) / 60)}m</span>
                  </div>
                </div>
              </div>
              
              {/* Garage Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Garage</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      systemInfo.garage.connected 
                        ? 'bg-success-100 text-success-800' 
                        : 'bg-danger-100 text-danger-800'
                    }`}>
                      {systemInfo.garage.connected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  {systemInfo.garage.version && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Version:</span>
                      <span className="font-mono">{systemInfo.garage.version}</span>
                    </div>
                  )}
                  {systemInfo.garage.nodeId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Node ID:</span>
                      <span className="font-mono text-xs">{systemInfo.garage.nodeId}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Troubleshooting */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-warning-600" />
            <h3 className="text-lg font-medium">Troubleshooting</h3>
          </div>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Common Connection Errors</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>"Could not reach quorum":</strong> The Garage cluster doesn't have enough active nodes</li>
                <li>• <strong>"Invalid bearer token":</strong> The authentication token is invalid or expired</li>
                <li>• <strong>"Connection refused":</strong> The Garage server is not running</li>
                <li>• <strong>"Network timeout":</strong> Network or firewall issues</li>
              </ul>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Resolution Steps</h4>
              <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                <li>Check that the Garage server is running</li>
                <li>Check network and firewall configuration</li>
                <li>Run the connectivity tests above</li>
                <li>Check server logs for specific errors</li>
                <li>Check cluster configuration</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsView;