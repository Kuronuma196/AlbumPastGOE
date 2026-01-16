import express from 'express';
import { 
  register, 
  login, 
  getProfile, 
  validateToken 
} from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Rotas públicas
router.post('/register', register);
router.post('/login', login);

// Rotas protegidas
router.get('/profile', authMiddleware, getProfile);
router.get('/validate', authMiddleware, validateToken);

export default router;