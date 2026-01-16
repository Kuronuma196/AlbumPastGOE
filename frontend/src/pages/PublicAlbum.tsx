import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { albumService } from '../services/albumService';
import { Photo } from '../types';

// Importar componentes
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  ArrowLeft, 
  Image as ImageIcon, 
  Calendar, 
  Users,
  Download,
  Eye,
  Share2,
  Globe,
  Lock,
  Copy,
  Check,
  Grid,
  Table
} from 'lucide-react';

// Componentes reutilizáveis
const ThumbnailView: React.FC<{ photos: any[]; onPhotoClick: (photo: any) => void }> = ({ 
  photos, 
  onPhotoClick 
}) => {
  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <ImageIcon className="h-24 w-24 mx-auto text-gray-300" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhuma foto no álbum</h3>
        <p className="mt-2 text-gray-600">Este álbum não contém fotos</p>
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
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
        </div>
      ))}
    </div>
  );
};

const TableView: React.FC<{ photos: any[] }> = ({ photos }) => {
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

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Foto
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Título
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Descrição
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tamanho
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Data
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {photos.map((photo) => (
            <tr key={photo.id} className="hover:bg-gray-50">
              <td className="py-3 px-4">
                <div className="h-12 w-12 rounded overflow-hidden">
                  <img
                    src={photo.fileUrl}
                    alt={photo.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="font-medium text-sm">{photo.title}</div>
              </td>
              <td className="py-3 px-4">
                <div className="text-sm text-gray-600 max-w-[200px] truncate">
                  {photo.description || '-'}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="text-sm font-medium">{photo.sizeFormatted}</div>
              </td>
              <td className="py-3 px-4">
                <div className="text-sm text-gray-600">
                  {formatDate(photo.acquisitionDate)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Componente principal
const PublicAlbum: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [album, setAlbum] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'thumbnails' | 'table'>('thumbnails');
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);

  useEffect(() => {
    if (token) {
      loadPublicAlbum();
    }
  }, [token]);

  const loadPublicAlbum = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await albumService.getPublicAlbum(token!);
      setAlbum(data.album);
      setPhotos(data.photos);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar álbum público');
      console.error('Erro ao carregar álbum público:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = () => {
    const shareLink = window.location.href;
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleDownloadAll = () => {
    // Implementar download em massa
    alert('Funcionalidade de download em massa em desenvolvimento');
  };

  const handlePhotoClick = (photo: any) => {
    setSelectedPhoto(photo);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <Skeleton className="h-12 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto mt-2" />
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto bg-red-100 p-3 rounded-full w-fit mb-4">
              <Lock className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle>Álbum não disponível</CardTitle>
            <CardDescription className="mt-2">
              {error || 'Este álbum não existe ou não está mais disponível para visualização pública.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 text-center">
              O link pode ter expirado ou o proprietário do álbum pode ter removido o acesso público.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => navigate('/')}
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para a página inicial
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Álbum Compartilhado</h1>
                <p className="text-sm text-gray-600">Visualização pública</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyShareLink}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Link
                  </>
                )}
              </Button>
              
              {photos.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadAll}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download All
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Informações do Álbum */}
        <Card className="mb-8 overflow-hidden border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                    <Globe className="h-3 w-3 mr-1" />
                    Público
                  </Badge>
                  <Badge variant="outline">
                    {photos.length} foto{photos.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{album.title}</h2>
                
                {album.description && (
                  <p className="text-gray-700 mb-4">{album.description}</p>
                )}
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Criado em {formatDate(album.createdAt)}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    <span>Acesso público</span>
                  </div>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <div className="bg-white/80 rounded-lg p-4 border">
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Sobre este álbum</h4>
                  <p className="text-sm text-gray-600">
                    Este álbum foi compartilhado publicamente pelo proprietário.
                    Você pode visualizar as fotos, mas não pode editar ou adicionar conteúdo.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controles de Visualização */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="text-sm text-gray-600">
            Visualizando {photos.length} foto{photos.length !== 1 ? 's' : ''} 
            {album.photoCount !== photos.length && ` de ${album.photoCount}`}
          </div>
          
          <div className="flex items-center space-x-2">
            <Tabs 
              value={viewMode} 
              onValueChange={(value) => setViewMode(value as any)}
              className="w-fit"
            >
              <TabsList>
                <TabsTrigger value="thumbnails">
                  <Grid className="h-4 w-4 mr-2" />
                  Miniaturas
                </TabsTrigger>
                <TabsTrigger value="table">
                  <Table className="h-4 w-4 mr-2" />
                  Tabela
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Conteúdo do Álbum */}
        {photos.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <ImageIcon className="h-24 w-24 mx-auto text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Álbum vazio</h3>
              <p className="mt-2 text-gray-600">
                Este álbum não contém fotos disponíveis para visualização.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {viewMode === 'thumbnails' ? (
              <ThumbnailView
                photos={photos}
                onPhotoClick={handlePhotoClick}
              />
            ) : (
              <TableView photos={photos} />
            )}
          </>
        )}

        {/* Modal de Visualização da Foto */}
        {selectedPhoto && (
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <div 
              className="relative max-w-4xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70 z-10"
                onClick={() => setSelectedPhoto(null)}
              >
                ✕
              </Button>
              
              <div className="bg-white rounded-lg overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <div className="relative h-[60vh] lg:h-[70vh] bg-gray-900">
                      <img
                        src={selectedPhoto.fileUrl}
                        alt={selectedPhoto.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                  
                  <div className="p-6 bg-white">
                    <h3 className="text-xl font-bold mb-2">{selectedPhoto.title}</h3>
                    
                    {selectedPhoto.description && (
                      <p className="text-gray-600 mb-6">{selectedPhoto.description}</p>
                    )}
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Informações</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tamanho:</span>
                            <span className="font-medium">{selectedPhoto.sizeFormatted}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Data:</span>
                            <span className="font-medium">
                              {new Date(selectedPhoto.acquisitionDate).toLocaleDateString()}
                            </span>
                          </div>
                          {selectedPhoto.dominantColor && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">Cor predominante:</span>
                              <div className="flex items-center">
                                <div 
                                  className="w-4 h-4 rounded-full mr-2 border"
                                  style={{ backgroundColor: selectedPhoto.dominantColor }}
                                />
                                <span className="font-medium font-mono text-xs">
                                  {selectedPhoto.dominantColor}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <Button
                          className="w-full"
                          onClick={() => window.open(selectedPhoto.fileUrl, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedPhoto.fileUrl);
                            alert('Link da imagem copiado!');
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar Link
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rodapé Informativo */}
        <Card className="mt-8 border-blue-100">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Share2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Compartilhamento Seguro</h4>
                  <p className="text-sm text-gray-600">
                    Este link expira se o proprietário remover o compartilhamento.
                  </p>
                </div>
              </div>
              
              <Button
                variant="outline"
                onClick={() => {
                  if (window.history.length > 1) {
                    navigate(-1);
                  } else {
                    navigate('/');
                  }
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>© {new Date().getFullYear()} AlbumPastGOE • Álbum Compartilhado</p>
            <p className="mt-1">Visualização pública • Não é necessário login</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicAlbum;