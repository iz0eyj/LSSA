import { useState, useEffect } from 'react';
import {
  Server,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HardDrive,
  Activity,
  Loader2,
  RefreshCw,
  Info
} from 'lucide-react';
import { apiClient } from '../lib/api';
import { formatRelativeTime } from '../lib/utils';
import { ClusterStatus, ClusterNode } from '../../../shared/types';



interface ClusterHealth {
  status: string;
  known_nodes: number;
  connected_nodes: number;
  storage_nodes: number;
  storage_nodes_ok: number;
  partitions: number;
  partitions_quorum: number;
  partitions_all_ok: number;
}

function ClusterView() {
  const [clusterStatus, setClusterStatus] = useState<ClusterStatus | null>(null);
  const [clusterHealth, setClusterHealth] = useState<ClusterHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchClusterData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statusResult, healthResult] = await Promise.allSettled([
        apiClient.getClusterStatus(),
        apiClient.getClusterHealth()
      ]);

      if (statusResult.status === 'fulfilled' && statusResult.value.success && statusResult.value.data) {
        setClusterStatus(statusResult.value.data);
      }

      if (healthResult.status === 'fulfilled' && healthResult.value.success && healthResult.value.data) {
        setClusterHealth(healthResult.value.data);
      }

      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching cluster data:', err);
      setError('Error loading cluster data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClusterData();
    const interval = setInterval(fetchClusterData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getHealthStatus = () => {
    if (!clusterHealth) return { status: 'unknown', color: 'gray', text: 'Unknown' };
    
    if (clusterHealth.status === 'healthy') {
      return { status: 'healthy', color: 'success', text: 'Healthy' };
    } else if (clusterHealth.status === 'degraded') {
      return { status: 'degraded', color: 'warning', text: 'Degraded' };
    } else {
      return { status: 'unhealthy', color: 'danger', text: 'Unhealthy' };
    }
  };

  const getNodeStatus = (node: ClusterNode) => {
    if (node.is_up) {
      return { icon: CheckCircle, color: 'text-success-500', text: 'Online' };
    } else {
      return { icon: XCircle, color: 'text-danger-500', text: 'Offline' };
    }
  };

  if (loading && !clusterStatus) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-gray-600">Loading cluster information...</p>
        </div>
      </div>
    );
  }

  if (error && !clusterStatus) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-danger-500" />
          <p className="text-gray-900 font-medium mb-2">Loading error</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={fetchClusterData} className="btn-primary px-4 py-2">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Compute summarized cluster health and nodes list for rendering
  const healthStatus = getHealthStatus();
  const nodes = clusterStatus?.nodes || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* Cluster Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestione Cluster</h2>
          <p className="text-gray-600 mt-1">Stato e configurazione del cluster Garage</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            Last update: {formatRelativeTime(lastUpdate)}
          </span>
          <button
            onClick={fetchClusterData}
            disabled={loading}
            className="btn-secondary p-2"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Cluster Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cluster Status</p>
                <p className={`text-lg font-semibold text-${healthStatus.color}-600`}>
                  {healthStatus.text}
                </p>
              </div>
              <Activity className={`h-8 w-8 text-${healthStatus.color}-500`} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Connected Nodes</p>
                <p className="text-lg font-semibold text-gray-900">
                  {clusterHealth?.connected_nodes || 0} / {clusterHealth?.known_nodes || 0}
                </p>
              </div>
              <Server className="h-8 w-8 text-primary-500" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Partitions OK</p>
                <p className="text-lg font-semibold text-gray-900">
                  {clusterHealth?.partitions_all_ok || 0} / {clusterHealth?.partitions || 0}
                </p>
              </div>
              <HardDrive className="h-8 w-8 text-success-500" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Layout Version</p>
                <p className="text-lg font-semibold text-gray-900">
                  v{clusterStatus?.layout_version || 0}
                </p>
              </div>
              <Info className="h-8 w-8 text-info-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Cluster Information */}
      {clusterStatus && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Cluster Information</h3>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">System Details</h4>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Status:</dt>
                    <dd className="text-sm text-gray-900">{clusterStatus.status}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Layout Version:</dt>
                    <dd className="text-sm text-gray-900">v{clusterStatus.layout_version}</dd>
                  </div>
                  {clusterStatus.staged_layout_version && (
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Staged Layout:</dt>
                      <dd className="text-sm text-gray-900">v{clusterStatus.staged_layout_version}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-600">Total Nodes:</dt>
                    <dd className="text-sm text-gray-900">{clusterStatus.nodes.length}</dd>
                  </div>
                </dl>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Active Nodes</h4>
                <div className="text-sm text-gray-600">
                  {clusterStatus.nodes.filter(n => n.is_up).length} of {clusterStatus.nodes.length} nodes online
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nodes List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Cluster Nodes</h3>
          <p className="text-sm text-gray-600">List of all known nodes in the cluster</p>
        </div>
        <div className="card-content">
          {nodes.length === 0 ? (
            <div className="text-center py-8">
              <Server className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No nodes available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Node ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Connection
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Partitions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {nodes.map((node) => {
                    const status = getNodeStatus(node);
                    return (
                      <tr key={node.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-gray-900">
                            {node.id.substring(0, 16)}...
                          </div>
                          {node.hostname && (
                            <div className="text-sm text-gray-500">{node.hostname}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {node.addr}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <status.icon className={`h-4 w-4 mr-2 ${status.color}`} />
                            <span className="text-sm text-gray-900">{status.text}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {node.last_seen_secs_ago !== undefined
                            ? `${node.last_seen_secs_ago}s ago`
                            : 'N/A'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="space-y-1">
                            <div>Zone: {node.zone}</div>
                            {node.capacity && (
                              <div>Capacity: {node.capacity}</div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClusterView;