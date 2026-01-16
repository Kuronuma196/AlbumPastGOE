import React, { useState, useEffect } from 'react';
import { Photo } from '../../types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { 
  Calendar, 
  FileText, 
  Palette, 
  Image as ImageIcon,
  Save,
  X
} from 'lucide-react';

interface PhotoFormModalProps {
  photo: Photo | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (photoId: string, data: { title: string; description: string }) => Promise<void>;
}

const PhotoFormModal: React.FC<PhotoFormModalProps> = ({
  photo,
  isOpen,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Resetar formulário quando a foto mudar
  useEffect(() => {
    if (photo) {
      setTitle(photo.title);
      setDescription(photo.description || '');
      setError('');
    }
  }, [photo]);

  const handleSave = async () => {
    if (!photo) return;

    if (!title.trim()) {
      setError('O título da foto é obrigatório');
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      
      await onSave(photo.id, {
        title: title.trim(),
        description: description.trim()
      });
      
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar alterações');
    } finally {
      setIsSaving(false);
    }
  };

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

  if (!photo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Foto</DialogTitle>
          <DialogDescription>
            Atualize as informações da foto
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Preview e informações */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={photo.fileUrl}
                alt={photo.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-500">
                      <FileText className="h-4 w-4 mr-2" />
                      <span>Tamanho:</span>
                    </div>
                    <span className="font-medium">{photo.sizeFormatted}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Data de aquisição:</span>
                    </div>
                    <span className="font-medium text-right">
                      {formatDate(photo.acquisitionDate)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-500">
                      <Palette className="h-4 w-4 mr-2" />
                      <span>Cor predominante:</span>
                    </div>
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-2 border"
                        style={{ backgroundColor: photo.dominantColor }}
                      />
                      <span className="font-medium font-mono">
                        {photo.dominantColor}
                      </span>
                    </div>
                  </div>
                  
                  {photo.dimensions && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-500">
                        <ImageIcon className="h-4 w-4 mr-2" />
                        <span>Dimensões:</span>
                      </div>
                      <span className="font-medium">
                        {photo.dimensions.width} × {photo.dimensions.height}px
                      </span>
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <Badge variant="outline" className="text-xs">
                      {photo.mimeType.split('/')[1].toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Formulário de edição */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="photo-title">Título *</Label>
                <Input
                  id="photo-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título da foto"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="photo-description">Descrição</Label>
                <Textarea
                  id="photo-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva esta foto..."
                  rows={6}
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Dicas</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use títulos descritivos para facilitar buscas</li>
                <li>• Adicione datas e locais nas descrições</li>
                <li>• Mantenha as informações organizadas</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoFormModal;