import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Activity,
  Server,
  HardDrive,
  TrendingUp,
  TrendingDown,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Zap,
  FileText
} from 'lucide-react';
import { apiClient } from '../lib/api';
import { formatBytes, formatRelativeTime, formatPercentage } from '../lib/utils';

interface ClusterStatistics {
  garage_version: string;
  garage_features: string[];
  rust_version: string;
  db_engine: string;
  known_nodes: number;
  connected_nodes: number;
  storage_nodes: number;
  storage_nodes_ok: number;
  partitions: number;
  partitions_quorum: number;
  partitions_all_ok: number;
  bytes_stored: number;
  bytes_stored_compressed?: number;
  compression_ratio?: number;
  objects_stored: number;
  unfinished_uploads: number;
}

interface StorageMetrics {
  capacity: {
    total: number;
    used: number;
    available: number;
    usage_percentage: number;
  };
  objects: {
    total: number;
    by_size: Record<string, number>;
  };
  operations: {
    get_requests: number;
    put_requests: number;
    delete_requests: number;
    list_requests: number;
  };
  performance: {
    avg_response_time: number;
    requests_per_second: number;
  };
}

interface MetricCard {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    positive: boolean;
    label: string;
  };
  status?: 'success' | 'warning' | 'danger' | 'info';
}

