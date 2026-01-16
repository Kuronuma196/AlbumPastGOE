import { Request, Response } from 'express';
import Album, { IAlbum } from '../models/Album';
import Photo from '../models/Photo';
import crypto from 'crypto';
import mongoose from 'mongoose';

interface AuthRequest extends Request {
  user?: any;
}

/**
 * Criar novo álbum
 */
export const createAlbum = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description } = req.body;
    const userId = req.user?.userId;

    if (!title || title.trim().length === 0) {
      res.status(400).json({ 
        success: false, 
        error: 'O título do álbum é obrigatório' 
      });
      return;
    }

    const album = new Album({
      title: title.trim(),
      description: description?.trim() || '',
      user: userId
    });

    await album.save();

    res.status(201).json({
      success: true,
      message: 'Álbum criado com sucesso',
      album: {
        id: album._id,
        title: album.title,
        description: album.description,
        userId: album.user,
        isPublic: album.isPublic,
        photoCount: album.photoCount,
        createdAt: album.createdAt,
        updatedAt: album.updatedAt
      }
    });
  } catch (error: any) {
    console.error('Erro ao criar álbum:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao criar álbum', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Listar álbuns do usuário
 */
export const getUserAlbums = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    const albums = await Album.find({ user: userId })
      .sort({ updatedAt: -1 })
      .lean();

    // Formatar resposta
    const formattedAlbums = albums.map(album => ({
      id: album._id,
      title: album.title,
      description: album.description,
      userId: album.user,
      isPublic: album.isPublic,
      photoCount: album.photoCount,
      shareToken: album.shareToken,
      createdAt: album.createdAt,
      updatedAt: album.updatedAt
    }));

    res.json({
      success: true,
      albums: formattedAlbums,
      count: formattedAlbums.length
    });
  } catch (error: any) {
    console.error('Erro ao buscar álbuns:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao buscar álbuns' 
    });
  }
};

/**
 * Buscar álbum específico com suas fotos
 */
export const getAlbumById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    // Verificar se o ID é válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ 
        success: false, 
        error: 'ID do álbum inválido' 
      });
      return;
    }

    const album = await Album.findOne({ _id: id, user: userId }).lean();
    
    if (!album) {
      res.status(404).json({ 
        success: false, 
        error: 'Álbum não encontrado' 
      });
      return;
    }

    // Buscar fotos do álbum
    const photos = await Photo.find({ album: id })
      .sort({ acquisitionDate: -1 })
      .lean();

    // Formatar resposta
    const formattedPhotos = photos.map(photo => ({
      id: photo._id,
      title: photo.title,
      description: photo.description,
      acquisitionDate: photo.acquisitionDate,
      size: photo.size,
      sizeFormatted: formatFileSize(photo.size),
      dominantColor: photo.dominantColor,
      albumId: photo.album,
      userId: photo.user,
      fileName: photo.fileName,
      fileUrl: photo.fileUrl,
      mimeType: photo.mimeType,
      dimensions: photo.dimensions,
      createdAt: photo.createdAt
    }));

    res.json({
      success: true,
      album: {
        id: album._id,
        title: album.title,
        description: album.description,
        userId: album.user,
        isPublic: album.isPublic,
        photoCount: album.photoCount,
        shareToken: album.shareToken,
        createdAt: album.createdAt,
        updatedAt: album.updatedAt
      },
      photos: formattedPhotos,
      photoCount: formattedPhotos.length
    });
  } catch (error: any) {
    console.error('Erro ao buscar álbum:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao buscar álbum' 
    });
  }
};

/**
 * Atualizar álbum (título e descrição)
 */
export const updateAlbum = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const userId = req.user?.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ 
        success: false, 
        error: 'ID do álbum inválido' 
      });
      return;
    }

    const updates: any = {};
    
    if (title !== undefined) {
      if (title.trim().length === 0) {
        res.status(400).json({ 
          success: false, 
          error: 'O título não pode estar vazio' 
        });
        return;
      }
      updates.title = title.trim();
    }
    
    if (description !== undefined) {
      updates.description = description?.trim() || '';
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ 
        success: false, 
        error: 'Nenhum campo para atualizar' 
      });
      return;
    }

    const album = await Album.findOneAndUpdate(
      { _id: id, user: userId },
      updates,
      { new: true, runValidators: true }
    ).lean();

    if (!album) {
      res.status(404).json({ 
        success: false, 
        error: 'Álbum não encontrado' 
      });
      return;
    }

    res.json({
      success: true,
      message: 'Álbum atualizado com sucesso',
      album: {
        id: album._id,
        title: album.title,
        description: album.description,
        userId: album.user,
        isPublic: album.isPublic,
        photoCount: album.photoCount,
        shareToken: album.shareToken,
        createdAt: album.createdAt,
        updatedAt: album.updatedAt
      }
    });
  } catch (error: any) {
    console.error('Erro ao atualizar álbum:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao atualizar álbum' 
    });
  }
};

