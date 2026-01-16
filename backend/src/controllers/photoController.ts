import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import Photo, { IPhoto } from '../models/Photo';
import Album from '../models/Album';
import { detectDominantColor } from '../utils/colorDetector';
import { readExifData } from '../utils/exifReader';
import sharp from 'sharp';

interface AuthRequest extends Request {
  user?: any;
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}

/**
 * Upload de uma única foto
 */
export const uploadPhoto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { albumId } = req.params;
    const { title, description } = req.body;
    const userId = req.user?.userId;
    const file = req.file;

    // Validações
    if (!mongoose.Types.ObjectId.isValid(albumId)) {
      cleanupFile(file);
      res.status(400).json({ 
        success: false, 
        error: 'ID do álbum inválido' 
      });
      return;
    }

    if (!file) {
      res.status(400).json({ 
        success: false, 
        error: 'Nenhuma imagem enviada' 
      });
      return;
    }

    if (!title || title.trim().length === 0) {
      cleanupFile(file);
      res.status(400).json({ 
        success: false, 
        error: 'O título da foto é obrigatório' 
      });
      return;
    }

    // Verificar se álbum existe e pertence ao usuário
    const album = await Album.findOne({ _id: albumId, user: userId });
    if (!album) {
      cleanupFile(file);
      res.status(404).json({ 
        success: false, 
        error: 'Álbum não encontrado' 
      });
      return;
    }

    // Processar metadados da imagem
    const filePath = path.join(__dirname, '..', '..', file.path);
    let acquisitionDate = new Date();
    let dimensions: { width: number; height: number } | undefined;
    let dominantColor = '#000000';

    try {
      // Ler metadados EXIF (funcionalidade bônus)
      const exifData = await readExifData(filePath);
      if (exifData?.acquisitionDate) {
        acquisitionDate = exifData.acquisitionDate;
      }
      if (exifData?.dimensions) {
        dimensions = exifData.dimensions;
      }

      // Detectar cor predominante (funcionalidade bônus)
      dominantColor = await detectDominantColor(filePath);
      
      // Se não tiver dimensões no EXIF, usar sharp para obter
      if (!dimensions) {
        const metadata = await sharp(filePath).metadata();
        if (metadata.width && metadata.height) {
          dimensions = { width: metadata.width, height: metadata.height };
        }
      }
    } catch (error) {
      console.warn('Erro ao processar metadados da imagem:', error);
      // Continua mesmo com erro nos metadados
    }

    // Criar URL acessível da imagem
    const fileUrl = `/uploads/${path.basename(file.path)}`;

    // Criar registro da foto no banco
    const photo = new Photo({
      title: title.trim(),
      description: description?.trim() || '',
      acquisitionDate,
      size: file.size,
      dominantColor,
      album: albumId,
      user: userId,
      fileName: file.originalname,
      filePath: file.path,
      fileUrl,
      mimeType: file.mimetype,
      dimensions
    });

    await photo.save();

    // Atualizar contagem de fotos no álbum
    await Album.updatePhotoCount(albumId);

    res.status(201).json({
      success: true,
      message: 'Foto enviada com sucesso',
      photo: {
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
      }
    });
  } catch (error: any) {
    console.error('Erro ao enviar foto:', error);
    if (req.file) cleanupFile(req.file);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao enviar foto', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Upload múltiplo de fotos
 */
export const uploadMultiplePhotos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { albumId } = req.params;
    const userId = req.user?.userId;
    const files = req.files as Express.Multer.File[];

    // Validações
    if (!mongoose.Types.ObjectId.isValid(albumId)) {
      cleanupFiles(files);
      res.status(400).json({ 
        success: false, 
        error: 'ID do álbum inválido' 
      });
      return;
    }

    if (!files || files.length === 0) {
      res.status(400).json({ 
        success: false, 
        error: 'Nenhuma imagem enviada' 
      });
      return;
    }

    // Verificar se álbum existe
    const album = await Album.findOne({ _id: albumId, user: userId });
    if (!album) {
      cleanupFiles(files);
      res.status(404).json({ 
        success: false, 
        error: 'Álbum não encontrado' 
      });
      return;
    }

    const uploadedPhotos = [];

    // Processar cada foto
    for (const file of files) {
      try {
        const filePath = path.join(__dirname, '..', '..', file.path);
        const fileNameWithoutExt = path.parse(file.originalname).name;
        
        // Obter dimensões e metadados
        let dimensions: { width: number; height: number } | undefined;
        let dominantColor = '#000000';
        let acquisitionDate = new Date();

        try {
          const exifData = await readExifData(filePath);
          if (exifData?.acquisitionDate) {
            acquisitionDate = exifData.acquisitionDate;
          }
          if (exifData?.dimensions) {
            dimensions = exifData.dimensions;
          }

          dominantColor = await detectDominantColor(filePath);
          
          if (!dimensions) {
            const metadata = await sharp(filePath).metadata();
            if (metadata.width && metadata.height) {
              dimensions = { width: metadata.width, height: metadata.height };
            }
          }
        } catch (error) {
          console.warn(`Erro ao processar metadados de ${file.originalname}:`, error);
        }

        const fileUrl = `/uploads/${path.basename(file.path)}`;

        const photo = new Photo({
          title: fileNameWithoutExt,
          description: '',
          acquisitionDate,
          size: file.size,
          dominantColor,
          album: albumId,
          user: userId,
          fileName: file.originalname,
          filePath: file.path,
          fileUrl,
          mimeType: file.mimetype,
          dimensions
        });

        await photo.save();
        uploadedPhotos.push({
          id: photo._id,
          title: photo.title,
          fileName: photo.fileName,
          fileUrl: photo.fileUrl,
          sizeFormatted: formatFileSize(photo.size)
        });
      } catch (error) {
        console.error(`Erro ao processar ${file.originalname}:`, error);
        // Continua com as outras fotos
      }
    }

    // Atualizar contagem de fotos no álbum
    await Album.updatePhotoCount(albumId);

    res.status(201).json({
      success: true,
      message: `${uploadedPhotos.length} de ${files.length} fotos enviadas com sucesso`,
      photos: uploadedPhotos,
      uploaded: uploadedPhotos.length,
      failed: files.length - uploadedPhotos.length
    });
  } catch (error: any) {
    console.error('Erro no upload múltiplo:', error);
    cleanupFiles(req.files as Express.Multer.File[]);
    res.status(500).json({ 
      success: false, 
      error: 'Erro no upload de fotos' 
    });
  }
};

/**
 * Listar fotos de um álbum
 */
export const getPhotosByAlbum = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { albumId } = req.params;
    const userId = req.user?.userId;
    const { sortBy = 'acquisitionDate', order = 'desc' } = req.query;

    if (!mongoose.Types.ObjectId.isValid(albumId)) {
      res.status(400).json({ 
        success: false, 
        error: 'ID do álbum inválido' 
      });
      return;
    }

    // Verificar se álbum pertence ao usuário
    const album = await Album.findOne({ _id: albumId, user: userId });
    if (!album) {
      res.status(404).json({ 
        success: false, 
        error: 'Álbum não encontrado' 
      });
      return;
    }

    // Configurar ordenação
    const sortOptions: any = {};
    if (sortBy === 'title') {
      sortOptions.title = order === 'asc' ? 1 : -1;
    } else if (sortBy === 'size') {
      sortOptions.size = order === 'asc' ? 1 : -1;
    } else {
      sortOptions.acquisitionDate = order === 'asc' ? 1 : -1;
    }

    const photos = await Photo.find({ album: albumId })
      .sort(sortOptions)
      .lean();

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
      photos: formattedPhotos,
      count: formattedPhotos.length,
      album: {
        id: album._id,
        title: album.title,
        photoCount: album.photoCount
      }
    });
  } catch (error: any) {
    console.error('Erro ao buscar fotos:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao buscar fotos' 
    });
  }
};

/**
 * Obter foto específica
 */
export const getPhotoById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ 
        success: false, 
        error: 'ID da foto inválido' 
      });
      return;
    }

    const photo = await Photo.findOne({ _id: id, user: userId }).lean();
    
    if (!photo) {
      res.status(404).json({ 
        success: false, 
        error: 'Foto não encontrada' 
      });
      return;
    }

    res.json({
      success: true,
      photo: {
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
      }
    });
  } catch (error: any) {
    console.error('Erro ao buscar foto:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao buscar foto' 
    });
  }
};

/**
 * Atualizar foto (título e descrição)
 */
export const updatePhoto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const userId = req.user?.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ 
        success: false, 
        error: 'ID da foto inválido' 
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

    const photo = await Photo.findOneAndUpdate(
      { _id: id, user: userId },
      updates,
      { new: true, runValidators: true }
    ).lean();

    if (!photo) {
      res.status(404).json({ 
        success: false, 
        error: 'Foto não encontrada' 
      });
      return;
    }

    res.json({
      success: true,
      message: 'Foto atualizada com sucesso',
      photo: {
        id: photo._id,
        title: photo.title,
        description: photo.description,
        fileUrl: photo.fileUrl,
        dominantColor: photo.dominantColor
      }
    });
  } catch (error: any) {
    console.error('Erro ao atualizar foto:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao atualizar foto' 
    });
  }
};

/**
 * Excluir foto
 */
export const deletePhoto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ 
        success: false, 
        error: 'ID da foto inválido' 
      });
      return;
    }

    const photo = await Photo.findOne({ _id: id, user: userId });
    
    if (!photo) {
      res.status(404).json({ 
        success: false, 
        error: 'Foto não encontrada' 
      });
      return;
    }

    // Remover arquivo físico
    try {
      if (fs.existsSync(photo.filePath)) {
        fs.unlinkSync(photo.filePath);
      }
    } catch (error) {
      console.warn('Não foi possível remover o arquivo físico:', error);
      // Continua mesmo se não conseguir remover o arquivo
    }

    await photo.deleteOne();

    // Atualizar contagem de fotos no álbum
    await Album.updatePhotoCount(photo.album.toString());

    res.json({
      success: true,
      message: 'Foto excluída com sucesso'
    });
  } catch (error: any) {
    console.error('Erro ao excluir foto:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao excluir foto' 
    });
  }
};

/**
 * Funções auxiliares
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function cleanupFile(file?: Express.Multer.File): void {
  if (file && file.path && fs.existsSync(file.path)) {
    try {
      fs.unlinkSync(file.path);
    } catch (error) {
      console.warn('Não foi possível limpar arquivo temporário:', error);
    }
  }
}

function cleanupFiles(files?: Express.Multer.File[]): void {
  if (files) {
    files.forEach(cleanupFile);
  }
}