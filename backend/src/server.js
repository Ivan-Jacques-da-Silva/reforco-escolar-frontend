const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const logger = require('./config/logger');
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const tutoringRoutes = require('./routes/tutorings');
const materialRoutes = require('./routes/materials');
const paymentRoutes = require('./routes/payments');

const app = express();
const PORT = process.env.PORT || 3001;

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
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Muitas tentativas. Tente novamente em 15 minutos.'
  },
  handler: (req, res) => {
    logger.warn('Rate limit excedido', { ip: req.ip, path: req.path });
    res.status(429).json({
      error: 'Muitas tentativas. Tente novamente em 15 minutos.'
    });
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || true,
  credentials: true
}));

// Parse JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/tutorings', tutoringRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/payments', paymentRoutes);

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