function MetricCardComponent({ title, value, subtitle, icon: Icon, trend, status = 'info' }: MetricCard) {
  const statusColors = {
    success: 'text-success-600 bg-success-50 border-success-200',
    warning: 'text-warning-600 bg-warning-50 border-warning-200',
    danger: 'text-danger-600 bg-danger-50 border-danger-200',
    info: 'text-primary-600 bg-primary-50 border-primary-200'
  };

  return (
    <div className="card">
      <div className="card-content">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center mt-2">
                {trend.positive ? (
                  <TrendingUp className="h-4 w-4 mr-1 text-success-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1 text-danger-500" />
                )}
                <span className={`text-sm font-medium ${
                  trend.positive ? 'text-success-600' : 'text-danger-600'
                }`}>
                  {trend.positive ? '+' : ''}{trend.value}%
                </span>
                <span className="text-sm text-gray-500 ml-1">{trend.label}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${statusColors[status]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricsView() {
  const [clusterStats, setClusterStats] = useState<ClusterStatistics | null>(null);
  const [storageMetrics, setStorageMetrics] = useState<StorageMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<boolean>(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      setConnectionError(false);

      const [statsResult, metricsResult] = await Promise.allSettled([
        apiClient.getClusterStatistics(),
        apiClient.getStorageMetrics()
      ]);

      if (statsResult.status === 'fulfilled' && statsResult.value.success) {
        setClusterStats(statsResult.value.data);
      } else if (statsResult.status === 'rejected' || !statsResult.value.success) {
        const error = statsResult.status === 'rejected' ? statsResult.reason : statsResult.value.error;
        if (error && (error.includes('Could not reach quorum') || error.includes('connection'))) {
          setConnectionError(true);
          setError('The Garage server has no configured nodes or is unreachable. Check the cluster configuration.');
        } else if (error && error.includes('Invalid bearer token')) {
          setError('Invalid authentication token. Check the administrative token configuration.');
        }
      }

      if (metricsResult.status === 'fulfilled' && metricsResult.value.success) {
        setStorageMetrics(metricsResult.value.data);
      } else if (metricsResult.status === 'rejected' || !metricsResult.value.success) {
        const error = metricsResult.status === 'rejected' ? metricsResult.reason : metricsResult.value.error;
        if (error && (error.includes('Could not reach quorum') || error.includes('connection'))) {
          setConnectionError(true);
          setError('The Garage server has no configured nodes or is unreachable. Check the cluster configuration.');
        } else if (error && error.includes('Invalid bearer token')) {
          setError('Invalid authentication token. Check the administrative token configuration.');
        }
      }

      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setConnectionError(true);
      setError('Backend connection error. Check that the server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const getHealthStatus = () => {
    if (!clusterStats) return { status: 'unknown', color: 'gray', text: 'Unknown' };
    
    const nodeHealth = clusterStats.connected_nodes / clusterStats.known_nodes;
    const partitionHealth = clusterStats.partitions_all_ok / clusterStats.partitions;
    
    if (nodeHealth >= 0.9 && partitionHealth >= 0.9) {
      return { status: 'healthy', color: 'success', text: 'Excellent' };
    } else if (nodeHealth >= 0.7 && partitionHealth >= 0.7) {
      return { status: 'warning', color: 'warning', text: 'Good' };
    } else {
      return { status: 'danger', color: 'danger', text: 'Critical' };
    }
  };

  if (loading && !clusterStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-gray-600">Loading metrics...</p>
        </div>
      </div>
    );
  }

  if (error && !clusterStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-danger-500" />
          <p className="text-gray-900 font-medium mb-2">Error loading metrics</p>
          <p className="text-gray-600 mb-4">{error}</p>
          
          {connectionError && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <h4 className="text-yellow-800 font-medium mb-2">Troubleshooting suggestions:</h4>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• Check that the Garage server is running on 192.168.50.152:3903</li>
                <li>• Check that the Garage cluster has at least one configured node</li>
                <li>• Check network connectivity to the Garage server</li>
                <li>• Check Garage server logs for configuration errors</li>
                <li>• Make sure the administrative token is correct in the .env file</li>
              </ul>
            </div>
          )}
          
          <div className="flex gap-2 mt-4">
            <button
              onClick={fetchMetrics}
              className="btn-primary px-4 py-2"
            >
              Retry
            </button>
            <button
              onClick={() => window.location.href = '/settings'}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              Go to Settings
            </button>
          </div>
        </div>
      </div>
    );
  }

  const healthStatus = getHealthStatus();

  return (
    <div className="space-y-6">
      {/* Metrics Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Metrics and Monitoring</h2>
          <p className="text-gray-600 mt-1">Performance monitoring and system metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              Last update: {formatRelativeTime(lastUpdate)}
            </span>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-600">Auto-refresh</span>
            </label>
          </div>
          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="btn-secondary p-2"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCardComponent
          title="System Status"
          value={healthStatus.text}
          icon={Activity}
          status={healthStatus.status as any}
        />
        
        <MetricCardComponent
          title="Active Nodes"
          value={`${clusterStats?.connected_nodes || 0}/${clusterStats?.known_nodes || 0}`}
          subtitle="Connected nodes"
          icon={Server}
          status={clusterStats && clusterStats.connected_nodes === clusterStats.known_nodes ? 'success' : 'warning'}
        />
        
        <MetricCardComponent
          title="Partizioni OK"
          value={`${clusterStats?.partitions_all_ok || 0}/${clusterStats?.partitions || 0}`}
          subtitle="Healthy partitions"
          icon={HardDrive}
          status={clusterStats && clusterStats.partitions_all_ok === clusterStats.partitions ? 'success' : 'warning'}
        />
        
        <MetricCardComponent
          title="Oggetti Totali"
          value={(clusterStats?.objects_stored || 0).toLocaleString()}
          subtitle="Stored objects"
          icon={FileText}
          status="info"
        />
      </div>

      {/* Storage Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Storage Usage</h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Used Space</span>
                  <span className="text-sm text-gray-600">
                    {formatBytes(clusterStats?.bytes_stored || 0)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full" 
                    style={{ 
                      width: `${storageMetrics?.capacity?.usage_percentage || 0}%` 
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>{formatPercentage(storageMetrics?.capacity?.usage_percentage || 0)}</span>
                  <span>{formatBytes(storageMetrics?.capacity?.total || 0)}</span>
                </div>
              </div>
              
              {clusterStats?.compression_ratio && (
                <div className="bg-info-50 border border-info-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <Zap className="h-4 w-4 text-info-600 mr-2" />
                    <span className="text-sm font-medium text-info-800">
                      Compression: {clusterStats.compression_ratio.toFixed(2)}x
                    </span>
                  </div>
                  <p className="text-xs text-info-700 mt-1">
                    Space saved: {formatBytes((clusterStats.bytes_stored || 0) - (clusterStats.bytes_stored_compressed || 0))}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Performance</h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {storageMetrics?.performance && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Average Response Time</span>
                    <span className="text-sm text-gray-900">
                      {storageMetrics.performance.avg_response_time}ms
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Requests per Second</span>
                    <span className="text-sm text-gray-900">
                      {storageMetrics.performance.requests_per_second.toFixed(1)} req/s
                    </span>
                  </div>
                </>
              )}
              
              {storageMetrics?.operations && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Operations</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">GET:</span>
                      <span className="text-gray-900">{storageMetrics.operations.get_requests.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">PUT:</span>
                      <span className="text-gray-900">{storageMetrics.operations.put_requests.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">DELETE:</span>
                      <span className="text-gray-900">{storageMetrics.operations.delete_requests.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">LIST:</span>
                      <span className="text-gray-900">{storageMetrics.operations.list_requests.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">System Information</h3>
        </div>
        <div className="card-content">
          {clusterStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Versions</h4>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Garage:</dt>
                    <dd className="text-sm text-gray-900">{clusterStats.garage_version}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Rust:</dt>
                    <dd className="text-sm text-gray-900">{clusterStats.rust_version}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Database:</dt>
                    <dd className="text-sm text-gray-900">{clusterStats.db_engine}</dd>
                  </div>
                </dl>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Cluster</h4>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Storage Nodes:</dt>
                    <dd className="text-sm text-gray-900">
                      {clusterStats.storage_nodes_ok}/{clusterStats.storage_nodes}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Quorum Partitions:</dt>
                    <dd className="text-sm text-gray-900">{clusterStats.partitions_quorum}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Incomplete Uploads:</dt>
                    <dd className="text-sm text-gray-900">{clusterStats.unfinished_uploads}</dd>
                  </div>
                </dl>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Features</h4>
                <div className="flex flex-wrap gap-1">
                  {clusterStats.garage_features?.map((feature, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary-100 text-primary-800"
                    >
                      {feature}
                    </span>
                  )) || (
                    <span className="text-sm text-gray-500">No features available</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Raw Metrics Link */}
      <div className="card">
        <div className="card-content">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Raw Metrics (Prometheus)</h4>
              <p className="text-sm text-gray-600 mt-1">
                Access raw metrics in Prometheus format for advanced integrations
              </p>
            </div>
            <button
              onClick={() => window.open('/metrics', '_blank')}
              className="btn-secondary px-4 py-2"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              View Raw
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MetricsView;