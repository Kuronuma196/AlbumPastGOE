import React from 'react';
import { Album } from '../../types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { 
  MoreVertical, 
  Image, 
  Calendar, 
  Users,
  ExternalLink,
  Edit,
  Share2,
  Trash2,
  Lock,
  Globe
} from 'lucide-react';

interface AlbumCardProps {
  album: Album;
  onView: (album: Album) => void;
  onEdit: (album: Album) => void;
  onShare: (album: Album) => void;
  onDelete: (album: Album) => void;
  showActions?: boolean;
  compact?: boolean;
}

const AlbumCard: React.FC<AlbumCardProps> = ({
  album,
  onView,
  onEdit,
  onShare,
  onDelete,
  showActions = true,
  compact = false
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getAlbumIcon = () => {
    if (album.isPublic) {
      return <Globe className="h-4 w-4 text-green-600" />;
    }
    return <Lock className="h-4 w-4 text-gray-500" />;
  };

  if (compact) {
    return (
      <Card className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => onView(album)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Image className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-sm">{album.title}</h3>
                <p className="text-xs text-gray-500 truncate max-w-[200px]">
                  {album.description || 'Sem descrição'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={album.photoCount > 0 ? "default" : "secondary"} className="text-xs">
                {album.photoCount} foto{album.photoCount !== 1 ? 's' : ''}
              </Badge>
              {getAlbumIcon()}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <CardTitle className="text-lg truncate">{album.title}</CardTitle>
              {album.isPublic && (
                <Badge variant="outline" className="text-xs">
                  <Globe className="h-3 w-3 mr-1" />
                  Público
                </Badge>
              )}
            </div>
            <CardDescription className="line-clamp-2">
              {album.description || 'Sem descrição'}
            </CardDescription>
          </div>
          
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onView(album)}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Abrir
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(album)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onShare(album)}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Compartilhar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(album)}
                  className="text-red-600"
                  disabled={album.photoCount > 0}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                  {album.photoCount > 0 && (
                    <span className="ml-2 text-xs text-gray-500">
                      ({album.photoCount} foto{album.photoCount !== 1 ? 's' : ''})
                    </span>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div 
          className={`flex items-center justify-center rounded-lg mb-4 ${album.photoCount > 0 ? 'bg-gradient-to-br from-blue-50 to-indigo-50' : 'bg-gray-100'}`}
          style={{ 
            height: compact ? '120px' : '160px',
            background: album.dominantColor ? `linear-gradient(135deg, ${album.dominantColor}20, ${album.dominantColor}40)` : undefined
          }}
        >
          {album.photoCount > 0 ? (
            <div className="text-center">
              <Image className={`mx-auto ${compact ? 'h-10 w-10' : 'h-12 w-12'} text-blue-600`} />
              <p className={`mt-2 ${compact ? 'text-sm' : 'text-base'} font-medium`}>
                {album.photoCount} foto{album.photoCount !== 1 ? 's' : ''}
              </p>
            </div>
          ) : (
            <div className="text-center">
              <Image className={`mx-auto ${compact ? 'h-10 w-10' : 'h-12 w-12'} text-gray-400`} />
              <p className="mt-2 text-sm text-gray-500">Álbum vazio</p>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{formatDate(album.updatedAt)}</span>
            </div>
            <div className="flex items-center">
              {getAlbumIcon()}
            </div>
          </div>
          
          {album.photoCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {Math.round(album.photoCount / 10)} MB aprox.
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button 
          className="w-full" 
          variant={album.photoCount > 0 ? "default" : "outline"}
          size={compact ? "sm" : "default"}
          onClick={() => onView(album)}
        >
          {album.photoCount > 0 ? 'Ver Álbum' : 'Adicionar Fotos'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AlbumCard;