const logger = require('../config/logger');
const express = require('express');
const { prisma } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Listar materiais
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    // Construir filtros
    const where = {};
    
    // Filtro por busca (SKU ou nome)
    if (search) {
      where.OR = [
        { sku: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Buscar materiais
    const [materials, total] = await Promise.all([
      prisma.material.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.material.count({ where })
    ]);

    res.json({
      materials,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('Erro ao listar materiais:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Estatísticas de materiais
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const totalItems = await prisma.material.count();
    
    const materials = await prisma.material.findMany({
      select: { quantity: true, minimum: true }
    });
    
    const lowStockCount = materials.filter(m => m.quantity <= m.minimum).length;
    const totalStock = materials.reduce((acc, m) => acc + m.quantity, 0);

    res.json({
      totalItems,
      totalStock,
      lowStockCount
    });

  } catch (error) {
    logger.error('Erro ao buscar estatísticas de materiais:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar material por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const material = await prisma.material.findUnique({
      where: { id }
    });

    if (!material) {
      return res.status(404).json({
        error: 'Material não encontrado'
      });
    }

    res.json(material);

  } catch (error) {
    logger.error('Erro ao buscar material:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Criar novo material
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      sku,
      name,
      quantity,
      minimum
    } = req.body;

    // Validações
    if (!sku || !name) {
      return res.status(400).json({
        error: 'SKU e nome são obrigatórios'
      });
    }

    // Verificar se já existe um material com este SKU
    const existingMaterial = await prisma.material.findUnique({
      where: { sku }
    });

    if (existingMaterial) {
      return res.status(400).json({
        error: 'Já existe um material com este SKU'
      });
    }

    // Criar material
    const material = await prisma.material.create({
      data: {
        sku,
        name,
        quantity: quantity || 0,
        minimum: minimum || 10
      }
    });

    res.status(201).json({
      message: 'Material criado com sucesso',
      material
    });

  } catch (error) {
    logger.error('Erro ao criar material:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Atualizar material
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      quantity,
      minimum
    } = req.body;

    // Verificar se o material existe
    const existingMaterial = await prisma.material.findUnique({
      where: { id }
    });

    if (!existingMaterial) {
      return res.status(404).json({
        error: 'Material não encontrado'
      });
    }

    // Preparar dados para atualização
    const updateData = {};
    if (name) updateData.name = name;
    if (quantity !== undefined) updateData.quantity = quantity;
    if (minimum !== undefined) updateData.minimum = minimum;

    // Atualizar material
    const material = await prisma.material.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: 'Material atualizado com sucesso',
      material
    });

  } catch (error) {
    logger.error('Erro ao atualizar material:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Deletar material
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o material existe
    const existingMaterial = await prisma.material.findUnique({
      where: { id }
    });

    if (!existingMaterial) {
      return res.status(404).json({
        error: 'Material não encontrado'
      });
    }

    // Deletar material
    await prisma.material.delete({
      where: { id }
    });

    res.json({
      message: 'Material deletado com sucesso'
    });

  } catch (error) {
    logger.error('Erro ao deletar material:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
