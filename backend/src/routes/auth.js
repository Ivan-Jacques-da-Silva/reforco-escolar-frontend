const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

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
    console.error('Erro no registro:', error);
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

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email }
    });

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

    // Gerar token JWT
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Calcular data de expiração
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias

    // Criar sessão no banco
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt
      }
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
    console.error('Erro no login:', error);
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
    console.error('Erro no logout:', error);
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
    console.error('Erro ao buscar dados do usuário:', error);
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
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;