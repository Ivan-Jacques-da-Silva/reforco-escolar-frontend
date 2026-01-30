#!/usr/bin/env node
/*
  Script para criar usuário (ADMIN/TEACHER) diretamente no banco via Prisma.
  Uso:
    node scripts/create-user.js --email admin@reforcoescolar.com --password admin123 --name "Administrador" --role ADMIN
*/

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
      args[key] = value;
    }
  }
  return args;
}

function isValidEmail(email) {
  return /.+@.+\..+/.test(email);
}

async function main() {
  const args = parseArgs(process.argv);
  const email = args.email || process.env.ADMIN_EMAIL;
  const password = args.password || process.env.ADMIN_PASSWORD;
  const name = args.name || 'Administrador';
  const role = (args.role || 'ADMIN').toUpperCase();

  if (!email || !password) {
    console.error('Erro: informe --email e --password (ou defina ADMIN_EMAIL/ADMIN_PASSWORD no .env)');
    process.exit(1);
  }

  if (!isValidEmail(email)) {
    console.error('Erro: email inválido.');
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('Erro: a senha deve ter pelo menos 6 caracteres.');
    process.exit(1);
  }

  if (!['ADMIN', 'TEACHER'].includes(role)) {
    console.error('Erro: role inválida. Use ADMIN ou TEACHER.');
    process.exit(1);
  }

  try {
    console.log('Conectando ao banco...');
    await prisma.$connect();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log(`Usuário já existe: ${email} (role=${existing.role})`);
      process.exit(0);
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hashed, name, role },
      select: { id: true, email: true, name: true, role: true, createdAt: true }
    });

    console.log('Usuário criado com sucesso:');
    console.log(JSON.stringify(user, null, 2));
    console.log('\nCredenciais:');
    console.log(`- Email: ${email}`);
    console.log(`- Senha: ${password}`);
  } catch (err) {
    console.error('Falha ao criar usuário:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };

