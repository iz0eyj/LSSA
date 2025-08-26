import React, { useState, useEffect } from 'react';
import {
  Server,
  Database,
  Key,
  HardDrive,
  Activity,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { apiClient } from '../lib/api';
import { formatBytes, formatRelativeTime } from '../lib/utils';

interface DashboardStats {
  cluster: {
    nodes_total: number;
    nodes_up: number;
    layout_version: number;
    health: string;
  };
  storage: {
    total_capacity: number;
    used_capacity: number;
    available_capacity: number;
    usage_percentage: number;
  };
  buckets: {
    total_count: number;
  };
  keys: {
    total_count: number;
  };
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    label: string;
    positive: boolean;
  };
  status?: 'success' | 'warning' | 'danger' | 'info' | 'unknown';
}

function StatCard({ title, value, subtitle, icon: Icon, trend, status = 'info' }: StatCardProps) {
  const statusColors = {
    success: 'text-success-600 bg-success-50 border-success-200',
    warning: 'text-warning-600 bg-warning-50 border-warning-200',
    danger: 'text-danger-600 bg-danger-50 border-danger-200',
    info: 'text-primary-600 bg-primary-50 border-primary-200',
    unknown: 'text-gray-600 bg-gray-50 border-gray-200'
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
                <TrendingUp className={`h-4 w-4 mr-1 ${
                  trend.positive ? 'text-success-500' : 'text-danger-500'
                }`} />
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

function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch data in parallel
      const [clusterResult, metricsResult, bucketsResult, keysResult] = await Promise.allSettled([
        apiClient.getClusterStats(),
        apiClient.getStorageMetrics(),
        apiClient.getBucketStats(),
        apiClient.getAccessKeyStats()
      ]);

      // Process cluster data
      const clusterData = clusterResult.status === 'fulfilled' && clusterResult.value.success && clusterResult.value.data
        ? clusterResult.value.data
        : { nodes: { total: 0, active: 0 }, layout: { current_version: 0 }, health: 'unknown' };

      // Process storage data
      const storageData = metricsResult.status === 'fulfilled' && metricsResult.value.success && metricsResult.value.data
        ? metricsResult.value.data
        : { capacity: { total: 0, used: 0, available: 0, usage_percentage: 0 } };

      // Process buckets data
      const bucketsData = bucketsResult.status === 'fulfilled' && bucketsResult.value.success && bucketsResult.value.data
        ? bucketsResult.value.data
        : { total: 0 };

      // Process keys data
      const keysData = keysResult.status === 'fulfilled' && keysResult.value.success && keysResult.value.data
        ? keysResult.value.data
        : { total: 0 };

      setStats({
        cluster: {
          nodes_total: clusterData.nodes?.total || 0,
          nodes_up: clusterData.nodes?.active || 0,
          layout_version: clusterData.layout?.current_version || 0,
          health: clusterData.health || 'unknown'
        },
        storage: {
          total_capacity: storageData.capacity?.total || 0,
          used_capacity: storageData.capacity?.used || 0,
          available_capacity: storageData.capacity?.available || 0,
          usage_percentage: storageData.capacity?.usage_percentage || 0
        },
        buckets: {
          total_count: bucketsData.total || 0
        },
        keys: {
          total_count: keysData.total || 0
        }
      });

      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-danger-500" />
          <p className="text-gray-900 font-medium mb-2">Loading error</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="btn-primary px-4 py-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const getClusterStatus = () => {
    if (!stats) return 'unknown';
    if (stats.cluster.nodes_up === stats.cluster.nodes_total && stats.cluster.nodes_total > 0) {
      return 'success';
    }
    if (stats.cluster.nodes_up > 0) {
      return 'warning';
    }
    return 'danger';
  };

  const getStorageStatus = () => {
    if (!stats) return 'info';
    if (stats.storage.usage_percentage > 90) return 'danger';
    if (stats.storage.usage_percentage > 75) return 'warning';
    return 'success';
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">General overview of the Garage system</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Last update: {formatRelativeTime(lastUpdate)}
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="btn-secondary px-3 py-2 text-sm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Refresh'
            )}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Cluster Status"
          value={`${stats?.cluster.nodes_up || 0}/${stats?.cluster.nodes_total || 0}`}
          subtitle="Active nodes"
          icon={Server}
          status={getClusterStatus()}
        />

        <StatCard
          title="Storage"
          value={formatBytes(stats?.storage.used_capacity || 0)}
          subtitle={`di ${formatBytes(stats?.storage.total_capacity || 0)} (${stats?.storage.usage_percentage.toFixed(1) || 0}%)`}
          icon={HardDrive}
          status={getStorageStatus()}
        />

        <StatCard
          title="Bucket"
          value={stats?.buckets.total_count || 0}
          subtitle="Total buckets"
          icon={Database}
          status="info"
        />

        <StatCard
          title="Access Keys"
          value={stats?.keys.total_count || 0}
          subtitle="Active keys"
          icon={Key}
          status="info"
        />
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cluster Health */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-primary-600" />
              Cluster Status
            </h3>
          </div>
          <div className="card-content space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">General health</span>
              <div className="flex items-center">
                {stats?.cluster.health === 'healthy' ? (
                  <CheckCircle className="h-4 w-4 text-success-500 mr-1" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-warning-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  stats?.cluster.health === 'healthy' ? 'text-success-600' : 'text-warning-600'
                }`}>
                  {stats?.cluster.health === 'healthy' ? 'Healthy' : 'Warning'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Layout version</span>
              <span className="text-sm text-gray-900">{stats?.cluster.layout_version || 0}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Online nodes</span>
              <span className="text-sm text-gray-900">
                {stats?.cluster.nodes_up || 0} of {stats?.cluster.nodes_total || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Storage Overview */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <HardDrive className="h-5 w-5 mr-2 text-primary-600" />
              Storage Overview
            </h3>
          </div>
          <div className="card-content space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Used</span>
                <span className="font-medium">{formatBytes(stats?.storage.used_capacity || 0)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    (stats?.storage.usage_percentage || 0) > 90 ? 'bg-danger-500' :
                    (stats?.storage.usage_percentage || 0) > 75 ? 'bg-warning-500' :
                    'bg-success-500'
                  }`}
                  style={{ width: `${Math.min(stats?.storage.usage_percentage || 0, 100)}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>0</span>
                <span>{formatBytes(stats?.storage.total_capacity || 0)}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Available</span>
              <span className="text-sm text-gray-900">{formatBytes(stats?.storage.available_capacity || 0)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Usage</span>
              <span className="text-sm text-gray-900">{(stats?.storage.usage_percentage || 0).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="btn-primary p-4 text-left">
              <Database className="h-6 w-6 mb-2" />
              <div className="font-medium">Create Bucket</div>
              <div className="text-sm opacity-90">New S3 bucket</div>
            </button>
            
            <button className="btn-secondary p-4 text-left">
              <Key className="h-6 w-6 mb-2" />
              <div className="font-medium">New Key</div>
              <div className="text-sm opacity-75">Access key</div>
            </button>
            
            <button className="btn-secondary p-4 text-left">
              <Activity className="h-6 w-6 mb-2" />
              <div className="font-medium">Monitoring</div>
              <div className="text-sm opacity-75">View metrics</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;