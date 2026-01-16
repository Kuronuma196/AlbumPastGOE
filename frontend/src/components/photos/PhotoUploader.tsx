import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Card, CardContent } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Upload, 
  X, 
  Check, 
  Image as ImageIcon, 
  FileText,
  AlertCircle,
  FolderOpen
} from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

interface FileWithPreview extends File {
  preview?: string;
  title?: string;
  description?: string;
}

interface PhotoUploaderProps {
  onUpload: (files: File[], titles?: string[], descriptions?: string[]) => Promise<void>;
  uploadProgress?: number;
  onClose: () => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  onUpload,
  uploadProgress = 0,
  onClose,
  maxFiles = 20,
  maxSizeMB = 10
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [fileTitles, setFileTitles] = useState<{ [key: string]: string }>({});
  const [fileDescriptions, setFileDescriptions] = useState<{ [key: string]: string }>({});

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError('');
    
    // Validar número máximo de arquivos
    if (files.length + acceptedFiles.length > maxFiles) {
      setError(`Máximo de ${maxFiles} arquivos permitidos.`);
      return;
    }

    // Validar tamanho máximo
    const oversizedFiles = acceptedFiles.filter(file => 
      file.size > maxSizeMB * 1024 * 1024
    );
    
    if (oversizedFiles.length > 0) {
      setError(`Alguns arquivos excedem o tamanho máximo de ${maxSizeMB}MB.`);
      return;
    }

    // Criar previews e adicionar metadados
    const filesWithPreviews = acceptedFiles.map(file => {
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      return Object.assign(file, {
        preview: URL.createObjectURL(file),
        title: fileName,
        description: ''
      });
    });

    // Inicializar títulos e descrições
    filesWithPreviews.forEach(file => {
      setFileTitles(prev => ({
        ...prev,
        [file.name]: file.name.replace(/\.[^/.]+$/, "")
      }));
      setFileDescriptions(prev => ({
        ...prev,
        [file.name]: ''
      }));
    });

    setFiles(prev => [...prev, ...filesWithPreviews]);
  }, [files, maxFiles, maxSizeMB]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxSize: maxSizeMB * 1024 * 1024,
    multiple: true
  });

  const removeFile = (fileName: string) => {
    setFiles(files.filter(f => f.name !== fileName));
    
    // Remover metadados
    setFileTitles(prev => {
      const newTitles = { ...prev };
      delete newTitles[fileName];
      return newTitles;
    });
    
    setFileDescriptions(prev => {
      const newDescriptions = { ...prev };
      delete newDescriptions[fileName];
      return newDescriptions;
    });
  };

  const handleTitleChange = (fileName: string, title: string) => {
    setFileTitles(prev => ({
      ...prev,
      [fileName]: title
    }));
  };

  const handleDescriptionChange = (fileName: string, description: string) => {
    setFileDescriptions(prev => ({
      ...prev,
      [fileName]: description
    }));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Selecione pelo menos uma foto para enviar.');
      return;
    }

    // Validar títulos
    const emptyTitles = files.filter(file => !fileTitles[file.name]?.trim());
    if (emptyTitles.length > 0) {
      setError('Todos os arquivos precisam ter um título.');
      return;
    }

    try {
      setIsUploading(true);
      setError('');
      
      const titles = files.map(file => fileTitles[file.name]);
      const descriptions = files.map(file => fileDescriptions[file.name] || '');
      
      await onUpload(files, titles, descriptions);
      
      // Limpar após upload bem-sucedido
      setFiles([]);
      setFileTitles({});
      setFileDescriptions({});
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar fotos.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Limpar previews
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Área de Drag & Drop */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          {isDragActive ? (
            <>
              <FolderOpen className="h-12 w-12 mx-auto text-blue-500" />
              <p className="text-lg font-medium text-blue-600">Solte as fotos aqui...</p>
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 mx-auto text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-700">
                  Arraste e solte suas fotos aqui
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  ou <span className="text-blue-600 font-medium">clique para selecionar</span>
                </p>
              </div>
            </>
          )}
          
          <p className="text-xs text-gray-500">
            Suporte para imagens (JPEG, PNG, GIF, WebP)
            <br />
            Tamanho máximo: {maxSizeMB}MB por arquivo • Máximo: {maxFiles} arquivos
          </p>
        </div>
      </div>

      {/* Progresso do Upload */}
      {isUploading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Enviando fotos...</span>
                <span className="text-sm font-medium">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-gray-500">
                Aguarde enquanto suas fotos são enviadas e processadas.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Arquivos Selecionados */}
      {files.length > 0 && !isUploading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">
              {files.length} foto{files.length !== 1 ? 's' : ''} selecionada{files.length !== 1 ? 's' : ''}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFiles([])}
              disabled={isUploading}
            >
              <X className="h-4 w-4 mr-1" />
              Limpar Tudo
            </Button>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {files.map((file, index) => (
              <Card key={file.name} className="overflow-hidden">
                <div className="flex">
                  {/* Preview da Imagem */}
                  <div className="w-24 h-24 flex-shrink-0 bg-gray-100">
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Informações e Formulário */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1 mr-4">
                        <div>
                          <Label htmlFor={`title-${index}`} className="text-xs">
                            Título *
                          </Label>
                          <Input
                            id={`title-${index}`}
                            value={fileTitles[file.name] || ''}
                            onChange={(e) => handleTitleChange(file.name, e.target.value)}
                            placeholder="Título da foto"
                            className="mt-1 text-sm"
                            disabled={isUploading}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`description-${index}`} className="text-xs">
                            Descrição (opcional)
                          </Label>
                          <Textarea
                            id={`description-${index}`}
                            value={fileDescriptions[file.name] || ''}
                            onChange={(e) => handleDescriptionChange(file.name, e.target.value)}
                            placeholder="Descrição da foto"
                            className="mt-1 text-sm h-16"
                            disabled={isUploading}
                          />
                        </div>
                      </div>

                      <div className="flex-shrink-0 space-y-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => removeFile(file.name)}
                          disabled={isUploading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        
                        <div className="text-xs text-gray-500 text-right">
                          <div className="flex items-center">
                            <FileText className="h-3 w-3 mr-1" />
                            {formatFileSize(file.size)}
                          </div>
                          <div className="mt-1">
                            {file.type.split('/')[1].toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Ações */}
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isUploading}
        >
          Cancelar
        </Button>
        
        <div className="space-x-2">
          {files.length > 0 && !isUploading && (
            <Button
              variant="outline"
              onClick={() => setFiles([])}
              disabled={isUploading}
            >
              <X className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          )}
          
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading}
          >
            {isUploading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Enviando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Enviar {files.length > 0 ? `(${files.length})` : ''}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PhotoUploader;