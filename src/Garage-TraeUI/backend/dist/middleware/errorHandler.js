"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = exports.asyncHandler = exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    let statusCode = 500;
    let message = 'Errore interno del server';
    let details = undefined;
    if ('statusCode' in err && err.statusCode) {
        statusCode = err.statusCode;
        message = err.message;
    }
    else if ('code' in err) {
        const apiError = err;
        switch (apiError.code) {
            case '400':
                statusCode = 400;
                message = 'Richiesta non valida';
                break;
            case '401':
                statusCode = 401;
                message = 'Non autorizzato';
                break;
            case '403':
                statusCode = 403;
                message = 'Accesso negato';
                break;
            case '404':
                statusCode = 404;
                message = 'Risorsa non trovata';
                break;
            case '409':
                statusCode = 409;
                message = 'Conflitto';
                break;
            case 'NETWORK_ERROR':
                statusCode = 503;
                message = 'Servizio non disponibile';
                break;
            default:
                statusCode = 500;
                message = apiError.message || 'Errore del server Garage';
        }
        details = apiError.details;
    }
    else if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Dati di input non validi';
    }
    else if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Formato ID non valido';
    }
    else if (err.name === 'SyntaxError') {
        statusCode = 400;
        message = 'JSON non valido';
    }
    const errorResponse = {
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        method: req.method
    };
    if (process.env.NODE_ENV === 'development') {
        errorResponse.details = details;
        errorResponse.stack = err.stack;
    }
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
const createError = (message, statusCode = 500) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};
exports.createError = createError;
//# sourceMappingURL=errorHandler.js.map