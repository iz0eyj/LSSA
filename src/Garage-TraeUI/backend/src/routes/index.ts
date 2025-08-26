import { Router } from 'express';
import { clusterRoutes } from './cluster';
import { bucketRoutes } from './buckets';
import { keyRoutes } from './keys';
import { metricsRoutes } from './metrics';
import { testRoutes } from './test';

const router = Router();

// Registra tutte le routes
router.use('/test', testRoutes);
router.use('/cluster', clusterRoutes);
router.use('/buckets', bucketRoutes);
router.use('/keys', keyRoutes);
router.use('/metrics', metricsRoutes);

// Info API
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

export { router as apiRoutes };