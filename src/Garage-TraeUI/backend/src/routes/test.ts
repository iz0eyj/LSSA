import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { getGarageClient } from '../services/garageClient';

const router = Router();

// Test di connessione a Garage
router.get('/connection', asyncHandler(async (req, res) => {
  const client = getGarageClient();
  const result = await client.testConnection();
  
  if (result.success) {
    res.json({
      success: true,
      message: 'Connessione a Garage riuscita',
      data: {
        garageUrl: process.env.GARAGE_API_URL,
        timestamp: new Date().toISOString(),
        ...result.data
      }
    });
  } else {
    res.status(503).json({
      success: false,
      error: 'Impossibile connettersi a Garage',
      details: result.error,
      garageUrl: process.env.GARAGE_API_URL
    });
  }
}));

// Test delle credenziali
router.get('/auth', asyncHandler(async (req, res) => {
  const client = getGarageClient();
  
  try {
    // Prova a fare una chiamata che richiede autenticazione
    const result = await client.getClusterStatus();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Autenticazione riuscita',
        data: {
          authenticated: true,
          hasAdminAccess: true,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Token di autenticazione non valido',
        details: result.error
      });
    }
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Errore di autenticazione',
      details: error instanceof Error ? error.message : 'Errore sconosciuto'
    });
  }
}));

// Test completo del sistema
router.get('/system', asyncHandler(async (req, res) => {
  const client = getGarageClient();
  const results: any = {
    connection: false,
    authentication: false,
    clusterStatus: null,
    apiEndpoints: {
      status: false,
      buckets: false,
      keys: false
    }
  };

  // Test connessione
  try {
    const connectionTest = await client.testConnection();
    results.connection = connectionTest.success;
  } catch (error) {
    results.connection = false;
  }

  // Test autenticazione e endpoints
  if (results.connection) {
    try {
      const statusResult = await client.getClusterStatus();
      results.authentication = statusResult.success;
      results.apiEndpoints.status = statusResult.success;
      if (statusResult.success) {
        results.clusterStatus = statusResult.data;
      }
    } catch (error) {
      results.authentication = false;
    }

    // Test endpoint buckets
    try {
      const bucketsResult = await client.listBuckets();
      results.apiEndpoints.buckets = bucketsResult.success;
    } catch (error) {
      results.apiEndpoints.buckets = false;
    }

    // Test endpoint keys
    try {
      const keysResult = await client.listAccessKeys();
      results.apiEndpoints.keys = keysResult.success;
    } catch (error) {
      results.apiEndpoints.keys = false;
    }
  }

  const allTestsPassed = results.connection && 
                        results.authentication && 
                        Object.values(results.apiEndpoints).every(test => test === true);

  res.status(allTestsPassed ? 200 : 503).json({
    success: allTestsPassed,
    message: allTestsPassed ? 'Tutti i test sono passati' : 'Alcuni test sono falliti',
    data: {
      ...results,
      timestamp: new Date().toISOString(),
      environment: {
        garageUrl: process.env.GARAGE_API_URL,
        nodeEnv: process.env.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0'
      }
    }
  });
}));

export { router as testRoutes };