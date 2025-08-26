"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testRoutes = void 0;
const express_1 = require("express");
const errorHandler_1 = require("../middleware/errorHandler");
const garageClient_1 = require("../services/garageClient");
const router = (0, express_1.Router)();
exports.testRoutes = router;
router.get('/connection', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const client = (0, garageClient_1.getGarageClient)();
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
    }
    else {
        res.status(503).json({
            success: false,
            error: 'Impossibile connettersi a Garage',
            details: result.error,
            garageUrl: process.env.GARAGE_API_URL
        });
    }
}));
router.get('/auth', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const client = (0, garageClient_1.getGarageClient)();
    try {
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
        }
        else {
            res.status(401).json({
                success: false,
                error: 'Token di autenticazione non valido',
                details: result.error
            });
        }
    }
    catch (error) {
        res.status(401).json({
            success: false,
            error: 'Errore di autenticazione',
            details: error instanceof Error ? error.message : 'Errore sconosciuto'
        });
    }
}));
router.get('/system', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const client = (0, garageClient_1.getGarageClient)();
    const results = {
        connection: false,
        authentication: false,
        clusterStatus: null,
        apiEndpoints: {
            status: false,
            buckets: false,
            keys: false
        }
    };
    try {
        const connectionTest = await client.testConnection();
        results.connection = connectionTest.success;
    }
    catch (error) {
        results.connection = false;
    }
    if (results.connection) {
        try {
            const statusResult = await client.getClusterStatus();
            results.authentication = statusResult.success;
            results.apiEndpoints.status = statusResult.success;
            if (statusResult.success) {
                results.clusterStatus = statusResult.data;
            }
        }
        catch (error) {
            results.authentication = false;
        }
        try {
            const bucketsResult = await client.listBuckets();
            results.apiEndpoints.buckets = bucketsResult.success;
        }
        catch (error) {
            results.apiEndpoints.buckets = false;
        }
        try {
            const keysResult = await client.listAccessKeys();
            results.apiEndpoints.keys = keysResult.success;
        }
        catch (error) {
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
//# sourceMappingURL=test.js.map