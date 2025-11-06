const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');

// Middleware para verificar token JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Token de acesso requerido'
      });
    }

    // Verificar se o token é válido
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar se a sessão ainda existe no banco
    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      }
    });

    if (!session) {
      return res.status(401).json({
        error: 'Sessão inválida ou expirada'
      });
    }

    // Verificar se a sessão não expirou
    if (new Date() > session.expiresAt) {
      // Remover sessão expirada
      await prisma.session.delete({
        where: { id: session.id }
      });
      
      return res.status(401).json({
        error: 'Sessão expirada'
      });
    }

    // Adicionar dados do usuário à requisição
    req.user = session.user;
    req.sessionId = session.id;
    
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado'
      });
    }
    
    return res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Middleware para verificar se o usuário é admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'Acesso negado. Permissões de administrador requeridas.'
    });
  }
  next();
};

// Middleware para verificar se o usuário pode acessar dados de um aluno específico
const canAccessStudent = async (req, res, next) => {
  try {
    const studentId = req.params.id || req.body.studentId;
    
    if (!studentId) {
      return res.status(400).json({
        error: 'ID do aluno não fornecido'
      });
    }

    // Admin pode acessar qualquer aluno
    if (req.user.role === 'ADMIN') {
      return next();
    }

    // Professor só pode acessar seus próprios alunos
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { teacherId: true }
    });

    if (!student) {
      return res.status(404).json({
        error: 'Aluno não encontrado'
      });
    }

    if (student.teacherId !== req.user.id) {
      return res.status(403).json({
        error: 'Acesso negado. Você só pode acessar seus próprios alunos.'
      });
    }

    next();
  } catch (error) {
    console.error('Erro na verificação de acesso ao aluno:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  canAccessStudent
};