const logger = require('../config/logger');
const express = require('express');
const { prisma } = require('../config/database');
const { authenticateToken, canAccessStudent } = require('../middleware/auth');

const router = express.Router();

// Listar pagamentos
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, studentId, status, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    // Construir filtros
    const where = {};
    
    // Se não for admin, filtrar apenas pagamentos dos alunos do professor
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
      where.dueDate = {};
      if (startDate) {
        where.dueDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.dueDate.lte = new Date(endDate);
      }
    }

    // Buscar pagamentos
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
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
        orderBy: { dueDate: 'desc' }
      }),
      prisma.payment.count({ where })
    ]);

    res.json({
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Erro ao listar pagamentos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Buscar pagamento por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
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

    if (!payment) {
      return res.status(404).json({
        error: 'Pagamento não encontrado'
      });
    }

    // Verificar se o usuário pode acessar este pagamento
    if (req.user.role !== 'ADMIN' && payment.student.teacher.id !== req.user.id) {
      return res.status(403).json({
        error: 'Acesso negado'
      });
    }

    res.json(payment);

  } catch (error) {
    logger.error('Erro ao buscar pagamento:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Criar novo pagamento
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      studentId,
      amount,
      description,
      dueDate,
      referenceMonth
    } = req.body;

    // Validações
    if (!studentId || !amount || !dueDate) {
      return res.status(400).json({
        error: 'Aluno, valor e data de vencimento são obrigatórios'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        error: 'O valor deve ser maior que zero'
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
        error: 'Você só pode criar pagamentos para seus próprios alunos'
      });
    }

    // Criar pagamento
    const payment = await prisma.payment.create({
      data: {
        studentId,
        amount: parseFloat(amount),
        description,
        dueDate: new Date(dueDate),
        referenceMonth
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
      message: 'Pagamento criado com sucesso',
      payment
    });

  } catch (error) {
    logger.error('Erro ao criar pagamento:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Atualizar pagamento
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      amount,
      description,
      dueDate,
      referenceMonth,
      status,
      paidAt,
      paymentMethod,
      notes
    } = req.body;

    // Verificar se o pagamento existe e se o usuário pode acessá-lo
    const existingPayment = await prisma.payment.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            teacherId: true
          }
        }
      }
    });

    if (!existingPayment) {
      return res.status(404).json({
        error: 'Pagamento não encontrado'
      });
    }

    // Verificar permissões
    if (req.user.role !== 'ADMIN' && existingPayment.student.teacherId !== req.user.id) {
      return res.status(403).json({
        error: 'Acesso negado'
      });
    }

    // Preparar dados para atualização
    const updateData = {};
    if (amount !== undefined) {
      if (amount <= 0) {
        return res.status(400).json({
          error: 'O valor deve ser maior que zero'
        });
      }
      updateData.amount = parseFloat(amount);
    }
    if (description) updateData.description = description;
    if (dueDate) updateData.dueDate = new Date(dueDate);
    if (referenceMonth) updateData.referenceMonth = referenceMonth;
    if (status) updateData.status = status;
    if (paidAt) updateData.paidAt = new Date(paidAt);
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    if (notes) updateData.notes = notes;

    // Se está marcando como pago e não tem data de pagamento, usar data atual
    if (status === 'PAID' && !paidAt && !existingPayment.paidAt) {
      updateData.paidAt = new Date();
    }

    // Atualizar pagamento
    const payment = await prisma.payment.update({
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
      message: 'Pagamento atualizado com sucesso',
      payment
    });

  } catch (error) {
    logger.error('Erro ao atualizar pagamento:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Deletar pagamento
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o pagamento existe e se o usuário pode acessá-lo
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            teacherId: true
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({
        error: 'Pagamento não encontrado'
      });
    }

    // Verificar permissões
    if (req.user.role !== 'ADMIN' && payment.student.teacherId !== req.user.id) {
      return res.status(403).json({
        error: 'Acesso negado'
      });
    }

    // Deletar pagamento
    await prisma.payment.delete({
      where: { id }
    });

    res.json({
      message: 'Pagamento deletado com sucesso'
    });

  } catch (error) {
    logger.error('Erro ao deletar pagamento:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Marcar pagamento como pago
router.patch('/:id/pay', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod, notes } = req.body;

    // Verificar se o pagamento existe e se o usuário pode acessá-lo
    const existingPayment = await prisma.payment.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            teacherId: true
          }
        }
      }
    });

    if (!existingPayment) {
      return res.status(404).json({
        error: 'Pagamento não encontrado'
      });
    }

    // Verificar permissões
    if (req.user.role !== 'ADMIN' && existingPayment.student.teacherId !== req.user.id) {
      return res.status(403).json({
        error: 'Acesso negado'
      });
    }

    // Atualizar status para pago
    const payment = await prisma.payment.update({
      where: { id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        paymentMethod,
        notes
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
      message: 'Pagamento marcado como pago',
      payment
    });

  } catch (error) {
    logger.error('Erro ao marcar pagamento como pago:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Relatório de pagamentos por período
router.get('/reports/period', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, studentId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Data de início e fim são obrigatórias'
      });
    }

    const where = {
      dueDate: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    };

    // Se não for admin, filtrar apenas pagamentos dos alunos do professor
    if (req.user.role !== 'ADMIN') {
      where.student = {
        teacherId: req.user.id
      };
    }

    // Filtro por aluno específico
    if (studentId) {
      where.studentId = studentId;
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { dueDate: 'asc' }
    });

    // Calcular estatísticas
    const stats = {
      total: payments.length,
      paid: payments.filter(p => p.status === 'PAID').length,
      pending: payments.filter(p => p.status === 'PENDING').length,
      overdue: payments.filter(p => p.status === 'OVERDUE').length,
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
      paidAmount: payments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0),
      pendingAmount: payments.filter(p => p.status !== 'PAID').reduce((sum, p) => sum + p.amount, 0)
    };

    res.json({
      payments,
      stats,
      period: {
        startDate,
        endDate
      }
    });

  } catch (error) {
    logger.error('Erro ao gerar relatório de pagamentos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;