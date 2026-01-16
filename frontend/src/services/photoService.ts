import api from './api';
import { Photo, ApiResponse } from '../types';

export const photoService = {
  // Buscar fotos de um álbum
  getByAlbum: async (albumId: string, sortBy?: string, order?: string): Promise<Photo[]> => {
    try {
      const params: any = {};
      if (sortBy) params.sortBy = sortBy;
      if (order) params.order = order;
      
      const response = await api.get<ApiResponse<{ photos: Photo[] }>>(`/photos/album/${albumId}`, { params });
      if (response.data.success) {
        return response.data.data?.photos || [];
      }
      throw new Error(response.data.error || 'Erro ao buscar fotos');
    } catch (error: any) {
      console.error('Erro em photoService.getByAlbum:', error);
      throw error;
    }
  },

  // Upload de uma foto
  upload: async (albumId: string, file: File, photoData: { title: string; description?: string }): Promise<Photo> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', photoData.title);
      if (photoData.description) {
        formData.append('description', photoData.description);
      }

      const response = await api.post<ApiResponse<{ photo: Photo }>>(`/photos/upload/${albumId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success && response.data.data?.photo) {
        return response.data.data.photo;
      }
      throw new Error(response.data.error || 'Erro ao enviar foto');
    } catch (error: any) {
      console.error('Erro em photoService.upload:', error);
      throw error;
    }
  },

  // Upload múltiplo de fotos
  uploadMultiple: async (albumId: string, files: File[]): Promise<Photo[]> => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await api.post<ApiResponse<{ photos: Photo[] }>>(`/photos/upload-multiple/${albumId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        return response.data.data?.photos || [];
      }
      throw new Error(response.data.error || 'Erro ao enviar fotos');
    } catch (error: any) {
      console.error('Erro em photoService.uploadMultiple:', error);
      throw error;
    }
  },

  // Atualizar foto
  update: async (id: string, photoData: { title?: string; description?: string }): Promise<Photo> => {
    try {
      const response = await api.put<ApiResponse<{ photo: Photo }>>(`/photos/${id}`, photoData);
      if (response.data.success && response.data.data?.photo) {
        return response.data.data.photo;
      }
      throw new Error(response.data.error || 'Erro ao atualizar foto');
    } catch (error: any) {
      console.error('Erro em photoService.update:', error);
      throw error;
    }
  },

  // Excluir foto
  delete: async (id: string): Promise<void> => {
    try {
      const response = await api.delete<ApiResponse>(`/photos/${id}`);
      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro ao excluir foto');
      }
    } catch (error: any) {
      console.error('Erro em photoService.delete:', error);
      throw error;
    }
  },

  // Buscar foto específica
  getById: async (id: string): Promise<Photo> => {
    try {
      const response = await api.get<ApiResponse<{ photo: Photo }>>(`/photos/${id}`);
      if (response.data.success && response.data.data?.photo) {
        return response.data.data.photo;
      }
      throw new Error(response.data.error || 'Foto não encontrada');
    } catch (error: any) {
      console.error('Erro em photoService.getById:', error);
      throw error;
    }
  }
};