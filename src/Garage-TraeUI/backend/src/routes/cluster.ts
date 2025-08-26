import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { getGarageClient } from '../services/garageClient';

const router = Router();

// Ottieni stato del cluster
router.get('/status', asyncHandler(async (req, res) => {
  const client = getGarageClient();
  const result = await client.getClusterStatus();
  
  if (result.success) {
    res.json({
      success: true,
      data: result.data,
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(503).json({
      success: false,
      error: 'Impossibile ottenere lo stato del cluster',
      details: result.error
    });
  }
}));

// Ottieni layout del cluster
router.get('/layout', asyncHandler(async (req, res) => {
  const client = getGarageClient();
  const result = await client.getClusterLayout();
  
  if (result.success) {
    res.json({
      success: true,
      data: result.data,
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(503).json({
      success: false,
      error: 'Impossibile ottenere il layout del cluster',
      details: result.error
    });
  }
}));

// Ottieni informazioni complete del cluster
router.get('/info', asyncHandler(async (req, res) => {
  const client = getGarageClient();
  
  // Ottieni sia status che layout
  const [statusResult, layoutResult] = await Promise.allSettled([
    client.getClusterStatus(),
    client.getClusterLayout()
  ]);

  const response: any = {
    success: true,
    data: {
      timestamp: new Date().toISOString()
    }
  };

  // Aggiungi status se disponibile
  if (statusResult.status === 'fulfilled' && statusResult.value.success) {
    response.data.status = statusResult.value.data;
  } else {
    response.data.status = null;
    response.data.statusError = statusResult.status === 'fulfilled' 
      ? statusResult.value.error 
      : 'Errore nel recupero dello status';
  }

  // Aggiungi layout se disponibile
  if (layoutResult.status === 'fulfilled' && layoutResult.value.success) {
    response.data.layout = layoutResult.value.data;
  } else {
    response.data.layout = null;
    response.data.layoutError = layoutResult.status === 'fulfilled' 
      ? layoutResult.value.error 
      : 'Errore nel recupero del layout';
  }

  // Calcola statistiche del cluster
  if (response.data.status) {
    const status = response.data.status;
    response.data.statistics = {
      totalNodes: status.nodes ? status.nodes.length : 0,
      activeNodes: status.nodes ? status.nodes.filter((n: any) => n.is_up).length : 0,
      layoutVersion: status.layout_version,
      hasStagedLayout: !!status.staged_layout_version,
      zones: status.nodes ? [...new Set(status.nodes.map((n: any) => n.zone))].length : 0
    };
  }

  res.json(response);
}));

// Ottieni solo le statistiche del cluster
router.get('/stats', asyncHandler(async (req, res) => {
  const client = getGarageClient();
  const result = await client.getClusterStatus();
  
  if (result.success && result.data) {
    const status = result.data;
    const stats = {
      nodes: {
        total: status.nodes ? status.nodes.length : 0,
        active: status.nodes ? status.nodes.filter((n: any) => n.is_up).length : 0,
        inactive: status.nodes ? status.nodes.filter((n: any) => !n.is_up).length : 0
      },
      layout: {
        current_version: status.layout_version,
        staged_version: status.staged_layout_version || null,
        has_staged_changes: !!status.staged_layout_version
      },
      zones: status.nodes ? [...new Set(status.nodes.map((n: any) => n.zone))] : [],
      health: status.status || 'unknown',
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: stats
    });
  } else {
    res.status(503).json({
      success: false,
      error: 'Impossibile ottenere le statistiche del cluster',
      details: result.error
    });
  }
}));

// Ottieni statistiche dettagliate del cluster (per MetricsView)
router.get('/statistics', asyncHandler(async (req, res) => {
  const client = getGarageClient();
  const result = await client.getClusterStatus();
  
  if (result.success && result.data) {
    const status = result.data as any;
    
    // Simula statistiche dettagliate basate sui dati disponibili
    const statistics = {
      garage_version: status.garage_version || 'unknown',
      garage_features: status.garage_features || [],
      rust_version: status.rust_version || 'unknown',
      db_engine: status.db_engine || 'unknown',
      known_nodes: status.nodes ? status.nodes.length : 0,
      connected_nodes: status.nodes ? status.nodes.filter((n: any) => n.is_up).length : 0,
      storage_nodes: status.nodes ? status.nodes.filter((n: any) => n.data_partition !== null).length : 0,
      storage_nodes_ok: status.nodes ? status.nodes.filter((n: any) => n.is_up && n.data_partition !== null).length : 0,
      partitions: status.partitions || 0,
      partitions_quorum: status.partitions_quorum || 0,
      partitions_all_ok: status.partitions_all_ok || 0,
      bytes_stored: status.bytes_stored || 0,
      bytes_stored_compressed: status.bytes_stored_compressed || null,
      compression_ratio: status.compression_ratio || null,
      objects_stored: status.objects_stored || 0,
      unfinished_uploads: status.unfinished_uploads || 0
    };

    res.json({
      success: true,
      data: statistics,
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(503).json({
      success: false,
      error: 'Impossibile ottenere le statistiche dettagliate del cluster',
      details: result.error
    });
  }
}));

// Ottieni statistiche avanzate del cluster (usando API V2)
router.get('/advanced-statistics', asyncHandler(async (req, res) => {
  const client = getGarageClient();
  const result = await client.getClusterStatistics();
  
  if (result.success) {
    res.json({
      success: true,
      data: result.data,
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(503).json({
      success: false,
      error: 'Impossibile ottenere le statistiche avanzate del cluster',
      details: result.error
    });
  }
}));

// Ottieni stato di salute avanzato del cluster (usando API V2)
router.get('/advanced-health', asyncHandler(async (req, res) => {
  const client = getGarageClient();
  const result = await client.getClusterHealth();
  
  if (result.success) {
    res.json({
      success: true,
      data: result.data,
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(503).json({
      success: false,
      error: 'Impossibile ottenere lo stato di salute avanzato del cluster',
      details: result.error
    });
  }
}));

// Ottieni stato di salute del cluster (per MetricsView)
router.get('/health', asyncHandler(async (req, res) => {
  const client = getGarageClient();
  const result = await client.getClusterStatus();
  
  if (result.success && result.data) {
    const status = result.data as any;
    const totalNodes = status.nodes ? status.nodes.length : 0;
    const activeNodes = status.nodes ? status.nodes.filter((n: any) => n.is_up).length : 0;
    const storageNodes = status.nodes ? status.nodes.filter((n: any) => n.data_partition !== null).length : 0;
    const storageNodesOk = status.nodes ? status.nodes.filter((n: any) => n.is_up && n.data_partition !== null).length : 0;
    
    const nodeHealthPercentage = totalNodes > 0 ? (activeNodes / totalNodes) * 100 : 0;
    const storageHealthPercentage = storageNodes > 0 ? (storageNodesOk / storageNodes) * 100 : 0;
    const partitionHealthPercentage = status.partitions > 0 ? ((status.partitions_all_ok || 0) / status.partitions) * 100 : 0;
    
    let overallHealth = 'healthy';
    if (nodeHealthPercentage < 70 || storageHealthPercentage < 70 || partitionHealthPercentage < 70) {
      overallHealth = 'critical';
    } else if (nodeHealthPercentage < 90 || storageHealthPercentage < 90 || partitionHealthPercentage < 90) {
      overallHealth = 'warning';
    }

    const health = {
      overall_status: overallHealth,
      node_health: {
        percentage: Math.round(nodeHealthPercentage),
        active: activeNodes,
        total: totalNodes
      },
      storage_health: {
        percentage: Math.round(storageHealthPercentage),
        active: storageNodesOk,
        total: storageNodes
      },
      partition_health: {
        percentage: Math.round(partitionHealthPercentage),
        healthy: status.partitions_all_ok || 0,
        total: status.partitions || 0
      },
      issues: [] as string[],
      timestamp: new Date().toISOString()
    };

    // Aggiungi problemi rilevati
    if (activeNodes < totalNodes) {
      health.issues.push(`${totalNodes - activeNodes} nodi non raggiungibili`);
    }
    if (storageNodesOk < storageNodes) {
      health.issues.push(`${storageNodes - storageNodesOk} nodi storage non funzionanti`);
    }
    if ((status.partitions_all_ok || 0) < (status.partitions || 0)) {
      health.issues.push(`${(status.partitions || 0) - (status.partitions_all_ok || 0)} partizioni con problemi`);
    }
    if (status.unfinished_uploads && status.unfinished_uploads > 0) {
      health.issues.push(`${status.unfinished_uploads} upload incompleti`);
    }

    res.json({
      success: true,
      data: health
    });
  } else {
    res.status(503).json({
      success: false,
      error: 'Impossibile ottenere lo stato di salute del cluster',
      details: result.error
    });
  }
}));

export { router as clusterRoutes };