const { PrismaClient } = require('@prisma/client');
const logger = require('./logger');

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    logger.debug('Prisma Query', {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`
    });
  });
}

prisma.$on('error', (e) => {
  logger.error('Erro no Prisma', { error: e.message, target: e.target });
});

prisma.$on('warn', (e) => {
  logger.warn('Aviso do Prisma', { message: e.message });
});

async function connectDatabase() {
  try {
    await prisma.$connect();
    logger.info('✅ Conectado ao banco de dados PostgreSQL');
  } catch (error) {
    logger.error('❌ Erro ao conectar ao banco de dados', { 
      error: error.message,
      stack: error.stack 
    });
    process.exit(1);
  }
}

async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    logger.info('🔌 Desconectado do banco de dados');
  } catch (error) {
    logger.error('❌ Erro ao desconectar do banco de dados', { 
      error: error.message 
    });
  }
}

module.exports = {
  prisma,
  connectDatabase,
  disconnectDatabase
};