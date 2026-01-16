import express from 'express';
import { 
  uploadPhoto, 
  uploadMultiplePhotos, 
  getPhotosByAlbum, 
  getPhotoById, 
  updatePhoto, 
  deletePhoto 
} from '../controllers/photoController';
import { authMiddleware } from '../middleware/auth';
import { upload, uploadMultiple } from '../middleware/upload';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Upload de fotos
router.post('/upload/:albumId', upload.single('file'), uploadPhoto);
router.post('/upload-multiple/:albumId', uploadMultiple, uploadMultiplePhotos);

// Gerenciamento de fotos
router.get('/album/:albumId', getPhotosByAlbum);
router.get('/:id', getPhotoById);
router.put('/:id', updatePhoto);
router.delete('/:id', deletePhoto);

export default router;