import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { albumService } from '../services/albumService';
import { photoService } from '../services/photoService';
import { Album, Photo, ViewMode } from '../types';

// Importar componentes
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Skeleton } from '../components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  Grid,
  Table,
  Upload,
  Plus,
  Trash2,
  Image as ImageIcon,
  Calendar,
  FileText,
  Palette,
  Download,
  MoreVertical,
  Search,
  Filter,
  Share2,
  Eye,
  EyeOff
} from 'lucide-react';

// Importar componentes específicos
import PhotoCard from '../components/photos/PhotoCard';
import PhotoTableView from '../components/photos/PhotoTableView';
import PhotoUploader from '../components/photos/PhotoUploader';
import PhotoFormModal from '../components/photos/PhotoFormModal';

// Componente para visualização em miniaturas
const ThumbnailView: React.FC<{ photos: Photo[]; onPhotoClick: (photo: Photo) => void; onDelete: (photoId: string) => void }> = ({ 
  photos, 
  onPhotoClick, 
  onDelete 
}) => {
  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <ImageIcon className="h-24 w-24 mx-auto text-gray-300" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhuma foto no álbum</h3>
        <p className="mt-2 text-gray-600">Adicione fotos para começar a visualizar</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {photos.map((photo) => (
        <div 
          key={photo.id} 
          className="group relative cursor-pointer"
          onClick={() => onPhotoClick(photo)}
        >
          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
            <img
              src={photo.fileUrl}
              alt={photo.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
          </div>
          <div className="mt-2">
            <p className="text-sm font-medium truncate">{photo.title}</p>
            <p className="text-xs text-gray-500 truncate">
              {photo.sizeFormatted} • {new Date(photo.acquisitionDate).toLocaleDateString()}
            </p>
          </div>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="destructive"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(photo.id);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Componente principal da página
const AlbumView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [album, setAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados para visualização
  const [viewMode, setViewMode] = useState<ViewMode>('thumbnails');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'acquisitionDate' | 'title' | 'size'>('acquisitionDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Estados para modais
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  // Estados para formulários
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumDescription, setAlbumDescription] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  
  // Estados para ações
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Carregar álbum e fotos
  useEffect(() => {
    if (id) {
      loadAlbumAndPhotos();
    }
  }, [id, sortBy, sortOrder]);

  const loadAlbumAndPhotos = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Carregar álbum
      const albumData = await albumService.getById(id!);
      setAlbum(albumData);
      setAlbumTitle(albumData.title);
      setAlbumDescription(albumData.description || '');
      
      // Carregar fotos
      const photosData = await photoService.getByAlbum(id!, sortBy, sortOrder);
      setPhotos(photosData);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar álbum');
      console.error('Erro ao carregar álbum:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar fotos por busca
  const filteredPhotos = photos.filter(photo =>
    photo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    photo.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Atualizar álbum
  const handleUpdateAlbum = async () => {
    if (!album || !albumTitle.trim()) {
      setError('O título do álbum é obrigatório');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      const updatedAlbum = await albumService.update(album.id, {
        title: albumTitle.trim(),
        description: albumDescription.trim()
      });
      
      setAlbum(updatedAlbum);
      setIsEditModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar álbum');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Excluir álbum
  const handleDeleteAlbum = async () => {
    if (!album) return;

    try {
      setIsDeleting(true);
      setError('');
      
      await albumService.delete(album.id);
      navigate('/albums');
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir álbum');
      setIsDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Excluir foto
  const handleDeletePhoto = async (photoId: string) => {
    try {
      setError('');
      await photoService.delete(photoId);
      setPhotos(photos.filter(photo => photo.id !== photoId));
      
      // Atualizar contagem no álbum
      if (album) {
        const updatedAlbum = await albumService.getById(album.id);
        setAlbum(updatedAlbum);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir foto');
    }
  };

  // Upload de fotos
  const handleUploadPhotos = async (files: File[], titles?: string[], descriptions?: string[]) => {
    try {
      setError('');
      setUploadProgress(0);
      
      const uploadedPhotos: Photo[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const title = titles?.[i] || file.name.replace(/\.[^/.]+$/, "");
        const description = descriptions?.[i] || '';
        
        const photo = await photoService.upload(album!.id, file, { title, description });
        uploadedPhotos.push(photo);
        
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }
      
      // Adicionar novas fotos à lista
      setPhotos([...uploadedPhotos, ...photos]);
      
      // Atualizar álbum para refletir nova contagem
      const updatedAlbum = await albumService.getById(album!.id);
      setAlbum(updatedAlbum);
      
      setIsUploadModalOpen(false);
      setUploadProgress(0);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar fotos');
    }
  };

  // Gerar link de compartilhamento
  const handleShareAlbum = async () => {
    if (!album) return;
    
    try {
      setError('');
      
      if (album.shareToken) {
        setShareUrl(`${window.location.origin}/album/public/${album.shareToken}`);
      } else {
        const result = await albumService.generateShareLink(album.id);
        setShareUrl(result.shareUrl);
        
        // Atualizar álbum
        const updatedAlbum = await albumService.getById(album.id);
        setAlbum(updatedAlbum);
      }
      
      setIsShareModalOpen(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar link de compartilhamento');
    }
  };

  // Remover compartilhamento
  const handleRemoveShare = async () => {
    if (!album) return;

    try {
      await albumService.removeShare(album.id);
      setShareUrl('');
      
      // Atualizar álbum
      const updatedAlbum = await albumService.getById(album.id);
      setAlbum(updatedAlbum);
    } catch (err: any) {
      setError(err.message || 'Erro ao remover compartilhamento');
    }
  };

  // Alternar modo de visualização
  const toggleViewMode = () => {
    setViewMode(viewMode === 'thumbnails' ? 'table' : 'thumbnails');
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Skeleton loader
  const PhotoSkeleton = () => (
    <div className="aspect-square rounded-lg bg-gray-200 animate-pulse" />
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded" />
              <div>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32 mt-1" />
              </div>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <PhotoSkeleton key={i} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Álbum não encontrado</CardTitle>
            <CardDescription>
              O álbum que você está tentando acessar não existe ou você não tem permissão para visualizá-lo.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => navigate('/albums')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Meus Álbuns
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/albums')}
                className="mt-1"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-bold text-gray-900 truncate">
                    {album.title}
                  </h1>
                  {album.isPublic && (
                    <Badge variant="outline" className="text-xs">
                      <Globe className="h-3 w-3 mr-1" />
                      Público
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {album.description || 'Sem descrição'}
                </p>
                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                  <span className="flex items-center">
                    <ImageIcon className="h-3 w-3 mr-1" />
                    {album.photoCount} foto{album.photoCount !== 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Atualizado em {formatDate(album.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareAlbum}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              
              <Button
                onClick={() => setIsUploadModalOpen(true)}
                size="sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                Adicionar Fotos
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Barra de ferramentas */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center space-x-2">
            <div className="relative w-full sm:w-64">
              <Input
                type="search"
                placeholder="Buscar fotos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Ordenar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => { setSortBy('acquisitionDate'); setSortOrder('desc'); }}>
                  Data (mais recente)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortBy('acquisitionDate'); setSortOrder('asc'); }}>
                  Data (mais antiga)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortBy('title'); setSortOrder('asc'); }}>
                  Título (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortBy('title'); setSortOrder('desc'); }}>
                  Título (Z-A)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortBy('size'); setSortOrder('desc'); }}>
                  Tamanho (maior)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setSortBy('size'); setSortOrder('asc'); }}>
                  Tamanho (menor)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-600">
              {filteredPhotos.length} de {photos.length} foto{filteredPhotos.length !== 1 ? 's' : ''}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleViewMode}
            >
              {viewMode === 'thumbnails' ? (
                <>
                  <Table className="h-4 w-4 mr-2" />
                  Tabela
                </>
              ) : (
                <>
                  <Grid className="h-4 w-4 mr-2" />
                  Miniaturas
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Conteúdo principal */}
        {photos.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <ImageIcon className="h-24 w-24 mx-auto text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Álbum vazio</h3>
              <p className="mt-2 text-gray-600 mb-6">
                Este álbum ainda não possui fotos. Adicione fotos para começar.
              </p>
              <Button onClick={() => setIsUploadModalOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Adicionar Primeiras Fotos
              </Button>
            </CardContent>
          </Card>
        ) : filteredPhotos.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="h-24 w-24 mx-auto text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhuma foto encontrada</h3>
              <p className="mt-2 text-gray-600">
                Nenhuma foto corresponde à busca "{searchTerm}".
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {viewMode === 'thumbnails' ? (
              <ThumbnailView
                photos={filteredPhotos}
                onPhotoClick={(photo) => {
                  setSelectedPhoto(photo);
                  setIsPhotoModalOpen(true);
                }}
                onDelete={handleDeletePhoto}
              />
            ) : (
              <PhotoTableView
                photos={filteredPhotos}
                onDelete={handleDeletePhoto}
                onEdit={(photo) => {
                  setSelectedPhoto(photo);
                  // Aqui você pode abrir um modal de edição de foto
                }}
              />
            )}
          </>
        )}

        {/* Modal de Edição do Álbum */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Álbum</DialogTitle>
              <DialogDescription>
                Atualize as informações do álbum.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Título *</Label>
                <Input
                  id="edit-title"
                  value={albumTitle}
                  onChange={(e) => setAlbumTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  value={albumDescription}
                  onChange={(e) => setAlbumDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateAlbum} disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Upload */}
        <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar Fotos</DialogTitle>
              <DialogDescription>
                Selecione as fotos que deseja adicionar ao álbum.
              </DialogDescription>
            </DialogHeader>
            
            <PhotoUploader
              onUpload={handleUploadPhotos}
              uploadProgress={uploadProgress}
              onClose={() => setIsUploadModalOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Modal de Visualização da Foto */}
        {selectedPhoto && (
          <Dialog open={isPhotoModalOpen} onOpenChange={setIsPhotoModalOpen}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{selectedPhoto.title}</DialogTitle>
                <DialogDescription>
                  {selectedPhoto.description}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={selectedPhoto.fileUrl}
                      alt={selectedPhoto.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Informações</h4>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tamanho:</span>
                        <span className="text-sm font-medium">{selectedPhoto.sizeFormatted}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Data:</span>
                        <span className="text-sm font-medium">
                          {new Date(selectedPhoto.acquisitionDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Formato:</span>
                        <span className="text-sm font-medium">{selectedPhoto.mimeType}</span>
                      </div>
                      {selectedPhoto.dimensions && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Dimensões:</span>
                          <span className="text-sm font-medium">
                            {selectedPhoto.dimensions.width} × {selectedPhoto.dimensions.height}px
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Cor predominante:</span>
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-2 border"
                            style={{ backgroundColor: selectedPhoto.dominantColor }}
                          />
                          <span className="text-sm font-medium">{selectedPhoto.dominantColor}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-500">Ações</h4>
                    <div className="flex space-x-2">
                      <Button variant="outline" className="flex-1" onClick={() => {
                        // Implementar download
                        window.open(selectedPhoto.fileUrl, '_blank');
                      }}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          handleDeletePhoto(selectedPhoto.id);
                          setIsPhotoModalOpen(false);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Modal de Compartilhamento */}
        <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Compartilhar Álbum</DialogTitle>
              <DialogDescription>
                Compartilhe este álbum com outras pessoas através do link abaixo.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {shareUrl ? (
                <>
                  <div className="space-y-2">
                    <Label>Link de Compartilhamento</Label>
                    <div className="flex">
                      <Input
                        value={shareUrl}
                        readOnly
                        className="flex-1 font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        className="ml-2"
                        onClick={() => {
                          navigator.clipboard.writeText(shareUrl);
                        }}
                      >
                        Copiar
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Qualquer pessoa com este link poderá ver o álbum.
                    </p>
                  </div>
                  
                  <Button
                    variant="destructive"
                    onClick={handleRemoveShare}
                    className="w-full"
                  >
                    Remover Compartilhamento
                  </Button>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600">Gerando link de compartilhamento...</p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsShareModalOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Diálogo de Confirmação de Exclusão do Álbum */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Excluir Álbum</DialogTitle>
              <DialogDescription>
                {album.photoCount > 0 ? (
                  <>
                    Este álbum contém {album.photoCount} foto{album.photoCount !== 1 ? 's' : ''}. 
                    Você não pode excluir um álbum que contém fotos.
                    <br /><br />
                    Exclua as fotos primeiro ou mova-as para outro álbum.
                  </>
                ) : (
                  'Tem certeza que deseja excluir este álbum? Esta ação não pode ser desfeita.'
                )}
              </DialogDescription>
            </DialogHeader>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAlbum}
                disabled={album.photoCount > 0 || isDeleting}
              >
                {isDeleting ? 'Excluindo...' : 'Excluir Álbum'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AlbumView;