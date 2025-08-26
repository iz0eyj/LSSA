import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { apiRoutes } from './routes';

// Carica variabili d'ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware di sicurezza
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.GARAGE_API_URL || 'http://localhost:3903']
    }
  }
}));

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting (aumentato per development)
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minuti
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'), // Aumentato a 1000 per development
  message: {
    error: 'Troppi tentativi, riprova più tardi',
    retryAfter: '15 minuti'
  },
  standardHeaders: true,
  legacyHeaders: false
});
// Disabilita rate limiting in development
if (process.env.NODE_ENV !== 'production') {
  console.log('⚠️  Rate limiting disabilitato in development');
} else {
  app.use('/api', limiter);
}

// Middleware generali
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
app.use('/api', apiRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint non trovato',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM ricevuto, chiusura graceful del server...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT ricevuto, chiusura graceful del server...');
  process.exit(0);
});

// Avvio server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server avviato su porta ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Garage API: ${process.env.GARAGE_API_URL || 'http://localhost:3903'}`);
    console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
  });
}

export default app;


/**
 * Garage-TraeUI - A modern web interface for Garage S3-compatible storage
 * 
 * This code was developed autonomously by TRAE in "SOLO" mode.
 * Copyright holder: Federico Giampietro
 * 
 * Licensed under Creative Commons Attribution–NonCommercial 4.0 International (CC BY-NC 4.0)
 * 
 * You are free to:
 * - Share: copy and redistribute the material in any medium or format
 * - Adapt: remix, transform, and build upon the material
 * 
 * Under the following terms:
 * - Attribution: You must give appropriate credit, provide a link to the license,
 *   and indicate if changes were made.
 * - NonCommercial: You may not use the material for commercial purposes without
 *   explicit written permission from the copyright holder.
 * 
 * This software is provided "AS IS", without warranty of any kind, express or implied.
 * 
 * This subproject is part of the LSSA Project (https://github.com/iz0eyj/LSSA).
 */