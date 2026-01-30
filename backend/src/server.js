const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const path = require('path');
const logger = require('./config/logger');
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const tutoringRoutes = require('./routes/tutorings');
const materialRoutes = require('./routes/materials');
const paymentRoutes = require('./routes/payments');
const evaluationRoutes = require('./routes/evaluations');

const app = express();
const PORT = process.env.PORT || 5057;

// Configurar trust proxy para Replit
app.set('trust proxy', 1);

// Logger HTTP com Morgan
const morganStream = {
  write: (message) => logger.http(message.trim())
};

app.use(morgan(':method :url :status :res[content-length] - :response-time ms', { 
  stream: morganStream 
}));

// Middlewares de segurança
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false
}));


// CORS
const envAllowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const allowedOrigins = [
  ...envAllowedOrigins,
  'https://progressoescolar.com.br'
];

app.use(cors({
  origin: (origin, callback) => {
    // Permite chamadas sem origin (ex.: curl, health checks)
    if (!origin) return callback(null, true);

    // Sempre permitir localhost em desenvolvimento
    const isLocalhost = /^(http:\/\/|https:\/\/)localhost(:\d+)?$/.test(origin);
    if (isLocalhost) return callback(null, true);

    if (allowedOrigins.length === 0) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: origem não permitida: ${origin}`));
  },
  credentials: true
}));

// Parse JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (uploads)
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads'), {
  setHeaders: (res, path, stat) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

// Fallback para arquivos estáticos não encontrados (evita ORB error)
app.use('/uploads', (req, res) => {
  res.status(404).end();
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/tutorings', tutoringRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/evaluations', evaluationRoutes);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  logger.error('Erro na aplicação', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: err.message
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Token inválido ou expirado'
    });
  }
  
  res.status(500).json({
    error: 'Erro interno do servidor'
  });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
  logger.warn('Rota não encontrada', { path: req.path, method: req.method });
  res.status(404).json({
    error: 'Rota não encontrada'
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 Servidor rodando na porta ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🌐 CORS habilitado para: ${process.env.FRONTEND_URL}`);
  logger.info(`📝 Log level: ${process.env.LOG_LEVEL || 'info'}`);
});

const { prisma } = require('./config/database');

const gracefulShutdown = async (signal) => {
  logger.info(`🛑 Recebido ${signal}. Fechando servidor...`);
  
  server.close(async () => {
    logger.info('✅ Servidor HTTP fechado');
    
    await prisma.$disconnect();
    logger.info('🔌 Desconectado do banco de dados');
    
    process.exit(0);
  });
  
  setTimeout(() => {
    logger.error('⚠️ Forçando encerramento após timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
