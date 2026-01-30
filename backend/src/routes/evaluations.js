const logger = require('../config/logger');
const express = require('express');
const { prisma } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Middleware de autenticação para todas as rotas
router.use(authenticateToken);

// Listar avaliações
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, studentId, tutoringId, startDate, endDate } = req.query;
    
    const where = {};
    if (studentId) where.studentId = studentId;
    if (tutoringId) where.tutoringId = tutoringId;
    
    if (startDate || endDate) {
      where.weekDate = {};
      if (startDate) where.weekDate.gte = new Date(startDate);
      if (endDate) where.weekDate.lte = new Date(endDate);
    }

    const total = await prisma.evaluation.count({ where });
    
    const evaluations = await prisma.evaluation.findMany({
      where,
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      orderBy: { weekDate: 'desc' },
      include: {
        student: {
          select: { name: true, grade: true }
        },
        tutoring: {
          select: { subject: true, topic: true }
        }
      }
    });

    res.json({
      evaluations,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });

  } catch (error) {
    logger.error('Erro ao listar avaliações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar avaliação
router.post('/', async (req, res) => {
  try {
    const { 
      studentId, 
      tutoringId, 
      weekDate, 
      behavior, 
      participation, 
      progress, 
      notes 
    } = req.body;

    if (!studentId || !weekDate || !behavior) {
      return res.status(400).json({ error: 'Campos obrigatórios: studentId, weekDate, behavior' });
    }

    const evaluation = await prisma.evaluation.create({
      data: {
        studentId,
        tutoringId,
        weekDate: new Date(weekDate),
        behavior,
        participation,
        progress,
        notes
      }
    });

    res.status(201).json(evaluation);

  } catch (error) {
    logger.error('Erro ao criar avaliação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Atualizar avaliação
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      behavior, 
      participation, 
      progress, 
      notes,
      weekDate
    } = req.body;

    const evaluation = await prisma.evaluation.update({
      where: { id },
      data: {
        behavior,
        participation,
        progress,
        notes,
        weekDate: weekDate ? new Date(weekDate) : undefined
      }
    });

    res.json(evaluation);

  } catch (error) {
    logger.error('Erro ao atualizar avaliação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Deletar avaliação
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.evaluation.delete({ where: { id } });
    res.json({ message: 'Avaliação excluída com sucesso' });
  } catch (error) {
    logger.error('Erro ao excluir avaliação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
