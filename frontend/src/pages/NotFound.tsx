import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-red-100 p-3 rounded-full w-fit mb-4">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Página Não Encontrada</CardTitle>
          <p className="text-gray-600 mt-2">
            A página que você está procurando não existe ou foi movida.
          </p>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-700 mb-2">Possíveis soluções:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Verifique se o URL está correto</li>
                <li>• Volte para a página anterior</li>
                <li>• Acesse a página inicial</li>
                <li>• Entre em contato com o suporte</li>
              </ul>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Código do erro: <span className="font-mono">404</span>
              </p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-3">
          <div className="flex space-x-3 w-full">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            
            <Button
              className="flex-1"
              onClick={() => navigate('/albums')}
            >
              <Home className="h-4 w-4 mr-2" />
              Página Inicial
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/login')}
            className="w-full"
          >
            Fazer Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NotFound;