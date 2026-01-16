import api from './api';
import { Album, ApiResponse } from '../types';

export const albumService = {
  // Buscar todos os álbuns do usuário
  getAll: async (): Promise<Album[]> => {
    try {
      const response = await api.get<ApiResponse<{ albums: Album[] }>>('/albums');
      if (response.data.success) {
        return response.data.data?.albums || [];
      }
      throw new Error(response.data.error || 'Erro ao buscar álbuns');
    } catch (error: any) {
      console.error('Erro em albumService.getAll:', error);
      throw error;
    }
  },

  // Buscar álbum específico
  getById: async (id: string): Promise<Album> => {
    try {
      const response = await api.get<ApiResponse<{ album: Album }>>(`/albums/${id}`);
      if (response.data.success && response.data.data?.album) {
        return response.data.data.album;
      }
      throw new Error(response.data.error || 'Álbum não encontrado');
    } catch (error: any) {
      console.error('Erro em albumService.getById:', error);
      throw error;
    }
  },

  // Buscar álbum público por token
  getPublicAlbum: async (token: string): Promise<{ album: Album; photos: any[] }> => {
    try {
      const response = await api.get<ApiResponse>(`/albums/public/${token}`);
      if (response.data.success) {
        return response.data.data as { album: Album; photos: any[] };
      }
      throw new Error(response.data.error || 'Álbum não encontrado');
    } catch (error: any) {
      console.error('Erro em albumService.getPublicAlbum:', error);
      throw error;
    }
  },

  // Criar novo álbum
  create: async (albumData: { title: string; description?: string }): Promise<Album> => {
    try {
      const response = await api.post<ApiResponse<{ album: Album }>>('/albums', albumData);
      if (response.data.success && response.data.data?.album) {
        return response.data.data.album;
      }
      throw new Error(response.data.error || 'Erro ao criar álbum');
    } catch (error: any) {
      console.error('Erro em albumService.create:', error);
      throw error;
    }
  },

  // Atualizar álbum
  update: async (id: string, albumData: { title?: string; description?: string }): Promise<Album> => {
    try {
      const response = await api.put<ApiResponse<{ album: Album }>>(`/albums/${id}`, albumData);
      if (response.data.success && response.data.data?.album) {
        return response.data.data.album;
      }
      throw new Error(response.data.error || 'Erro ao atualizar álbum');
    } catch (error: any) {
      console.error('Erro em albumService.update:', error);
      throw error;
    }
  },

  // Excluir álbum
  delete: async (id: string): Promise<void> => {
    try {
      const response = await api.delete<ApiResponse>(`/albums/${id}`);
      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro ao excluir álbum');
      }
    } catch (error: any) {
      console.error('Erro em albumService.delete:', error);
      throw error;
    }
  },

  // Gerar link de compartilhamento
  generateShareLink: async (id: string): Promise<{ shareToken: string; shareUrl: string }> => {
    try {
      const response = await api.post<ApiResponse>(`/albums/${id}/share`);
      if (response.data.success) {
        return response.data.data as { shareToken: string; shareUrl: string };
      }
      throw new Error(response.data.error || 'Erro ao gerar link');
    } catch (error: any) {
      console.error('Erro em albumService.generateShareLink:', error);
      throw error;
    }
  },

  // Remover compartilhamento
  removeShare: async (id: string): Promise<void> => {
    try {
      const response = await api.delete<ApiResponse>(`/albums/${id}/share`);
      if (!response.data.success) {
        throw new Error(response.data.error || 'Erro ao remover compartilhamento');
      }
    } catch (error: any) {
      console.error('Erro em albumService.removeShare:', error);
      throw error;
    }
  }
};