/**
 * Excluir álbum (apenas se não tiver fotos)
 */
export const deleteAlbum = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ 
        success: false, 
        error: 'ID do álbum inválido' 
      });
      return;
    }

    // Verificar se o álbum existe e pertence ao usuário
    const album = await Album.findOne({ _id: id, user: userId });
    if (!album) {
      res.status(404).json({ 
        success: false, 
        error: 'Álbum não encontrado' 
      });
      return;
    }

    // Verificar se o álbum tem fotos (CRÍTICO - conforme briefing)
    if (album.photoCount > 0) {
      res.status(400).json({ 
        success: false, 
        error: 'Não é possível excluir álbum com fotos. Exclua as fotos primeiro.' 
      });
      return;
    }

    await Album.deleteOne({ _id: id, user: userId });

    res.json({
      success: true,
      message: 'Álbum excluído com sucesso'
    });
  } catch (error: any) {
    console.error('Erro ao excluir álbum:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao excluir álbum' 
    });
  }
};

/**
 * Gerar token de compartilhamento
 */
export const generateShareToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ 
        success: false, 
        error: 'ID do álbum inválido' 
      });
      return;
    }

    const album = await Album.findOne({ _id: id, user: userId });
    if (!album) {
      res.status(404).json({ 
        success: false, 
        error: 'Álbum não encontrado' 
      });
      return;
    }

    // Gerar token único
    const shareToken = crypto.randomBytes(32).toString('hex');
    
    album.isPublic = true;
    album.shareToken = shareToken;
    await album.save();

    res.json({
      success: true,
      message: 'Link de compartilhamento gerado',
      shareToken,
      shareUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/album/public/${shareToken}`
    });
  } catch (error: any) {
    console.error('Erro ao gerar link:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao gerar link de compartilhamento' 
    });
  }
};

/**
 * Buscar álbum público por token
 */
export const getPublicAlbum = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    const album = await Album.findOne({ 
      shareToken: token, 
      isPublic: true 
    }).lean();
    
    if (!album) {
      res.status(404).json({ 
        success: false, 
        error: 'Álbum não encontrado ou não está público' 
      });
      return;
    }

    // Buscar fotos do álbum
    const photos = await Photo.find({ album: album._id })
      .sort({ acquisitionDate: -1 })
      .lean();

    // Formatar resposta (sem informações sensíveis)
    const formattedPhotos = photos.map(photo => ({
      id: photo._id,
      title: photo.title,
      description: photo.description,
      acquisitionDate: photo.acquisitionDate,
      sizeFormatted: formatFileSize(photo.size),
      dominantColor: photo.dominantColor,
      fileUrl: photo.fileUrl,
      dimensions: photo.dimensions
    }));

    res.json({
      success: true,
      album: {
        id: album._id,
        title: album.title,
        description: album.description,
        photoCount: album.photoCount,
        createdAt: album.createdAt
      },
      photos: formattedPhotos
    });
  } catch (error: any) {
    console.error('Erro ao buscar álbum público:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao buscar álbum' 
    });
  }
};

/**
 * Remover compartilhamento
 */
export const removeShare = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ 
        success: false, 
        error: 'ID do álbum inválido' 
      });
      return;
    }

    const album = await Album.findOne({ _id: id, user: userId });
    if (!album) {
      res.status(404).json({ 
        success: false, 
        error: 'Álbum não encontrado' 
      });
      return;
    }

    album.isPublic = false;
    album.shareToken = undefined;
    await album.save();

    res.json({
      success: true,
      message: 'Compartilhamento removido com sucesso'
    });
  } catch (error: any) {
    console.error('Erro ao remover compartilhamento:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao remover compartilhamento' 
    });
  }
};

/**
 * Função auxiliar para formatar tamanho de arquivo
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}