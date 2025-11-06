const bcrypt = require('bcryptjs');
const { prisma } = require('../config/database');

async function seed() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Limpar dados existentes (cuidado em produção!)
    await prisma.session.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.tutoring.deleteMany();
    await prisma.material.deleteMany();
    await prisma.student.deleteMany();
    await prisma.user.deleteMany();

    console.log('🗑️  Dados existentes removidos');

    // Criar usuário administrador
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.create({
      data: {
        email: 'admin@reforcoescolar.com',
        password: adminPassword,
        name: 'Administrador',
        role: 'ADMIN'
      }
    });

    console.log('👤 Usuário administrador criado');

    // Criar professores
    const teacherPassword = await bcrypt.hash('professor123', 12);
    
    const teacher1 = await prisma.user.create({
      data: {
        email: 'maria.silva@reforcoescolar.com',
        password: teacherPassword,
        name: 'Maria Silva',
        role: 'TEACHER'
      }
    });

    const teacher2 = await prisma.user.create({
      data: {
        email: 'joao.santos@reforcoescolar.com',
        password: teacherPassword,
        name: 'João Santos',
        role: 'TEACHER'
      }
    });

    console.log('👨‍🏫 Professores criados');

    // Criar alunos
    const students = await Promise.all([
      prisma.student.create({
        data: {
          name: 'Ana Silva',
          email: 'ana.silva@email.com',
          phone: '(11) 99999-1111',
          grade: '9º Ano',
          teacherId: teacher1.id,
          status: 'ACTIVE'
        }
      }),
      prisma.student.create({
        data: {
          name: 'Pedro Santos',
          email: 'pedro.santos@email.com',
          phone: '(11) 99999-2222',
          grade: '2º Ano EM',
          teacherId: teacher1.id,
          status: 'ACTIVE'
        }
      }),
      prisma.student.create({
        data: {
          name: 'Sofia Mendes',
          email: 'sofia.mendes@email.com',
          phone: '(11) 99999-3333',
          grade: '7º Ano',
          teacherId: teacher2.id,
          status: 'ACTIVE'
        }
      }),
      prisma.student.create({
        data: {
          name: 'Lucas Ferreira',
          email: 'lucas.ferreira@email.com',
          phone: '(11) 99999-4444',
          grade: '1º Ano EM',
          teacherId: teacher2.id,
          status: 'ACTIVE'
        }
      })
    ]);

    console.log('👨‍🎓 Alunos criados');

    // Criar materiais didáticos
    const materials = await Promise.all([
      prisma.material.create({
        data: {
          sku: 'MAT001',
          name: 'Caderno de Exercícios - Matemática',
          quantity: 50,
          minimum: 10
        }
      }),
      prisma.material.create({
        data: {
          sku: 'HIS001',
          name: 'Livro de História - Ensino Médio',
          quantity: 30,
          minimum: 5
        }
      }),
      prisma.material.create({
        data: {
          sku: 'CIE001',
          name: 'Kit de Experimentos - Ciências',
          quantity: 15,
          minimum: 3
        }
      }),
      prisma.material.create({
        data: {
          sku: 'POR001',
          name: 'Apostila de Português',
          quantity: 40,
          minimum: 8
        }
      })
    ]);

    console.log('📚 Materiais didáticos criados');

    // Criar reforços/aulas
    const now = new Date();
    const tutorings = await Promise.all([
      prisma.tutoring.create({
        data: {
          studentId: students[0].id,
          subject: 'Matemática',
          topic: 'Equações do primeiro grau',
          plan: 'pacote',
          nextClass: new Date(now.getTime() + 24 * 60 * 60 * 1000), // amanhã
          status: 'SCHEDULED'
        }
      }),
      prisma.tutoring.create({
        data: {
          studentId: students[1].id,
          subject: 'História',
          topic: 'Revolução Industrial',
          plan: 'avulsa',
          nextClass: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // depois de amanhã
          status: 'COMPLETED'
        }
      }),
      prisma.tutoring.create({
        data: {
          studentId: students[2].id,
          subject: 'Ciências',
          topic: 'Fotossíntese',
          plan: 'pacote',
          nextClass: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // em 3 dias
          status: 'SCHEDULED'
        }
      }),
      prisma.tutoring.create({
        data: {
          studentId: students[3].id,
          subject: 'Português',
          topic: 'Interpretação de texto',
          plan: 'avulsa',
          nextClass: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), // em 4 dias
          status: 'SCHEDULED'
        }
      })
    ]);

    console.log('📖 Reforços criados');

    // Criar pagamentos
    const payments = await Promise.all([
      prisma.payment.create({
        data: {
          studentId: students[0].id,
          reference: 'Mensalidade Janeiro 2024',
          amount: 200.00,
          dueDate: new Date('2024-01-10'),
          status: 'PAID',
          paidAt: new Date('2024-01-08'),
          gateway: 'PIX'
        }
      }),
      prisma.payment.create({
        data: {
          studentId: students[0].id,
          reference: 'Mensalidade Fevereiro 2024',
          amount: 200.00,
          dueDate: new Date('2024-02-10'),
          status: 'PENDING'
        }
      }),
      prisma.payment.create({
        data: {
          studentId: students[1].id,
          reference: 'Mensalidade Janeiro 2024',
          amount: 250.00,
          dueDate: new Date('2024-01-10'),
          status: 'PAID',
          paidAt: new Date('2024-01-09'),
          gateway: 'CARTAO'
        }
      }),
      prisma.payment.create({
        data: {
          studentId: students[2].id,
          reference: 'Mensalidade Janeiro 2024',
          amount: 180.00,
          dueDate: new Date('2024-01-15'),
          status: 'OVERDUE'
        }
      }),
      prisma.payment.create({
        data: {
          studentId: students[3].id,
          reference: 'Mensalidade Janeiro 2024',
          amount: 300.00,
          dueDate: new Date('2024-01-20'),
          status: 'PENDING'
        }
      })
    ]);

    console.log('💰 Pagamentos criados');

    console.log('✅ Seed concluído com sucesso!');
    console.log('\n📋 Dados criados:');
    console.log(`- 1 Administrador (admin@reforcoescolar.com / admin123)`);
    console.log(`- 2 Professores (maria.silva@reforcoescolar.com / professor123)`);
    console.log(`- 2 Professores (joao.santos@reforcoescolar.com / professor123)`);
    console.log(`- ${students.length} Alunos`);
    console.log(`- ${materials.length} Materiais didáticos`);
    console.log(`- ${tutorings.length} Reforços`);
    console.log(`- ${payments.length} Pagamentos`);

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar seed se chamado diretamente
if (require.main === module) {
  seed()
    .then(() => {
      console.log('🎉 Seed executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro no seed:', error);
      process.exit(1);
    });
}

module.exports = { seed };