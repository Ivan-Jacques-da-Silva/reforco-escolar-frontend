const express = require('express');
const { prisma } = require('../config/database');
const { authenticateToken, requireAdmin, canAccessStudent } = require('../middleware/auth');

const router = express.Router();

// Listar todos os alunos (admin vê todos, professor vê apenas seus alunos)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const skip = (page - 1) * limit;

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
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Buscar alunos
    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
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
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao listar alunos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
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
    console.error('Erro ao buscar aluno:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Criar novo aluno
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      email,
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
    const existingStudent = await prisma.student.findUnique({
      where: { email }
    });

    if (existingStudent) {
      return res.status(400).json({
        error: 'Este email já está em uso'
      });
    }

    // Se não for admin, usar o próprio ID como teacherId
    const finalTeacherId = req.user.role === 'ADMIN' ? teacherId : req.user.id;

    // Criar aluno
    const student = await prisma.student.create({
      data: {
        name,
        email,
        phone,
        birthDate: birthDate ? new Date(birthDate) : null,
        grade,
        school,
        parentName,
        parentPhone,
        parentEmail,
        address,
        teacherId: finalTeacherId
      },
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

    res.status(201).json({
      message: 'Aluno criado com sucesso',
      student
    });

  } catch (error) {
    console.error('Erro ao criar aluno:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Atualizar aluno
router.put('/:id', authenticateToken, canAccessStudent, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      birthDate,
      grade,
      school,
      parentName,
      parentPhone,
      parentEmail,
      address,
      status,
      teacherId
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
    if (phone) updateData.phone = phone;
    if (birthDate) updateData.birthDate = new Date(birthDate);
    if (grade) updateData.grade = grade;
    if (school) updateData.school = school;
    if (parentName) updateData.parentName = parentName;
    if (parentPhone) updateData.parentPhone = parentPhone;
    if (parentEmail) updateData.parentEmail = parentEmail;
    if (address) updateData.address = address;
    if (status) updateData.status = status;
    
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
    console.error('Erro ao atualizar aluno:', error);
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
    console.error('Erro ao deletar aluno:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;