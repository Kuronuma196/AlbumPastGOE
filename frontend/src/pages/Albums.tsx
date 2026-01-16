import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { albumService } from '../services/albumService';
import { Album } from '../types';

// Importar componentes UI
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Skeleton } from '../components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { MoreVertical, Image, Plus, Trash2, Edit, Share2 } from 'lucide-react';

// Componente AlbumCard (simplificado para esta página)
const AlbumCard: React.FC<{ 
  album: Album; 
  onEdit: (album: Album) => void; 
  onDelete: (album: Album) => void; 
  onShare: (album: Album) => void;
}> = ({ album, onEdit, onDelete, onShare }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{album.title}</CardTitle>
            <CardDescription className="mt-2 line-clamp-2">
              {album.description || 'Sem descrição'}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuSeparator />
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
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-40 bg-gray-100 rounded-lg mb-4">
          {album.photoCount > 0 ? (
            <div className="text-center">
              <Image className="h-12 w-12 mx-auto text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                {album.photoCount} foto{album.photoCount !== 1 ? 's' : ''}
              </p>
            </div>
          ) : (
            <div className="text-center">
              <Image className="h-12 w-12 mx-auto text-gray-300" />
              <p className="mt-2 text-sm text-gray-500">Álbum vazio</p>
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500">
          Atualizado em {new Date(album.updatedAt).toLocaleDateString()}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          variant={album.photoCount > 0 ? "default" : "outline"}
          onClick={() => window.location.href = `/album/${album.id}`}
        >
          {album.photoCount > 0 ? 'Ver Álbum' : 'Adicionar Fotos'}
        </Button>
      </CardFooter>
    </Card>
  );
};

// Componente principal da página
const Albums: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para o modal de criação/edição
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Estados do formulário
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumDescription, setAlbumDescription] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [shareUrl, setShareUrl] = useState('');
  
  // Estados para ações
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Carregar álbuns
  useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await albumService.getAll();
      setAlbums(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar álbuns');
      console.error('Erro ao carregar álbuns:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar álbuns por busca
  const filteredAlbums = albums.filter(album =>
    album.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    album.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Criar novo álbum
  const handleCreateAlbum = async () => {
    if (!albumTitle.trim()) {
      setError('O título do álbum é obrigatório');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      const newAlbum = await albumService.create({
        title: albumTitle.trim(),
        description: albumDescription.trim()
      });
      
      setAlbums([newAlbum, ...albums]);
      setIsCreateModalOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar álbum');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Editar álbum
  const handleEditAlbum = async () => {
    if (!selectedAlbum || !albumTitle.trim()) {
      setError('O título do álbum é obrigatório');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      const updatedAlbum = await albumService.update(selectedAlbum.id, {
        title: albumTitle.trim(),
        description: albumDescription.trim()
      });
      
      setAlbums(albums.map(album => 
        album.id === selectedAlbum.id ? updatedAlbum : album
      ));
      setIsEditModalOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar álbum');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Excluir álbum
  const handleDeleteAlbum = async () => {
    if (!selectedAlbum) return;

    try {
      setIsDeleting(true);
      setError('');
      
      await albumService.delete(selectedAlbum.id);
      
      setAlbums(albums.filter(album => album.id !== selectedAlbum.id));
      setIsDeleteDialogOpen(false);
      setSelectedAlbum(null);
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir álbum');
    } finally {
      setIsDeleting(false);
    }
  };

  // Gerar link de compartilhamento
  const handleShareAlbum = async (album: Album) => {
    setSelectedAlbum(album);
    setShareUrl('');
    
    try {
      if (album.shareToken) {
        setShareUrl(`${window.location.origin}/album/public/${album.shareToken}`);
      } else {
        const result = await albumService.generateShareLink(album.id);
        setShareUrl(result.shareUrl);
        // Atualizar lista de álbuns para mostrar o token
        await loadAlbums();
      }
      setIsShareModalOpen(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar link de compartilhamento');
    }
  };

  // Remover compartilhamento
  const handleRemoveShare = async () => {
    if (!selectedAlbum) return;

    try {
      await albumService.removeShare(selectedAlbum.id);
      setShareUrl('');
      await loadAlbums();
    } catch (err: any) {
      setError(err.message || 'Erro ao remover compartilhamento');
    }
  };

  // Abrir modal de edição
  const openEditModal = (album: Album) => {
    setSelectedAlbum(album);
    setAlbumTitle(album.title);
    setAlbumDescription(album.description || '');
    setIsEditModalOpen(true);
  };

  // Abrir modal de exclusão
  const openDeleteDialog = (album: Album) => {
    setSelectedAlbum(album);
    setIsDeleteDialogOpen(true);
  };

  // Resetar formulário
  const resetForm = () => {
    setAlbumTitle('');
    setAlbumDescription('');
    setSelectedAlbum(null);
    setError('');
  };

  // Skeleton loader
  const AlbumSkeleton = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full mt-2" />
        <Skeleton className="h-4 w-2/3 mt-1" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-40 w-full rounded-lg" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Meus Álbuns</h1>
              <p className="text-gray-600">
                Olá, {user?.name}!
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => logout()}>
                Sair
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

        {/* Barra de busca e ações */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="relative w-full sm:w-64">
            <Input
              type="search"
              placeholder="Buscar álbuns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Criar Novo Álbum
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Álbum</DialogTitle>
                <DialogDescription>
                  Preencha os dados do novo álbum de fotos.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={albumTitle}
                    onChange={(e) => setAlbumTitle(e.target.value)}
                    placeholder="Ex: Aniversário 2024"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={albumDescription}
                    onChange={(e) => setAlbumDescription(e.target.value)}
                    placeholder="Descreva seu álbum..."
                    rows={3}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsCreateModalOpen(false);
                  resetForm();
                }}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateAlbum} disabled={isSubmitting}>
                  {isSubmitting ? 'Criando...' : 'Criar Álbum'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de álbuns */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <AlbumSkeleton key={i} />
            ))}
          </div>
        ) : filteredAlbums.length === 0 ? (
          <div className="text-center py-12">
            <Image className="h-24 w-24 mx-auto text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {searchTerm ? 'Nenhum álbum encontrado' : 'Nenhum álbum criado'}
            </h3>
            <p className="mt-2 text-gray-600">
              {searchTerm 
                ? 'Tente buscar com outros termos.' 
                : 'Comece criando seu primeiro álbum de fotos!'}
            </p>
            {!searchTerm && (
              <Button className="mt-6" onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Álbum
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              {filteredAlbums.length} álbum{filteredAlbums.length !== 1 ? 's' : ''} encontrado{filteredAlbums.length !== 1 ? 's' : ''}
              {searchTerm && ` para "${searchTerm}"`}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAlbums.map(album => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  onEdit={openEditModal}
                  onDelete={openDeleteDialog}
                  onShare={handleShareAlbum}
                />
              ))}
            </div>
          </>
        )}

        {/* Modal de Edição */}
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
              <Button variant="outline" onClick={() => {
                setIsEditModalOpen(false);
                resetForm();
              }}>
                Cancelar
              </Button>
              <Button onClick={handleEditAlbum} disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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

        {/* Diálogo de Confirmação de Exclusão */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Excluir Álbum</DialogTitle>
              <DialogDescription>
                {selectedAlbum?.photoCount && selectedAlbum.photoCount > 0 ? (
                  <>
                    Este álbum contém {selectedAlbum.photoCount} foto{selectedAlbum.photoCount !== 1 ? 's' : ''}. 
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
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setSelectedAlbum(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAlbum}
                disabled={selectedAlbum?.photoCount ? selectedAlbum.photoCount > 0 : false || isDeleting}
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

export default Albums;