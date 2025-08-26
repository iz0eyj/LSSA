"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRoutes = void 0;
const express_1 = require("express");
const cluster_1 = require("./cluster");
const buckets_1 = require("./buckets");
const keys_1 = require("./keys");
const metrics_1 = require("./metrics");
const test_1 = require("./test");
const router = (0, express_1.Router)();
exports.apiRoutes = router;
router.use('/test', test_1.testRoutes);
router.use('/cluster', cluster_1.clusterRoutes);
router.use('/buckets', buckets_1.bucketRoutes);
router.use('/keys', keys_1.keyRoutes);
router.use('/metrics', metrics_1.metricsRoutes);
router.get('/', (req, res) => {
    res.json({
        name: 'Garage-TraeUI Console API',
        version: '1.0.0',
        description: 'API per la gestione amministrativa di Garage S3',
        endpoints: {
            test: '/api/test',
            cluster: '/api/cluster',
            buckets: '/api/buckets',
            keys: '/api/keys',
            metrics: '/api/metrics'
        },
        documentation: 'https://garagehq.deuxfleurs.fr/documentation/reference-manual/admin-api/',
        timestamp: new Date().toISOString()
    });
});
//# sourceMappingURL=index.js.map