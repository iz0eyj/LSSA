import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { getGarageClient } from '../services/garageClient';
import { CreateAccessKeyRequest, UpdateAccessKeyRequest } from '../types';

const router = Router();

// Lista tutte le chiavi di accesso
router.get('/', asyncHandler(async (req, res) => {
  const client = getGarageClient();
  const result = await client.listAccessKeys();
  
  console.log('🔑 Keys API - listAccessKeys result:', {
    success: result.success,
    dataType: typeof result.data,
    isArray: Array.isArray(result.data),
    rawKeysCount: Array.isArray(result.data) ? result.data.length : 'N/A',
    error: result.error
  });
  
  if (result.success) {
    // Rimuovi le secret keys dalla risposta per sicurezza
    const sanitizedKeys = result.data?.map(key => ({
      ...key,
      secret_access_key: undefined
    }));

    console.log('🔑 Keys API - Sanitized keys:', {
      sanitizedKeysCount: sanitizedKeys?.length || 0,
      keyIds: sanitizedKeys?.map(k => k.id) || []
    });

    res.json({
      success: true,
      data: sanitizedKeys,
      count: sanitizedKeys?.length || 0,
      timestamp: new Date().toISOString()
    });
  } else {
    console.error('❌ Keys API - Error getting keys:', result.error);
    res.status(503).json({
      success: false,
      error: 'Impossibile ottenere la lista delle chiavi di accesso',
      details: result.error
    });
  }
}));

// Ottieni dettagli di una chiave specifica
router.get('/:keyId', asyncHandler(async (req, res) => {
  const { keyId } = req.params;
  const client = getGarageClient();
  const result = await client.getAccessKey(keyId);
  
  if (result.success) {
    // Rimuovi la secret key dalla risposta per sicurezza
    const sanitizedKey = {
      ...result.data,
      secret_access_key: undefined
    };

    res.json({
      success: true,
      data: sanitizedKey,
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(404).json({
      success: false,
      error: `Chiave di accesso ${keyId} non trovata`,
      details: result.error
    });
  }
}));

// Crea una nuova chiave di accesso
router.post('/', asyncHandler(async (req, res) => {
  const keyData: CreateAccessKeyRequest = req.body;
  
  const client = getGarageClient();
  const result = await client.createAccessKey(keyData);
  
  if (result.success) {
    res.status(201).json({
      success: true,
      data: result.data, // Include la secret key solo alla creazione
      message: result.message,
      warning: 'La secret key è mostrata solo una volta. Salvala in un luogo sicuro.',
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Impossibile creare la chiave di accesso',
      details: result.error
    });
  }
}));

// Aggiorna una chiave di accesso esistente
router.put('/:keyId', asyncHandler(async (req, res) => {
  const { keyId } = req.params;
  const updateData: UpdateAccessKeyRequest = req.body;
  
  const client = getGarageClient();
  const result = await client.updateAccessKey(keyId, updateData);
  
  if (result.success) {
    // Rimuovi la secret key dalla risposta
    const sanitizedKey = {
      ...result.data,
      secret_access_key: undefined
    };

    res.json({
      success: true,
      data: sanitizedKey,
      message: result.message,
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(400).json({
      success: false,
      error: `Impossibile aggiornare la chiave di accesso ${keyId}`,
      details: result.error
    });
  }
}));

// Elimina una chiave di accesso
router.delete('/:keyId', asyncHandler(async (req, res) => {
  const { keyId } = req.params;
  
  console.log('🗑️ DELETE /api/keys/:keyId - Starting deletion:', {
    keyId,
    timestamp: new Date().toISOString()
  });
  
  const client = getGarageClient();
  
  console.log('🔄 DELETE /api/keys/:keyId - Calling deleteAccessKey:', { keyId });
  const result = await client.deleteAccessKey(keyId);
  
  console.log('📋 DELETE /api/keys/:keyId - deleteAccessKey result:', {
    success: result.success,
    message: result.message,
    error: result.error,
    keyId
  });
  
  if (result.success) {
    console.log('✅ DELETE /api/keys/:keyId - Success response:', { keyId });
    res.json({
      success: true,
      message: result.message,
      timestamp: new Date().toISOString()
    });
  } else {
    console.error('❌ DELETE /api/keys/:keyId - Error response:', {
      keyId,
      error: result.error
    });
    res.status(400).json({
      success: false,
      error: `Impossibile eliminare la chiave di accesso ${keyId}`,
      details: result.error
    });
  }
}));

// Statistiche delle chiavi di accesso
router.get('/stats/summary', asyncHandler(async (req, res) => {
  const client = getGarageClient();
  const result = await client.listAccessKeys();
  
  if (result.success && result.data) {
    const keys = result.data;
    const stats = {
      total: keys.length,
      withCreateBucketPermission: keys.filter(k => k.permissions?.create_bucket === true).length,
      withoutCreateBucketPermission: keys.filter(k => k.permissions?.create_bucket !== true).length,
      withBucketAliases: keys.filter(k => k.bucket_aliases && k.bucket_aliases.length > 0).length,
      withNames: keys.filter(k => k.name && k.name.trim() !== '').length,
      bucketAliases: {
        total: keys.reduce((acc, k) => acc + (k.bucket_aliases?.length || 0), 0),
        unique: [...new Set(keys.flatMap(k => k.bucket_aliases || []))].length
      },
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: stats
    });
  } else {
    res.status(503).json({
      success: false,
      error: 'Impossibile ottenere le statistiche delle chiavi di accesso',
      details: result.error
    });
  }
}));

// Verifica permessi di una chiave
router.get('/:keyId/permissions', asyncHandler(async (req, res) => {
  const { keyId } = req.params;
  const client = getGarageClient();
  const result = await client.getAccessKey(keyId);
  
  if (result.success && result.data) {
    const key = result.data;
    const permissions = {
      access_key_id: key.id,
      name: key.name,
      permissions: key.permissions || {},
      bucket_aliases: key.bucket_aliases || [],
      effective_access: {
        can_create_buckets: key.permissions?.create_bucket === true,
        accessible_buckets: key.bucket_aliases?.length || 0,
        has_bucket_restrictions: !!(key.bucket_aliases && key.bucket_aliases.length > 0)
      },
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: permissions
    });
  } else {
    res.status(404).json({
      success: false,
      error: `Impossibile ottenere i permessi per la chiave ${keyId}`,
      details: result.error
    });
  }
}));

export { router as keyRoutes };