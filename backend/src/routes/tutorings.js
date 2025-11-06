const express = require('express');
const { prisma } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Listar reforços
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, studentId, status, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    // Construir filtros
    const where = {};
    
    // Se não for admin, filtrar apenas reforços dos alunos do professor
    if (req.user.role !== 'ADMIN') {
      where.student = {
        teacherId: req.user.id
      };
    }

    // Filtro por aluno
    if (studentId) {
      where.studentId = studentId;
    }

    // Filtro por status
    if (status) {
      where.status = status;
    }

    // Filtro por período
    if (startDate || endDate) {
      where.nextClass = {};
      if (startDate) {
        where.nextClass.gte = new Date(startDate);
      }
      if (endDate) {
        where.nextClass.lte = new Date(endDate);
      }
    }

    // Buscar reforços
    const [tutorings, total] = await Promise.all([
      prisma.tutoring.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              grade: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.tutoring.count({ where })
    ]);

    res.json({
      tutorings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao listar reforços:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Buscar reforço por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const tutoring = await prisma.tutoring.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            grade: true,
            teacher: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!tutoring) {
      return res.status(404).json({
        error: 'Reforço não encontrado'
      });
    }

    // Verificar se o usuário pode acessar este reforço
    if (req.user.role !== 'ADMIN' && tutoring.student.teacher.id !== req.user.id) {
      return res.status(403).json({
        error: 'Acesso negado'
      });
    }

    res.json(tutoring);

  } catch (error) {
    console.error('Erro ao buscar reforço:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Criar novo reforço
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      studentId,
      subject,
      topic,
      plan,
      nextClass,
      status
    } = req.body;

    // Validações
    if (!studentId || !subject || !topic || !plan) {
      return res.status(400).json({
        error: 'Aluno, disciplina, assunto e plano são obrigatórios'
      });
    }

    // Verificar se o aluno existe e se o professor pode acessá-lo
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { 
        id: true, 
        teacherId: true,
        name: true
      }
    });

    if (!student) {
      return res.status(404).json({
        error: 'Aluno não encontrado'
      });
    }

    // Se não for admin, verificar se é o professor do aluno
    if (req.user.role !== 'ADMIN' && student.teacherId !== req.user.id) {
      return res.status(403).json({
        error: 'Você só pode criar reforços para seus próprios alunos'
      });
    }

    // Criar reforço
    const tutoring = await prisma.tutoring.create({
      data: {
        studentId,
        subject,
        topic,
        plan,
        nextClass: nextClass ? new Date(nextClass) : null,
        status: status || 'SCHEDULED'
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            grade: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Reforço criado com sucesso',
      tutoring
    });

  } catch (error) {
    console.error('Erro ao criar reforço:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Atualizar reforço
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      subject,
      topic,
      plan,
      nextClass,
      status
    } = req.body;

    // Verificar se o reforço existe e se o usuário pode acessá-lo
    const existingTutoring = await prisma.tutoring.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            teacherId: true
          }
        }
      }
    });

    if (!existingTutoring) {
      return res.status(404).json({
        error: 'Reforço não encontrado'
      });
    }

    // Verificar permissões
    if (req.user.role !== 'ADMIN' && existingTutoring.student.teacherId !== req.user.id) {
      return res.status(403).json({
        error: 'Acesso negado'
      });
    }

    // Preparar dados para atualização
    const updateData = {};
    if (subject) updateData.subject = subject;
    if (topic) updateData.topic = topic;
    if (plan) updateData.plan = plan;
    if (nextClass !== undefined) updateData.nextClass = nextClass ? new Date(nextClass) : null;
    if (status) updateData.status = status;

    // Atualizar reforço
    const tutoring = await prisma.tutoring.update({
      where: { id },
      data: updateData,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            grade: true
          }
        }
      }
    });

    res.json({
      message: 'Reforço atualizado com sucesso',
      tutoring
    });

  } catch (error) {
    console.error('Erro ao atualizar reforço:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Deletar reforço
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o reforço existe e se o usuário pode acessá-lo
    const existingTutoring = await prisma.tutoring.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            teacherId: true
          }
        }
      }
    });

    if (!existingTutoring) {
      return res.status(404).json({
        error: 'Reforço não encontrado'
      });
    }

    // Verificar permissões
    if (req.user.role !== 'ADMIN' && existingTutoring.student.teacherId !== req.user.id) {
      return res.status(403).json({
        error: 'Acesso negado'
      });
    }

    // Deletar reforço
    await prisma.tutoring.delete({
      where: { id }
    });

    res.json({
      message: 'Reforço deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar reforço:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Marcar reforço como concluído
router.patch('/:id/complete', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // Verificar se o reforço existe e se o usuário pode acessá-lo
    const existingTutoring = await prisma.tutoring.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            teacherId: true
          }
        }
      }
    });

    if (!existingTutoring) {
      return res.status(404).json({
        error: 'Reforço não encontrado'
      });
    }

    // Verificar permissões
    if (req.user.role !== 'ADMIN' && existingTutoring.student.teacherId !== req.user.id) {
      return res.status(403).json({
        error: 'Acesso negado'
      });
    }

    // Marcar como concluído
    const tutoring = await prisma.tutoring.update({
      where: { id },
      data: {
        status: 'COMPLETED'
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            grade: true
          }
        }
      }
    });

    res.json({
      message: 'Reforço marcado como concluído',
      tutoring
    });

  } catch (error) {
    console.error('Erro ao marcar reforço como concluído:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
