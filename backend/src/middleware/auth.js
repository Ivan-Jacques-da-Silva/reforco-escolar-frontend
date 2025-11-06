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
            role: true
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
      
      logger.info('Sessão expirada removida', { sessionId: session.id, userId: session.user.id });
      return res.status(401).json({
        error: 'Sessão expirada'
      });
    }

    req.user = session.user;
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