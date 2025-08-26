import { useState } from 'react';
import { apiClient } from '../lib/api';

interface ApiDebuggerProps {
  endpoint: 'buckets' | 'keys';
}

const ApiDebugger = ({ endpoint }: ApiDebuggerProps) => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<string>('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(`🔍 ApiDebugger: Fetching ${endpoint}...`);
      let result;
      
      if (endpoint === 'buckets') {
        result = await apiClient.listBuckets();
      } else if (endpoint === 'keys') {
        result = await apiClient.listAccessKeys();
      }
      
      console.log(`🔍 ApiDebugger: ${endpoint} response:`, result);
      setResponse(result);
      setRawResponse(JSON.stringify(result, null, 2));
    } catch (err: any) {
      console.error(`🔍 ApiDebugger: ${endpoint} error:`, err);
      setError(err?.message || 'Errore sconosciuto');
      setRawResponse(JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-4 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">API Debugger: {endpoint}</h3>
        <button
          onClick={fetchData}
          disabled={loading}
          className="px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? 'Caricamento...' : 'Testa API'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-danger-50 border border-danger-200 rounded text-danger-700 text-sm">
          <div className="font-medium">Errore:</div>
          <div>{error}</div>
        </div>
      )}

      {response && (
        <div className="mb-4">
          <div className="font-medium text-gray-700 mb-1">Stato:</div>
          <div className="text-sm">
            {response.success ? (
              <span className="text-success-600">Successo</span>
            ) : (
              <span className="text-danger-600">Fallito</span>
            )}
          </div>
        </div>
      )}

      <div>
        <div className="font-medium text-gray-700 mb-1">Risposta Raw:</div>
        <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-60 border border-gray-200">
          {rawResponse || 'Nessuna risposta'}
        </pre>
      </div>
    </div>
  );
};

export default ApiDebugger;