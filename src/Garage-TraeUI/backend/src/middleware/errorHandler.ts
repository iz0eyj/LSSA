import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export const errorHandler = (
  err: AppError | ApiError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log dell'errore
  console.error('Error:', {
    message: err.message,
    stack: (err as any).stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Determina status code
  let statusCode = 500;
  let message = 'Errore interno del server';
  let details: any = undefined;

  if ('statusCode' in err && err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
  } else if ('code' in err) {
    // ApiError da Garage
    const apiError = err as ApiError;
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
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Dati di input non validi';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Formato ID non valido';
  } else if (err.name === 'SyntaxError') {
    statusCode = 400;
    message = 'JSON non valido';
  }

  // Risposta di errore
  const errorResponse: any = {
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  // Aggiungi dettagli solo in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.details = details;
    errorResponse.stack = (err as any).stack;
  }

  res.status(statusCode).json(errorResponse);
};

// Middleware per gestire errori async
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Utility per creare errori custom
export const createError = (message: string, statusCode: number = 500): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};