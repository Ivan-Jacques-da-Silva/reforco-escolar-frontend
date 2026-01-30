const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');
const logger = require('../config/logger');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      logger.warn('Tentativa de acesso sem token', { ip: req.ip, path: req.path });
      return res.status(401).json({
        error: 'Token de acesso requerido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            primaryColor: true,
            secondaryColor: true,
            avatarUrl: true,
            logoUrl: true,
            systemName: true,
            updatedAt: true
          }
        },
        student: {
          select: {
            id: true,
            email: true,
            name: true,
            grade: true,
            avatarUrl: true,
            updatedAt: true
            // Adicionar outros campos necessários
          }
        }
      }
    });

    if (!session) {
      logger.warn('Sessão inválida ou inexistente', { userId: decoded.userId });
      return res.status(401).json({
        error: 'Sessão inválida ou expirada'
      });
    }

    if (new Date() > session.expiresAt) {
      await prisma.session.delete({
        where: { id: session.id }
      });
      
      const userId = session.user ? session.user.id : (session.student ? session.student.id : 'unknown');
      logger.info('Sessão expirada removida', { sessionId: session.id, userId });
      return res.status(401).json({
        error: 'Sessão expirada'
      });
    }

    if (session.user) {
      req.user = session.user;
    } else if (session.student) {
      // logger.info('Session student found', { studentId: session.student.id, hasAvatar: !!session.student.avatarUrl });
      req.user = {
        ...session.student,
        role: 'STUDENT'
      };
    } else {
      // Caso raro onde a sessão existe mas não tem user nem student associado
      return res.status(401).json({
        error: 'Sessão inválida (usuário não encontrado)'
      });
    }
    
    req.sessionId = session.id;
    
    next();
  } catch (error) {
    logger.error('Erro na autenticação', { 
      error: error.message, 
      stack: error.stack,
      path: req.path 
    });
    
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

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    logger.warn('Tentativa de acesso admin negado', { 
      userId: req.user.id, 
      role: req.user.role,
      path: req.path 
    });
    return res.status(403).json({
      error: 'Acesso negado. Permissões de administrador requeridas.'
    });
  }
  next();
};

const canAccessStudent = async (req, res, next) => {
  try {
    const studentId = req.params.id || req.body.studentId;
    
    if (!studentId) {
      return res.status(400).json({
        error: 'ID do aluno não fornecido'
      });
    }

    if (req.user.role === 'ADMIN') {
      return next();
    }

    // Se for aluno, só pode acessar seus próprios dados
    if (req.user.role === 'STUDENT') {
      if (studentId === req.user.id) {
        return next();
      }
      return res.status(403).json({
        error: 'Acesso negado. Você só pode acessar seus próprios dados.'
      });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { teacherId: true }
    });

    if (!student) {
      logger.warn('Tentativa de acesso a aluno inexistente', { 
        studentId, 
        userId: req.user.id 
      });
      return res.status(404).json({
        error: 'Aluno não encontrado'
      });
    }

    if (student.teacherId !== req.user.id) {
      logger.warn('Tentativa de acesso não autorizado a aluno', { 
        studentId, 
        teacherId: student.teacherId,
        userId: req.user.id 
      });
      return res.status(403).json({
        error: 'Acesso negado. Você só pode acessar seus próprios alunos.'
      });
    }

    next();
  } catch (error) {
    logger.error('Erro na verificação de acesso ao aluno', { 
      error: error.message,
      stack: error.stack,
      studentId: req.params.id || req.body.studentId 
    });
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