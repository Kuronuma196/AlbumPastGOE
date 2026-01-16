export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Album {
  id: string;
  title: string;
  description: string;
  userId: string;
  isPublic: boolean;
  shareToken?: string;
  photoCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Photo {
  id: string;
  title: string;
  description: string;
  acquisitionDate: string;
  size: number; // bytes
  sizeFormatted: string; // "255 KB", "1.2 MB"
  dominantColor: string;
  albumId: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  dimensions?: {
    width: number;
    height: number;
  };
  createdAt: string;
}



export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Album {
  id: string;
  title: string;
  description: string;
  userId: string;
  isPublic: boolean;
  shareToken?: string;
  photoCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Photo {
  id: string;
  title: string;
  description: string;
  acquisitionDate: string;
  size: number;
  sizeFormatted: string;
  dominantColor: string;
  albumId: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  dimensions?: {
    width: number;
    height: number;
  };
  createdAt: string;
}

export type ViewMode = 'table' | 'thumbnails';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}