const logger = require('../config/logger');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../config/upload');

const router = express.Router();

// Registrar novo usuário (apenas admin pode criar novos usuários)
router.post('/register', authenticateToken, async (req, res) => {
  try {
    // Verificar se o usuário é admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'Apenas administradores podem criar novos usuários'
      });
    }

    const { email, password, name, role = 'TEACHER' } = req.body;

    // Validações
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email e senha são obrigatórios'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'A senha deve ter pelo menos 6 caracteres'
      });
    }

    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'Este email já está em uso'
      });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user
    });

  } catch (error) {
    logger.error('Erro no registro:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validações
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email e senha são obrigatórios'
      });
    }

    // Buscar usuário (Teacher/Admin)
    let user = await prisma.user.findUnique({
      where: { email }
    });
    
    let isStudent = false;

    // Se não encontrou usuário, tentar buscar aluno
    if (!user) {
      const student = await prisma.student.findFirst({
        where: { email }
      });
      
      if (student && student.password) {
        user = student;
        isStudent = true;
        // Adicionar role explicitamente se não existir
        if (!user.role) user.role = 'STUDENT';
      }
    }

    if (!user) {
      return res.status(401).json({
        error: 'Credenciais inválidas'
      });
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Credenciais inválidas'
      });
    }

    // Gerar token JWT com nonce para garantir unicidade
    const tokenPayload = { 
      userId: user.id,
      email: user.email,
      role: user.role,
      nonce: Date.now() + Math.random()
    };
    
    if (isStudent) tokenPayload.isStudent = true;

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Calcular data de expiração
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias

    // Criar sessão no banco
    const sessionData = {
      token,
      expiresAt
    };

    if (isStudent) {
      sessionData.studentId = user.id;
    } else {
      sessionData.userId = user.id;
    }

    const session = await prisma.session.create({
      data: sessionData
    });

    // Remover senha da resposta
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login realizado com sucesso',
      user: userWithoutPassword,
      token,
      expiresAt
    });

  } catch (error) {
    logger.error('Erro no login:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Remover sessão do banco
    await prisma.session.delete({
      where: { id: req.sessionId }
    });

    res.json({
      message: 'Logout realizado com sucesso'
    });

  } catch (error) {
    logger.error('Erro no logout:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Verificar token (para validar se o usuário ainda está logado)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: req.user
    });
  } catch (error) {
    logger.error('Erro ao buscar dados do usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Alterar senha
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validações
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Senha atual e nova senha são obrigatórias'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'A nova senha deve ter pelo menos 6 caracteres'
      });
    }

    // Buscar usuário com senha
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    // Verificar senha atual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        error: 'Senha atual incorreta'
      });
    }

    // Hash da nova senha
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Atualizar senha
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedNewPassword }
    });

    res.json({
      message: 'Senha alterada com sucesso'
    });

  } catch (error) {
    logger.error('Erro ao alterar senha:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// Atualizar Perfil e Tema
router.put('/profile', authenticateToken, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'logo', maxCount: 1 }]), async (req, res) => {
  try {
    const { name, email, password, primaryColor, secondaryColor, fontFamily, textColor, systemName } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    logger.info('Profile update request', { 
      userId, 
      userRole, 
      files: req.files ? Object.keys(req.files) : 'none',
      body: req.body 
    });

    // Validar se o email já está em uso (se foi alterado)
    if (email && email !== req.user.email) {
      // Verificar na tabela de usuários (admins/professores)
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({
          error: 'Este email já está em uso'
        });
      }

      // Verificar na tabela de alunos (para evitar duplicidade global)
      const existingStudent = await prisma.student.findFirst({
        where: { email }
      });

      if (existingStudent) {
        return res.status(400).json({
          error: 'Este email já está em uso'
        });
      }
    }

    let updatedUser;

    if (userRole === 'STUDENT') {
      // Lógica de atualização para ESTUDANTES
      const updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      
      // Senha
      if (password && password.trim() !== '') {
        if (password.length < 6) {
          return res.status(400).json({
            error: 'A nova senha deve ter pelo menos 6 caracteres'
          });
        }
        updateData.password = await bcrypt.hash(password, 12);
      }

      // Alunos agora têm avatar
      if (req.files) {
        if (req.files.avatar) updateData.avatarUrl = `/uploads/${req.files.avatar[0].filename}`;
      }

      updatedUser = await prisma.student.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          // Retornar campos para manter compatibilidade com o frontend
          grade: true,
          phone: true,
          avatarUrl: true
        }
      });
      
      // Adicionar role explicitamente
      updatedUser.role = 'STUDENT';

    } else {
      // Lógica de atualização para ADMINS/PROFESSORES (User)
      const updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (primaryColor) updateData.primaryColor = primaryColor;
      if (secondaryColor) updateData.secondaryColor = secondaryColor;
      if (fontFamily) updateData.fontFamily = fontFamily;
      if (textColor) updateData.textColor = textColor;
      if (systemName) updateData.systemName = systemName;
      
      // Handle files
      if (req.files) {
        if (req.files.avatar) updateData.avatarUrl = `/uploads/${req.files.avatar[0].filename}`;
        if (req.files.logo) updateData.logoUrl = `/uploads/${req.files.logo[0].filename}`;
      }

      // Se a senha for fornecida, hash e atualiza
      if (password && password.trim() !== '') {
         if (password.length < 6) {
          return res.status(400).json({
            error: 'A nova senha deve ter pelo menos 6 caracteres'
          });
        }
        updateData.password = await bcrypt.hash(password, 12);
      }

      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          primaryColor: true,
          secondaryColor: true,
          fontFamily: true,
          textColor: true,
          avatarUrl: true,
          logoUrl: true,
          systemName: true,
          createdAt: true,
          updatedAt: true
        }
      });
    }

    res.json({
      message: 'Perfil atualizado com sucesso',
      user: updatedUser
    });

  } catch (error) {
    logger.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;