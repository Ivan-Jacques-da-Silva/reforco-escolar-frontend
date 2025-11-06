const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Função para conectar ao banco
async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados PostgreSQL');
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:', error);
    process.exit(1);
  }
}

// Função para desconectar do banco
async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    console.log('🔌 Desconectado do banco de dados');
  } catch (error) {
    console.error('❌ Erro ao desconectar do banco de dados:', error);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Recebido SIGINT. Fechando servidor...');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Recebido SIGTERM. Fechando servidor...');
  await disconnectDatabase();
  process.exit(0);
});

module.exports = {
  prisma,
  connectDatabase,
  disconnectDatabase
};