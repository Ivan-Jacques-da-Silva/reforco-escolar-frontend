#!/usr/bin/env node
/*
  Seed (demo) idempotente: cria dados exemplares no banco SEM apagar nada.
  - Garante 1 admin e 2 professores (upsert por email)
  - Cria alunos, reforços, materiais e pagamentos se não existirem
  Uso:
    node scripts/seed-demo.js
    node scripts/seed-demo.js --wipe=false           (padrão: false)
*/

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      const v = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : 'true';
      args[k] = v;
    }
  }
  return args;
}

async function ensureUser(email, password, name, role) {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return exists;
  const hashed = await bcrypt.hash(password, 12);
  return prisma.user.create({
    data: { email, password: hashed, name, role },
  });
}

async function ensureMaterial(sku, name, quantity, minimum) {
  return prisma.material.upsert({
    where: { sku },
    update: { name, quantity, minimum },
    create: { sku, name, quantity, minimum },
  });
}

async function ensureStudent(name, teacherId, extra = {}) {
  const found = await prisma.student.findFirst({ where: { name, teacherId } });
  if (found) return found;
  return prisma.student.create({
    data: {
      name,
      grade: extra.grade || '9º Ano',
      email: extra.email || null,
      phone: extra.phone || null,
      status: extra.status || 'ACTIVE',
      monthlyFee: extra.monthlyFee || 149.9,
      teacherId,
    },
  });
}

async function ensureTutoring(studentId, subject, topic, plan, status = 'SCHEDULED', nextOffsetDays = 1) {
  const found = await prisma.tutoring.findFirst({ where: { studentId, subject, topic } });
  if (found) return found;
  const nextClass = new Date(Date.now() + nextOffsetDays * 24 * 60 * 60 * 1000);
  return prisma.tutoring.create({
    data: { studentId, subject, topic, plan, status, nextClass },
  });
}

async function ensurePayment(studentId, reference, amount, status = 'PENDING', paidAt = null, gateway = 'PIX') {
  const found = await prisma.payment.findFirst({ where: { studentId, reference } });
  if (found) return found;
  return prisma.payment.create({
    data: { studentId, reference, amount, status, paidAt, gateway },
  });
}

async function main() {
  const args = parseArgs(process.argv);
  const wipe = String(args.wipe || 'false') === 'true';

  console.log('Conectando ao banco...');
  await prisma.$connect();

  if (wipe) {
    console.log('Limpando dados existentes (wipe=true)...');
    await prisma.session.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.tutoring.deleteMany();
    await prisma.material.deleteMany();
    await prisma.student.deleteMany();
    await prisma.user.deleteMany();
  }

  // Usuários
  const admin = await ensureUser('admin@reforcoescolar.com', '123456', 'Administrador', 'ADMIN');
  const teacher1 = await ensureUser('maria.silva@reforcoescolar.com', 'professor123', 'Maria Silva', 'TEACHER');
  const teacher2 = await ensureUser('joao.santos@reforcoescolar.com', 'professor123', 'João Santos', 'TEACHER');

  // Materiais
  await ensureMaterial('MAT001', 'Caderno de Exercícios - Matemática', 50, 10);
  await ensureMaterial('HIS001', 'Livro de História - Ensino Médio', 30, 5);
  await ensureMaterial('CIE001', 'Kit de Experimentos - Ciências', 15, 3);
  await ensureMaterial('POR001', 'Apostila de Português', 25, 8);

  // Alunos
  const s1 = await ensureStudent('Ana Silva', teacher1.id, { email: 'ana.silva@email.com', phone: '(11) 99999-1111', grade: '9º Ano' });
  const s2 = await ensureStudent('Pedro Santos', teacher1.id, { email: 'pedro.santos@email.com', phone: '(11) 99999-2222', grade: '2º Ano EM' });
  const s3 = await ensureStudent('Sofia Mendes', teacher2.id, { email: 'sofia.mendes@email.com', phone: '(11) 99999-3333', grade: '7º Ano' });
  const s4 = await ensureStudent('Lucas Ferreira', teacher2.id, { email: 'lucas.ferreira@email.com', phone: '(11) 99999-4444', grade: '1º Ano EM' });

  // Reforços
  await ensureTutoring(s1.id, 'Matemática', 'Equações do primeiro grau', 'pacote', 'SCHEDULED', 1);
  await ensureTutoring(s2.id, 'História', 'Revolução Industrial', 'avulsa', 'COMPLETED', 2);
  await ensureTutoring(s3.id, 'Ciências', 'Fotossíntese', 'pacote', 'SCHEDULED', 3);
  await ensureTutoring(s4.id, 'Português', 'Interpretação de texto', 'avulsa', 'SCHEDULED', 4);

  // Pagamentos
  await ensurePayment(s1.id, 'Mensalidade Janeiro 2024', 200.0, 'PAID', new Date('2024-01-08'));
  await ensurePayment(s1.id, 'Mensalidade Fevereiro 2024', 200.0, 'PENDING');
  await ensurePayment(s2.id, 'Mensalidade Janeiro 2024', 250.0, 'PAID', new Date('2024-01-09'), 'CARTAO');
  await ensurePayment(s3.id, 'Mensalidade Janeiro 2024', 180.0, 'OVERDUE');
  await ensurePayment(s4.id, 'Mensalidade Janeiro 2024', 300.0, 'PENDING');

  console.log('Seed de demonstração concluído.');
}

if (require.main === module) {
  main()
    .then(() => prisma.$disconnect().then(() => process.exit(0)))
    .catch((err) => {
      console.error('Erro no seed demo:', err);
      prisma.$disconnect().then(() => process.exit(1));
    });
}

module.exports = { main };

