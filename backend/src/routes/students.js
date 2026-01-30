const logger = require('../config/logger');
const express = require('express');
const bcrypt = require('bcryptjs');
const { prisma } = require('../config/database');
const { authenticateToken, requireAdmin, canAccessStudent } = require('../middleware/auth');
const upload = require('../config/upload');

const router = express.Router();

// Listar todos os alunos (admin vê todos, professor vê apenas seus alunos)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    let pageNum = parseInt(page, 10);
    let limitNum = parseInt(limit, 10);
    const MAX_LIMIT = 100;
    if (!Number.isFinite(pageNum) || pageNum < 1) pageNum = 1;
    if (!Number.isFinite(limitNum) || limitNum < 1) limitNum = 10;
    if (limitNum > MAX_LIMIT) limitNum = MAX_LIMIT;
    const sanitizedSearch = typeof search === 'string' ? search.trim() : '';
    const skip = (pageNum - 1) * limitNum;

    // Construir filtros
    const where = {};
    
    // Se não for admin, filtrar apenas alunos do professor
    if (req.user.role !== 'ADMIN') {
      where.teacherId = req.user.id;
    }

    // Filtro por status
    if (status) {
      where.status = status;
    }

    // Filtro por busca (nome ou email)
    if (sanitizedSearch) {
      const cap = sanitizedSearch.charAt(0).toUpperCase() + sanitizedSearch.slice(1);
      const upper = sanitizedSearch.toUpperCase();
      const variants = [sanitizedSearch, cap, upper];
      where.OR = [
        ...variants.map(v => ({ name: { contains: v } })),
        ...variants.map(v => ({ email: { contains: v } }))
      ];
    }

    // Buscar alunos
    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          _count: {
            select: {
              tutorings: true,
              payments: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.student.count({ where })
    ]);

    res.json({
      students,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    logger.error('Erro ao listar alunos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Estatísticas de alunos
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const where = {};
    if (req.user.role !== 'ADMIN') {
      where.teacherId = req.user.id;
    }

    const [total, active, inactive] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.count({ where: { ...where, status: 'ACTIVE' } }),
      prisma.student.count({ where: { ...where, status: 'INACTIVE' } })
    ]);

    // Group by grade
    const byGrade = await prisma.student.groupBy({
      by: ['grade'],
      where,
      _count: {
        id: true
      }
    });

    res.json({
      total,
      active,
      inactive,
      byGrade: byGrade.map(g => ({ grade: g.grade, count: g._count.id }))
    });

  } catch (error) {
    logger.error('Erro ao buscar estatísticas de alunos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar aluno por ID
router.get('/:id', authenticateToken, canAccessStudent, async (req, res) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tutorings: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!student) {
      return res.status(404).json({
        error: 'Aluno não encontrado'
      });
    }

    res.json(student);

  } catch (error) {
    logger.error('Erro ao buscar aluno:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Criar novo aluno
router.post('/', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      birthDate,
      grade,
      school,
      parentName,
      parentPhone,
      parentEmail,
      address,
      teacherId
    } = req.body;

    // Validações
    if (!name || !email) {
      return res.status(400).json({
        error: 'Nome e email são obrigatórios'
      });
    }

    // Verificar se o email já existe
    const existingStudent = await prisma.student.findFirst({ where: { email } });

    if (existingStudent) {
      return res.status(400).json({
        error: 'Este email já está em uso'
      });
    }

    // Hash da senha se fornecida
    let hashedPassword = null;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          error: 'A senha deve ter pelo menos 6 caracteres'
        });
      }
      hashedPassword = await bcrypt.hash(password, 12);
    }

    // Se não for admin, usar o próprio ID como teacherId
    const finalTeacherId = req.user.role === 'ADMIN' ? (teacherId || req.user.id) : req.user.id;

    // Avatar URL handling
    let avatarUrl = null;
    if (req.file) {
      avatarUrl = `/uploads/${req.file.filename}`;
    }

    // Usar transação para garantir que aluno e pagamentos sejam criados juntos
    const result = await prisma.$transaction(async (prisma) => {
      // Criar aluno
      const studentData = {
        name,
        email,
        password: hashedPassword,
        phone,
        birthDate: birthDate ? new Date(birthDate) : null,
        grade,
        school,
        parentName,
        parentPhone,
        parentEmail,
        address,
        teacherId: finalTeacherId,
        monthlyFee: req.body.amount !== undefined && req.body.amount !== '' ? parseFloat(req.body.amount) : undefined
      };

      if (avatarUrl) {
        studentData.avatarUrl = avatarUrl;
      }

      const student = await prisma.student.create({
        data: studentData,
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      // Se houver dados financeiros, criar pagamentos
      const { amount, financialType, installments, dueDateDay } = req.body;
      
      if (amount && parseFloat(amount) > 0) {
        const value = parseFloat(amount);
        const day = parseInt(dueDateDay) || 10;
        const numInstallments = financialType === 'installment' && parseInt(installments) > 0 
          ? parseInt(installments) 
          : 1; // Se for mensal, cria apenas a primeira mensalidade
        
        const paymentsToCreate = [];
        const today = new Date();
        
        for (let i = 0; i < numInstallments; i++) {
          let targetDate = new Date();
          targetDate.setDate(day);
          
          // Se hoje é dia 15 e vencimento é dia 10, primeira parcela é mês que vem
          if (today.getDate() > day) {
             targetDate.setMonth(targetDate.getMonth() + 1);
          }
          
          // Adicionar i meses para as parcelas seguintes
          targetDate.setMonth(targetDate.getMonth() + i);
          
          const reference = financialType === 'installment'
            ? `Parcela ${i + 1}/${numInstallments}`
            : `Mensalidade ${targetDate.getMonth() + 1}/${targetDate.getFullYear()}`;
            
          paymentsToCreate.push({
            studentId: student.id,
            amount: value,
            reference,
            dueDate: targetDate,
            status: 'PENDING'
          });
        }
        
        if (paymentsToCreate.length > 0) {
          await prisma.payment.createMany({
            data: paymentsToCreate
          });
        }
      }

      return student;
    });

    res.status(201).json({
      message: 'Aluno criado com sucesso',
      student: result
    });

  } catch (error) {
    logger.error('Erro ao criar aluno:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Atualizar aluno
router.put('/:id', authenticateToken, canAccessStudent, upload.single('avatar'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      password,
      phone,
      birthDate,
      grade,
      school,
      parentName,
      parentPhone,
      parentEmail,
      address,
      status,
      teacherId,
      amount
    } = req.body;

    // Verificar se o email já existe (exceto para o próprio aluno)
    if (email) {
      const existingStudent = await prisma.student.findFirst({
        where: {
          email,
          NOT: { id }
        }
      });

      if (existingStudent) {
        return res.status(400).json({
          error: 'Este email já está em uso'
        });
      }
    }

    // Preparar dados para atualização
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          error: 'A senha deve ter pelo menos 6 caracteres'
        });
      }
      updateData.password = await bcrypt.hash(password, 12);
    }
    if (phone) updateData.phone = phone;
    if (birthDate) updateData.birthDate = new Date(birthDate);
    if (grade) updateData.grade = grade;
    if (school) updateData.school = school;
    if (parentName) updateData.parentName = parentName;
    if (parentPhone) updateData.parentPhone = parentPhone;
    if (parentEmail) updateData.parentEmail = parentEmail;
    if (address) updateData.address = address;
    if (status) updateData.status = status;
    if (amount) updateData.monthlyFee = parseFloat(amount);
    
    // Avatar
    if (req.file) {
      updateData.avatarUrl = `/uploads/${req.file.filename}`;
    }

    // Apenas admin pode alterar o professor
    if (req.user.role === 'ADMIN' && teacherId) {
      updateData.teacherId = teacherId;
    }

    // Atualizar aluno
    const student = await prisma.student.update({
      where: { id },
      data: updateData,
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      message: 'Aluno atualizado com sucesso',
      student
    });

  } catch (error) {
    logger.error('Erro ao atualizar aluno:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Deletar aluno
router.delete('/:id', authenticateToken, canAccessStudent, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o aluno existe
    const student = await prisma.student.findUnique({
      where: { id }
    });

    if (!student) {
      return res.status(404).json({
        error: 'Aluno não encontrado'
      });
    }

    // Deletar aluno (cascade irá deletar registros relacionados)
    await prisma.student.delete({
      where: { id }
    });

    res.json({
      message: 'Aluno deletado com sucesso'
    });

  } catch (error) {
    logger.error('Erro ao deletar aluno:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;

