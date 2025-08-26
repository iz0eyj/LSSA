"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bucketRoutes = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const errorHandler_1 = require("../middleware/errorHandler");
const garageClient_1 = require("../services/garageClient");
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const router = (0, express_1.Router)();
exports.bucketRoutes = router;
router.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const client = (0, garageClient_1.getGarageClient)();
    const result = await client.listBuckets();
    if (result.success) {
        res.json({
            success: true,
            data: result.data,
            count: result.data?.length || 0,
            timestamp: new Date().toISOString()
        });
    }
    else {
        res.status(503).json({
            success: false,
            error: 'Impossibile ottenere la lista dei bucket',
            details: result.error
        });
    }
    return;
}));
router.get('/:bucketId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { bucketId } = req.params;
    const client = (0, garageClient_1.getGarageClient)();
    const result = await client.getBucket(bucketId);
    if (result.success) {
        res.json({
            success: true,
            data: result.data,
            timestamp: new Date().toISOString()
        });
    }
    else {
        res.status(404).json({
            success: false,
            error: `Bucket ${bucketId} non trovato`,
            details: result.error
        });
    }
}));
router.post('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const bucketData = req.body;
    if (!bucketData.global_alias && !bucketData.local_alias) {
        return res.status(400).json({
            success: false,
            error: 'È necessario specificare almeno un alias (globale o locale)'
        });
    }
    console.log('🏗️ CREATE BUCKET DEBUG - Richiesta creazione bucket:', {
        globalAlias: bucketData.global_alias,
        localAlias: bucketData.local_alias,
        visibilityOptions: bucketData.visibility_options
    });
    const client = (0, garageClient_1.getGarageClient)();
    const result = await client.createBucket(bucketData);
    if (result.success) {
        console.log('✅ CREATE BUCKET DEBUG - Bucket creato con successo:', result.data);
        res.status(201).json({
            success: true,
            data: result.data,
            message: result.message,
            timestamp: new Date().toISOString()
        });
    }
    else {
        console.log('❌ CREATE BUCKET DEBUG - Errore creazione bucket:', result.error);
        res.status(400).json({
            success: false,
            error: 'Impossibile creare il bucket',
            details: result.error
        });
    }
}));
router.put('/:bucketId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { bucketId } = req.params;
    const updateData = req.body;
    const client = (0, garageClient_1.getGarageClient)();
    const result = await client.updateBucket(bucketId, updateData);
    if (result.success) {
        res.json({
            success: true,
            data: result.data,
            message: result.message,
            timestamp: new Date().toISOString()
        });
    }
    else {
        res.status(400).json({
            success: false,
            error: `Impossibile aggiornare il bucket ${bucketId}`,
            details: result.error
        });
    }
}));
router.delete('/:bucketId', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { bucketId } = req.params;
    const client = (0, garageClient_1.getGarageClient)();
    console.log('🗑️ DELETE BUCKET DEBUG - Tentativo eliminazione bucket:', { bucketId });
    const bucketsResult = await client.listBuckets();
    if (!bucketsResult.success || !bucketsResult.data) {
        console.log('❌ DELETE BUCKET DEBUG - Errore nel recupero lista bucket:', bucketsResult.error);
        return res.status(500).json({
            success: false,
            error: 'Errore nel recupero informazioni bucket',
            details: bucketsResult.error
        });
    }
    const targetBucket = bucketsResult.data.find(b => b.id === bucketId);
    if (!targetBucket) {
        console.log('❌ DELETE BUCKET DEBUG - Bucket non trovato:', { bucketId });
        return res.status(404).json({
            success: false,
            error: `Bucket ${bucketId} non trovato`
        });
    }
    console.log('✅ DELETE BUCKET DEBUG - Bucket trovato:', {
        id: targetBucket.id,
        globalAliases: targetBucket.global_aliases,
        localAliases: targetBucket.local_aliases
    });
    try {
        console.log('🔍 DELETE BUCKET DEBUG - Verifica contenuto bucket...');
        const objectsResult = await client.listObjects(bucketId, undefined, 1);
        if (objectsResult.success && objectsResult.data && objectsResult.data.contents && objectsResult.data.contents.length > 0) {
            console.log('❌ DELETE BUCKET DEBUG - Bucket non vuoto:', {
                objectCount: objectsResult.data.contents.length,
                firstObject: objectsResult.data.contents[0]?.key
            });
            return res.status(400).json({
                success: false,
                error: 'Il bucket non può essere eliminato perché contiene oggetti',
                details: `Il bucket contiene ${objectsResult.data.contents.length} oggetti. Elimina tutti gli oggetti prima di eliminare il bucket.`,
                objectCount: objectsResult.data.contents.length
            });
        }
        console.log('✅ DELETE BUCKET DEBUG - Bucket vuoto, procedo con eliminazione');
    }
    catch (objectsError) {
        console.log('⚠️ DELETE BUCKET DEBUG - Errore verifica oggetti (procedo comunque):', objectsError.message);
    }
    console.log('🚀 DELETE BUCKET DEBUG - Chiamata API eliminazione bucket...');
    const result = await client.deleteBucket(bucketId);
    console.log('📨 DELETE BUCKET DEBUG - Risposta API eliminazione:', {
        success: result.success,
        message: result.message,
        error: result.error
    });
    if (result.success) {
        console.log('✅ DELETE BUCKET DEBUG - Bucket eliminato con successo');
        res.json({
            success: true,
            message: result.message || 'Bucket eliminato con successo',
            timestamp: new Date().toISOString()
        });
    }
    else {
        console.log('❌ DELETE BUCKET DEBUG - Errore eliminazione bucket:', {
            bucketId,
            error: result.error
        });
        let statusCode = 400;
        let userMessage = 'Impossibile eliminare il bucket';
        if (result.error && result.error.includes('not empty')) {
            userMessage = 'Il bucket non può essere eliminato perché contiene oggetti';
        }
        else if (result.error && result.error.includes('not found')) {
            statusCode = 404;
            userMessage = 'Bucket non trovato';
        }
        res.status(statusCode).json({
            success: false,
            error: userMessage,
            details: result.error,
            bucketId: bucketId
        });
    }
}));
router.get('/:bucketName/objects', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { bucketName } = req.params;
    const { prefix, maxKeys } = req.query;
    console.log('📋 LIST OBJECTS DEBUG - Richiesta ricevuta:', {
        bucketName,
        prefix,
        maxKeys,
        queryParams: req.query
    });
    const client = (0, garageClient_1.getGarageClient)();
    console.log('🔄 LIST OBJECTS DEBUG - Chiamata client.listObjects...');
    const result = await client.listObjects(bucketName, prefix, maxKeys ? parseInt(maxKeys) : undefined);
    console.log('📨 LIST OBJECTS DEBUG - Risposta dal client S3:', {
        success: result.success,
        error: result.error,
        dataType: typeof result.data,
        hasContents: result.data?.contents ? true : false,
        objectCount: result.data?.contents?.length || 0
    });
    if (result.success && result.data?.contents) {
        console.log('📦 LIST OBJECTS DEBUG - Dettagli oggetti trovati:');
        result.data.contents.forEach((obj, index) => {
            console.log(`  ${index + 1}. Key: "${obj.key}", Size: ${obj.size}, LastModified: ${obj.last_modified}`);
        });
    }
    if (result.success) {
        const responseData = {
            success: true,
            data: result.data,
            bucket: bucketName,
            timestamp: new Date().toISOString()
        };
        console.log('✅ LIST OBJECTS DEBUG - Invio risposta al frontend:', {
            success: responseData.success,
            objectCount: responseData.data?.contents?.length || 0,
            bucket: responseData.bucket
        });
        res.json(responseData);
    }
    else {
        console.log('❌ LIST OBJECTS DEBUG - Errore nella risposta:', {
            error: result.error,
            bucketName
        });
        res.status(503).json({
            success: false,
            error: `Impossibile ottenere gli oggetti del bucket ${bucketName}`,
            details: result.error,
            note: 'Questa funzionalità potrebbe richiedere l\'accesso diretto all\'API S3'
        });
    }
}));
router.post('/:bucketName/objects', upload.single('file'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { bucketName } = req.params;
    const { key, contentType } = req.body;
    console.log('🔍 UPLOAD DEBUG - Richiesta ricevuta:', {
        bucketName,
        key,
        contentType,
        fileSize: req.file?.size,
        fileName: req.file?.originalname
    });
    if (!req.file) {
        console.log('❌ UPLOAD DEBUG - Nessun file fornito');
        return res.status(400).json({
            success: false,
            error: 'Nessun file fornito'
        });
    }
    if (!key) {
        console.log('❌ UPLOAD DEBUG - Chiave oggetto mancante');
        return res.status(400).json({
            success: false,
            error: 'Chiave oggetto (key) richiesta'
        });
    }
    const client = (0, garageClient_1.getGarageClient)();
    console.log('🔍 UPLOAD DEBUG - Verifico esistenza bucket:', bucketName);
    const bucketsResult = await client.listBuckets();
    if (bucketsResult.success && bucketsResult.data) {
        const targetBucket = bucketsResult.data.find(b => b.id === bucketName ||
            (b.global_aliases && b.global_aliases.includes(bucketName)) ||
            (b.local_aliases && b.local_aliases.some(alias => alias.alias === bucketName)));
        if (targetBucket) {
            console.log('✅ UPLOAD DEBUG - Bucket trovato:', {
                id: targetBucket.id,
                globalAliases: targetBucket.global_aliases,
                localAliases: targetBucket.local_aliases,
                websiteAccess: targetBucket.website_access
            });
        }
        else {
            console.log('❌ UPLOAD DEBUG - Bucket non trovato nella lista');
            console.log('🔍 UPLOAD DEBUG - Bucket disponibili:', bucketsResult.data.map(b => ({
                id: b.id,
                globalAliases: b.global_aliases,
                localAliases: b.local_aliases
            })));
        }
    }
    else {
        console.log('❌ UPLOAD DEBUG - Errore nel recupero lista bucket:', bucketsResult.error);
    }
    const uploadRequest = {
        key: key,
        file: req.file.buffer,
        contentType: contentType || req.file.mimetype,
        metadata: {
            originalName: req.file.originalname,
            size: req.file.size.toString()
        }
    };
    console.log('🚀 UPLOAD DEBUG - Avvio upload con S3 client');
    const result = await client.uploadObject(bucketName, uploadRequest);
    if (result.success) {
        console.log('✅ UPLOAD DEBUG - Upload completato con successo');
        res.status(201).json({
            success: true,
            data: result.data,
            message: result.message,
            bucket: bucketName,
            timestamp: new Date().toISOString()
        });
    }
    else {
        console.log('❌ UPLOAD DEBUG - Upload fallito:', {
            error: result.error,
            bucketName,
            key
        });
        res.status(500).json({
            success: false,
            error: `Impossibile caricare il file nel bucket ${bucketName}`,
            details: result.error
        });
    }
}));
router.get('/:bucketName/objects/:objectKey', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { bucketName, objectKey } = req.params;
    try {
        const client = (0, garageClient_1.getGarageClient)();
        const result = await client.downloadObject(bucketName, decodeURIComponent(objectKey));
        if (!result.success || !result.data) {
            return res.status(404).json({
                success: false,
                error: `Oggetto ${objectKey} non trovato nel bucket ${bucketName}`,
                details: result.error
            });
        }
        const contentType = 'application/octet-stream';
        const fileName = objectKey.split('/').pop() || objectKey;
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', result.data.length.toString());
        res.send(result.data);
    }
    catch (error) {
        console.error('❌ Error downloading object:', error);
        res.status(500).json({
            success: false,
            error: `Impossibile scaricare l'oggetto ${objectKey} dal bucket ${bucketName}`,
            details: error.message
        });
    }
}));
router.delete('/:bucketName/objects/:objectKey', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { bucketName, objectKey } = req.params;
    const client = (0, garageClient_1.getGarageClient)();
    const result = await client.deleteObject(bucketName, decodeURIComponent(objectKey));
    if (result.success) {
        res.json({
            success: true,
            data: result.data,
            message: result.message,
            bucket: bucketName,
            timestamp: new Date().toISOString()
        });
    }
    else {
        res.status(500).json({
            success: false,
            error: `Impossibile eliminare l'oggetto ${objectKey} dal bucket ${bucketName}`,
            details: result.error
        });
    }
}));
router.put('/:bucketId/website', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { bucketId } = req.params;
    const { enabled, indexDocument, errorDocument } = req.body;
    console.log('🌐 UPDATE WEBSITE DEBUG - Richiesta aggiornamento sito web:', {
        bucketId,
        enabled,
        indexDocument,
        errorDocument
    });
    const client = (0, garageClient_1.getGarageClient)();
    const result = await client.updateBucketWebsite(bucketId, {
        enabled,
        indexDocument: indexDocument || 'index.html',
        errorDocument: errorDocument || 'error.html'
    });
    if (result.success) {
        console.log('✅ UPDATE WEBSITE DEBUG - Configurazione sito web aggiornata');
        res.json({
            success: true,
            data: result.data,
            message: result.message || 'Configurazione sito web aggiornata con successo',
            timestamp: new Date().toISOString()
        });
    }
    else {
        console.log('❌ UPDATE WEBSITE DEBUG - Errore aggiornamento:', result.error);
        res.status(400).json({
            success: false,
            error: `Impossibile aggiornare la configurazione sito web del bucket ${bucketId}`,
            details: result.error
        });
    }
}));
router.put('/:bucketId/cors', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { bucketId } = req.params;
    const { enabled, origins, methods, headers } = req.body;
    console.log('🔗 UPDATE CORS DEBUG - Richiesta aggiornamento CORS:', {
        bucketId,
        enabled,
        origins,
        methods,
        headers
    });
    const client = (0, garageClient_1.getGarageClient)();
    const result = await client.updateBucketCors(bucketId, {
        enabled,
        origins: origins || ['*'],
        methods: methods || ['GET', 'POST', 'PUT', 'DELETE'],
        headers: headers || ['*']
    });
    if (result.success) {
        console.log('✅ UPDATE CORS DEBUG - Configurazione CORS aggiornata');
        res.json({
            success: true,
            data: result.data,
            message: result.message || 'Configurazione CORS aggiornata con successo',
            timestamp: new Date().toISOString()
        });
    }
    else {
        console.log('❌ UPDATE CORS DEBUG - Errore aggiornamento:', result.error);
        res.status(400).json({
            success: false,
            error: `Impossibile aggiornare la configurazione CORS del bucket ${bucketId}`,
            details: result.error
        });
    }
}));
router.post('/:bucketId/aliases', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { bucketId } = req.params;
    const { alias } = req.body;
    if (!alias || !alias.trim()) {
        return res.status(400).json({
            success: false,
            error: 'Alias richiesto'
        });
    }
    console.log('➕ ADD ALIAS DEBUG - Richiesta aggiunta alias:', {
        bucketId,
        alias: alias.trim()
    });
    const client = (0, garageClient_1.getGarageClient)();
    const result = await client.addBucketAlias(bucketId, alias.trim());
    if (result.success) {
        console.log('✅ ADD ALIAS DEBUG - Alias aggiunto con successo');
        res.status(201).json({
            success: true,
            data: result.data,
            message: result.message || `Alias '${alias.trim()}' aggiunto con successo`,
            timestamp: new Date().toISOString()
        });
    }
    else {
        console.log('❌ ADD ALIAS DEBUG - Errore aggiunta alias:', result.error);
        res.status(400).json({
            success: false,
            error: `Impossibile aggiungere l'alias '${alias.trim()}' al bucket ${bucketId}`,
            details: result.error
        });
    }
}));
router.delete('/:bucketId/aliases/:alias', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { bucketId, alias } = req.params;
    const decodedAlias = decodeURIComponent(alias);
    console.log('➖ REMOVE ALIAS DEBUG - Richiesta rimozione alias:', {
        bucketId,
        alias: decodedAlias
    });
    const client = (0, garageClient_1.getGarageClient)();
    const result = await client.removeBucketAlias(bucketId, decodedAlias);
    if (result.success) {
        console.log('✅ REMOVE ALIAS DEBUG - Alias rimosso con successo');
        res.json({
            success: true,
            data: result.data,
            message: result.message || `Alias '${decodedAlias}' rimosso con successo`,
            timestamp: new Date().toISOString()
        });
    }
    else {
        console.log('❌ REMOVE ALIAS DEBUG - Errore rimozione alias:', result.error);
        res.status(400).json({
            success: false,
            error: `Impossibile rimuovere l'alias '${decodedAlias}' dal bucket ${bucketId}`,
            details: result.error
        });
    }
}));
router.get('/stats/summary', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const client = (0, garageClient_1.getGarageClient)();
    const result = await client.listBuckets();
    if (result.success && result.data) {
        const buckets = result.data;
        const stats = {
            total: buckets.length,
            withWebsiteAccess: buckets.filter(b => b.website_access === true).length,
            withCorsRules: buckets.filter(b => b.cors_rules && Array.isArray(b.cors_rules) && b.cors_rules.length > 0).length,
            withLifecycleConfig: buckets.filter(b => b.lifecycle_config && b.lifecycle_config.rules && Array.isArray(b.lifecycle_config.rules) && b.lifecycle_config.rules.length > 0).length,
            withQuotas: buckets.filter(b => b.quotas && (b.quotas.max_size || b.quotas.max_objects)).length,
            aliases: {
                global: buckets.reduce((acc, b) => acc + (b.global_aliases?.length || 0), 0),
                local: buckets.reduce((acc, b) => acc + (b.local_aliases?.length || 0), 0)
            },
            timestamp: new Date().toISOString()
        };
        res.json({
            success: true,
            data: stats
        });
    }
    else {
        res.status(503).json({
            success: false,
            error: 'Impossibile ottenere le statistiche dei bucket',
            details: result.error
        });
    }
}));
//# sourceMappingURL=buckets.js.map