import React, { useState } from 'react';
import { Photo } from '../../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { 
  Eye, 
  Download, 
  Trash2, 
  Edit, 
  Calendar, 
  FileText,
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

interface PhotoTableViewProps {
  photos: Photo[];
  onView: (photo: Photo) => void;
  onEdit: (photo: Photo) => void;
  onDelete: (photoId: string) => void;
  onDownload: (photo: Photo) => void;
  onSelect?: (photoIds: string[]) => void;
  enableSelection?: boolean;
}

const PhotoTableView: React.FC<PhotoTableViewProps> = ({
  photos,
  onView,
  onEdit,
  onDelete,
  onDownload,
  onSelect,
  enableSelection = false
}) => {
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSelectPhoto = (photoId: string, checked: boolean) => {
    let newSelected: string[];
    
    if (checked) {
      newSelected = [...selectedPhotos, photoId];
    } else {
      newSelected = selectedPhotos.filter(id => id !== photoId);
    }
    
    setSelectedPhotos(newSelected);
    if (onSelect) {
      onSelect(newSelected);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = photos.map(photo => photo.id);
      setSelectedPhotos(allIds);
      if (onSelect) {
        onSelect(allIds);
      }
    } else {
      setSelectedPhotos([]);
      if (onSelect) {
        onSelect([]);
      }
    }
  };

  const getFileTypeIcon = (mimeType: string) => {
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
      return '🖼️';
    } else if (mimeType.includes('png')) {
      return '📸';
    } else if (mimeType.includes('gif')) {
      return '🎞️';
    } else {
      return '📁';
    }
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <ImageIcon className="h-24 w-24 mx-auto text-gray-300" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhuma foto para exibir</h3>
        <p className="mt-2 text-gray-600">Adicione fotos para ver a visualização em tabela</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {enableSelection && (
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedPhotos.length === photos.length && photos.length > 0}
                  onCheckedChange={handleSelectAll}
                  aria-label="Selecionar todas as fotos"
                />
              </TableHead>
            )}
            <TableHead className="w-12">#</TableHead>
            <TableHead>Foto</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Tamanho</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Cor</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {photos.map((photo, index) => (
            <TableRow key={photo.id} className="hover:bg-gray-50">
              {enableSelection && (
                <TableCell>
                  <Checkbox
                    checked={selectedPhotos.includes(photo.id)}
                    onCheckedChange={(checked) => 
                      handleSelectPhoto(photo.id, checked as boolean)
                    }
                    aria-label={`Selecionar ${photo.title}`}
                  />
                </TableCell>
              )}
              
              <TableCell className="font-medium">{index + 1}</TableCell>
              
              <TableCell>
                <div className="flex items-center space-x-2">
                  <div className="h-10 w-10 rounded overflow-hidden">
                    <img
                      src={photo.fileUrl}
                      alt={photo.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="text-lg">{getFileTypeIcon(photo.mimeType)}</span>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="font-medium max-w-[200px] truncate" title={photo.title}>
                  {photo.title}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="max-w-[250px] truncate text-sm text-gray-600" title={photo.description}>
                  {photo.description || '-'}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="font-mono text-sm">{photo.sizeFormatted}</span>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-sm">{formatDate(photo.acquisitionDate)}</span>
                </div>
              </TableCell>
              
              <TableCell>
                {photo.dominantColor ? (
                  <div className="flex items-center space-x-2">
                    <div 
                      className="h-4 w-4 rounded-full border"
                      style={{ backgroundColor: photo.dominantColor }}
                    />
                    <span className="text-xs font-mono truncate max-w-[80px]">
                      {photo.dominantColor}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm">-</span>
                )}
              </TableCell>
              
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {enableSelection && selectedPhotos.length > 0 && (
        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t">
          <div className="text-sm text-gray-700">
            {selectedPhotos.length} foto{selectedPhotos.length !== 1 ? 's' : ''} selecionada{selectedPhotos.length !== 1 ? 's' : ''}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Implementar ações em lote
                console.log('Ações em lote para:', selectedPhotos);
              }}
            >
              Ações em Lote
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                // Implementar exclusão em lote
                selectedPhotos.forEach(id => onDelete(id));
                setSelectedPhotos([]);
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Selecionadas
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoTableView;