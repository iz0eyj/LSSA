"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricsRoutes = void 0;
const express_1 = require("express");
const errorHandler_1 = require("../middleware/errorHandler");
const garageClient_1 = require("../services/garageClient");
const router = (0, express_1.Router)();
exports.metricsRoutes = router;
router.get('/raw', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const client = (0, garageClient_1.getGarageClient)();
    const result = await client.getMetrics();
    if (result.success) {
        res.set('Content-Type', 'text/plain');
        res.send(result.data);
    }
    else {
        res.status(503).json({
            success: false,
            error: 'Impossibile ottenere le metriche raw',
            details: result.error
        });
    }
}));
router.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const client = (0, garageClient_1.getGarageClient)();
    const [metricsResult, clusterResult, bucketsResult, keysResult] = await Promise.allSettled([
        client.getMetrics(),
        client.getClusterStatus(),
        client.listBuckets(),
        client.listAccessKeys()
    ]);
    const metrics = {
        cluster: {
            nodes_total: 0,
            nodes_up: 0,
            layout_version: 0
        },
        storage: {
            total_capacity: 0,
            used_capacity: 0,
            available_capacity: 0
        },
        buckets: {
            total_count: 0
        },
        objects: {
            total_count: 0,
            total_size: 0
        }
    };
    if (clusterResult.status === 'fulfilled' && clusterResult.value.success) {
        const clusterData = clusterResult.value.data;
        if (clusterData && clusterData.nodes) {
            metrics.cluster = {
                nodes_total: clusterData.nodes.length,
                nodes_up: clusterData.nodes.filter((n) => n.is_up).length,
                layout_version: clusterData.layout_version || 0
            };
            const totalCapacity = clusterData.nodes.reduce((acc, node) => {
                return acc + (node.capacity || 0);
            }, 0);
            metrics.storage.total_capacity = totalCapacity;
        }
    }
    if (bucketsResult.status === 'fulfilled' && bucketsResult.value.success) {
        const bucketsData = bucketsResult.value.data;
        if (bucketsData) {
            metrics.buckets = {
                total_count: bucketsData.length
            };
        }
    }
    if (metricsResult.status === 'fulfilled' && metricsResult.value.success) {
        const rawMetrics = metricsResult.value.data;
        if (typeof rawMetrics === 'string') {
            const lines = rawMetrics.split('\n');
            for (const line of lines) {
                if (line.startsWith('garage_')) {
                    if (line.includes('garage_block_bytes_total')) {
                        const match = line.match(/garage_block_bytes_total\s+(\d+)/);
                        if (match) {
                            metrics.storage.used_capacity = parseInt(match[1]);
                        }
                    }
                    if (line.includes('garage_object_count')) {
                        const match = line.match(/garage_object_count\s+(\d+)/);
                        if (match) {
                            metrics.objects.total_count = parseInt(match[1]);
                        }
                    }
                }
            }
        }
    }
    if (metrics.storage) {
        metrics.storage.available_capacity = Math.max(0, metrics.storage.total_capacity - metrics.storage.used_capacity);
    }
    res.json({
        success: true,
        data: metrics,
        timestamp: new Date().toISOString(),
        sources: {
            cluster: clusterResult.status === 'fulfilled' && clusterResult.value.success,
            buckets: bucketsResult.status === 'fulfilled' && bucketsResult.value.success,
            keys: keysResult.status === 'fulfilled' && keysResult.value.success,
            prometheus: metricsResult.status === 'fulfilled' && metricsResult.value.success
        }
    });
}));
router.get('/cluster', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const client = (0, garageClient_1.getGarageClient)();
    const result = await client.getClusterStatus();
    if (result.success && result.data) {
        const clusterData = result.data;
        const metrics = {
            nodes: {
                total: clusterData.nodes ? clusterData.nodes.length : 0,
                up: clusterData.nodes ? clusterData.nodes.filter((n) => n.is_up).length : 0,
                down: clusterData.nodes ? clusterData.nodes.filter((n) => !n.is_up).length : 0,
                zones: clusterData.nodes ? [...new Set(clusterData.nodes.map((n) => n.zone))].length : 0
            },
            layout: {
                version: clusterData.layout_version || 0,
                staged_version: clusterData.staged_layout_version || null,
                has_staged_changes: !!clusterData.staged_layout_version
            },
            health: clusterData.status || 'unknown',
            timestamp: new Date().toISOString()
        };
        res.json({
            success: true,
            data: metrics
        });
    }
    else {
        res.status(503).json({
            success: false,
            error: 'Impossibile ottenere le metriche del cluster',
            details: result.error
        });
    }
}));
router.get('/storage', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const client = (0, garageClient_1.getGarageClient)();
    const [clusterResult, metricsResult] = await Promise.allSettled([
        client.getClusterStatus(),
        client.getMetrics()
    ]);
    const storageMetrics = {
        capacity: {
            total: 0,
            used: 0,
            available: 0,
            usage_percentage: 0
        },
        nodes: [],
        timestamp: new Date().toISOString()
    };
    if (clusterResult.status === 'fulfilled' && clusterResult.value.success) {
        const clusterData = clusterResult.value.data;
        if (clusterData && clusterData.nodes) {
            storageMetrics.nodes = clusterData.nodes.map((node) => ({
                id: node.id,
                zone: node.zone,
                capacity: node.capacity || 0,
                is_up: node.is_up,
                addr: node.addr
            }));
            storageMetrics.capacity.total = clusterData.nodes.reduce((acc, node) => {
                return acc + (node.capacity || 0);
            }, 0);
        }
    }
    if (metricsResult.status === 'fulfilled' && metricsResult.value.success) {
        const rawMetrics = metricsResult.value.data;
        if (typeof rawMetrics === 'string') {
            const lines = rawMetrics.split('\n');
            for (const line of lines) {
                if (line.includes('garage_block_bytes_total')) {
                    const match = line.match(/garage_block_bytes_total\s+(\d+)/);
                    if (match) {
                        storageMetrics.capacity.used = parseInt(match[1]);
                    }
                }
            }
        }
    }
    storageMetrics.capacity.available = Math.max(0, storageMetrics.capacity.total - storageMetrics.capacity.used);
    if (storageMetrics.capacity.total > 0) {
        storageMetrics.capacity.usage_percentage =
            (storageMetrics.capacity.used / storageMetrics.capacity.total) * 100;
    }
    res.json({
        success: true,
        data: storageMetrics
    });
}));
router.get('/health', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const client = (0, garageClient_1.getGarageClient)();
    const checks = {
        cluster_reachable: false,
        metrics_available: false,
        all_nodes_up: false,
        no_staged_layout: true,
        timestamp: new Date().toISOString()
    };
    try {
        const clusterResult = await client.getClusterStatus();
        checks.cluster_reachable = clusterResult.success;
        if (clusterResult.success && clusterResult.data) {
            const clusterData = clusterResult.data;
            if (clusterData.nodes) {
                checks.all_nodes_up = clusterData.nodes.every((n) => n.is_up);
            }
            checks.no_staged_layout = !clusterData.staged_layout_version;
        }
    }
    catch (error) {
        checks.cluster_reachable = false;
    }
    try {
        const metricsResult = await client.getMetrics();
        checks.metrics_available = metricsResult.success;
    }
    catch (error) {
        checks.metrics_available = false;
    }
    const isHealthy = Object.values(checks).every(check => typeof check === 'boolean' ? check : true);
    res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        healthy: isHealthy,
        data: checks
    });
}));
//# sourceMappingURL=metrics.js.map