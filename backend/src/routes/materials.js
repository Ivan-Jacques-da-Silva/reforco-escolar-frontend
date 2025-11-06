const express = require('express');
const { prisma } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Listar materiais
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, subject, type } = req.query;
    const skip = (page - 1) * limit;

    // Construir filtros
    const where = {};
    
    // Se não for admin, filtrar apenas materiais criados pelo professor
    if (req.user.role !== 'ADMIN') {
      where.createdById = req.user.id;
    }

    // Filtro por matéria
    if (subject) {
      where.subject = { contains: subject, mode: 'insensitive' };
    }

    // Filtro por tipo
    if (type) {
      where.type = type;
    }

    // Filtro por busca (título ou descrição)
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Buscar materiais
    const [materials, total] = await Promise.all([
      prisma.material.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
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
    console.error('Erro ao listar materiais:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Buscar material por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!material) {
      return res.status(404).json({
        error: 'Material não encontrado'
      });
    }

    // Verificar se o usuário pode acessar este material
    if (req.user.role !== 'ADMIN' && material.createdById !== req.user.id) {
      return res.status(403).json({
        error: 'Acesso negado'
      });
    }

    res.json(material);

  } catch (error) {
    console.error('Erro ao buscar material:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Criar novo material
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      type,
      content,
      fileUrl,
      tags
    } = req.body;

    // Validações
    if (!title || !subject || !type) {
      return res.status(400).json({
        error: 'Título, matéria e tipo são obrigatórios'
      });
    }

    // Criar material
    const material = await prisma.material.create({
      data: {
        title,
        description,
        subject,
        type,
        content,
        fileUrl,
        tags: tags || [],
        createdById: req.user.id
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Material criado com sucesso',
      material
    });

  } catch (error) {
    console.error('Erro ao criar material:', error);
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
      title,
      description,
      subject,
      type,
      content,
      fileUrl,
      tags
    } = req.body;

    // Verificar se o material existe e se o usuário pode acessá-lo
    const existingMaterial = await prisma.material.findUnique({
      where: { id }
    });

    if (!existingMaterial) {
      return res.status(404).json({
        error: 'Material não encontrado'
      });
    }

    // Verificar permissões
    if (req.user.role !== 'ADMIN' && existingMaterial.createdById !== req.user.id) {
      return res.status(403).json({
        error: 'Acesso negado'
      });
    }

    // Preparar dados para atualização
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (subject) updateData.subject = subject;
    if (type) updateData.type = type;
    if (content) updateData.content = content;
    if (fileUrl) updateData.fileUrl = fileUrl;
    if (tags) updateData.tags = tags;

    // Atualizar material
    const material = await prisma.material.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      message: 'Material atualizado com sucesso',
      material
    });

  } catch (error) {
    console.error('Erro ao atualizar material:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Deletar material
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o material existe e se o usuário pode acessá-lo
    const material = await prisma.material.findUnique({
      where: { id }
    });

    if (!material) {
      return res.status(404).json({
        error: 'Material não encontrado'
      });
    }

    // Verificar permissões
    if (req.user.role !== 'ADMIN' && material.createdById !== req.user.id) {
      return res.status(403).json({
        error: 'Acesso negado'
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
    console.error('Erro ao deletar material:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Buscar materiais por matéria
router.get('/subject/:subject', authenticateToken, async (req, res) => {
  try {
    const { subject } = req.params;
    const { limit = 20 } = req.query;

    const where = {
      subject: { contains: subject, mode: 'insensitive' }
    };

    // Se não for admin, filtrar apenas materiais criados pelo professor
    if (req.user.role !== 'ADMIN') {
      where.createdById = req.user.id;
    }

    const materials = await prisma.material.findMany({
      where,
      take: parseInt(limit),
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(materials);

  } catch (error) {
    console.error('Erro ao buscar materiais por matéria:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Buscar materiais por tags
router.get('/tags/:tag', authenticateToken, async (req, res) => {
  try {
    const { tag } = req.params;
    const { limit = 20 } = req.query;

    const where = {
      tags: { has: tag }
    };

    // Se não for admin, filtrar apenas materiais criados pelo professor
    if (req.user.role !== 'ADMIN') {
      where.createdById = req.user.id;
    }

    const materials = await prisma.material.findMany({
      where,
      take: parseInt(limit),
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(materials);

  } catch (error) {
    console.error('Erro ao buscar materiais por tag:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;