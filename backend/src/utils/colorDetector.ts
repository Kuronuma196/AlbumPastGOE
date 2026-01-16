import { createCanvas, loadImage } from 'canvas';
import path from 'path';

/**
 * Detecta a cor predominante em uma imagem
 * @param imagePath Caminho da imagem
 * @returns Cor hexadecimal predominante
 */
export const detectDominantColor = async (imagePath: string): Promise<string> => {
  try {
    const image = await loadImage(imagePath);
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(image, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, image.width, image.height);
    const data = imageData.data;
    
    // Reduzir resolução para melhor performance
    const sampleRate = 10;
    const colorMap = new Map<string, number>();
    
    for (let i = 0; i < data.length; i += 4 * sampleRate) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Agrupar cores similares
      const key = `${Math.floor(r / 32) * 32},${Math.floor(g / 32) * 32},${Math.floor(b / 32) * 32}`;
      colorMap.set(key, (colorMap.get(key) || 0) + 1);
    }
    
    // Encontrar cor mais frequente
    let maxCount = 0;
    let dominantColor = '#000000';
    
    for (const [key, count] of colorMap.entries()) {
      if (count > maxCount) {
        maxCount = count;
        const [r, g, b] = key.split(',').map(Number);
        dominantColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      }
    }
    
    return dominantColor;
  } catch (error) {
    console.error('Erro ao detectar cor predominante:', error);
    return '#000000';
  }
};

/**
 * Converte cor RGB para hexadecimal
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};