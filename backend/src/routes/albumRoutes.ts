import express from 'express';
import { 
  createAlbum, 
  getUserAlbums, 
  getAlbumById, 
  updateAlbum, 
  deleteAlbum,
  generateShareToken,
  getPublicAlbum,
  removeShare
} from '../controllers/albumController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Rotas protegidas (requer autenticação)
router.post('/', authMiddleware, createAlbum);
router.get('/', authMiddleware, getUserAlbums);
router.get('/:id', authMiddleware, getAlbumById);
router.put('/:id', authMiddleware, updateAlbum);
router.delete('/:id', authMiddleware, deleteAlbum);
router.post('/:id/share', authMiddleware, generateShareToken);
router.delete('/:id/share', authMiddleware, removeShare);

// Rota pública para álbum compartilhado (não requer autenticação)
router.get('/public/:token', getPublicAlbum);

export default router;