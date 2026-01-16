import React, { useState } from 'react';
import { Photo } from '../../types';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Eye, 
  Download, 
  Trash2, 
  Edit, 
  Calendar, 
  FileText, 
  Palette,
  Image as ImageIcon,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface PhotoCardProps {
  photo: Photo;
  onView: (photo: Photo) => void;
  onEdit: (photo: Photo) => void;
  onDelete: (photoId: string) => void;
  onDownload: (photo: Photo) => void;
  compact?: boolean;
}

const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  onView,
  onEdit,
  onDelete,
  onDownload,
  compact = false
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getFileTypeColor = (mimeType: string) => {
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
      return 'bg-blue-100 text-blue-800';
    } else if (mimeType.includes('png')) {
      return 'bg-green-100 text-green-800';
    } else if (mimeType.includes('gif')) {
      return 'bg-purple-100 text-purple-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  };

  if (compact) {
    return (
      <div 
        className="group relative cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onView(photo)}
      >
        <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
          <img
            src={photo.fileUrl}
            alt={photo.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        </div>
        
        {isHovered && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center space-x-2 rounded-lg">
            <Button
              variant="secondary"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onView(photo);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onDownload(photo);
              }}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(photo.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="mt-2">
          <p className="text-sm font-medium truncate">{photo.title}</p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{photo.sizeFormatted}</span>
            <span>{formatDate(photo.acquisitionDate)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-shadow"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="p-0">
        <div className="relative aspect-square bg-gray-100">
          <img
            src={photo.fileUrl}
            alt={photo.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          
          {isHovered && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onView(photo)}
              >
                <Eye className="h-4 w-4 mr-1" />
                Visualizar
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onDownload(photo)}
              >
                <Download className="h-4 w-4 mr-1" />
                Baixar
              </Button>
            </div>
          )}
          
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(photo)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Visualizar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDownload(photo)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(photo)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(photo.id)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {photo.dominantColor && (
            <div className="absolute top-2 left-2">
              <div 
                className="w-6 h-6 rounded-full border-2 border-white shadow"
                style={{ backgroundColor: photo.dominantColor }}
                title={`Cor predominante: ${photo.dominantColor}`}
              />
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-sm mb-1 truncate" title={photo.title}>
              {photo.title}
            </h3>
            {photo.description && (
              <p className="text-xs text-gray-600 line-clamp-2" title={photo.description}>
                {photo.description}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center text-gray-500">
                <FileText className="h-3 w-3 mr-1" />
                <span>Tamanho:</span>
              </div>
              <span className="font-medium">{photo.sizeFormatted}</span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center text-gray-500">
                <Calendar className="h-3 w-3 mr-1" />
                <span>Data:</span>
              </div>
              <span className="font-medium">{formatDate(photo.acquisitionDate)}</span>
            </div>
            
            {photo.dimensions && (
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center text-gray-500">
                  <ImageIcon className="h-3 w-3 mr-1" />
                  <span>Dimensões:</span>
                </div>
                <span className="font-medium">
                  {photo.dimensions.width} × {photo.dimensions.height}px
                </span>
              </div>
            )}
            
            {photo.dominantColor && (
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center text-gray-500">
                  <Palette className="h-3 w-3 mr-1" />
                  <span>Cor:</span>
                </div>
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-1 border"
                    style={{ backgroundColor: photo.dominantColor }}
                  />
                  <span className="font-medium truncate max-w-[80px]">
                    {photo.dominantColor}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Badge 
          variant="outline" 
          className={`text-xs ${getFileTypeColor(photo.mimeType)}`}
        >
          {photo.mimeType.split('/')[1].toUpperCase()}
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default PhotoCard;