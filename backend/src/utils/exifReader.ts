import ExifReader from 'exifreader';
import fs from 'fs';

/**
 * Extrai metadados EXIF de uma imagem
 * @param filePath Caminho do arquivo
 * @returns Metadados EXIF ou null
 */
export const readExifData = async (filePath: string): Promise<any> => {
  try {
    const fileData = fs.readFileSync(filePath);
    const tags = ExifReader.load(fileData);
    
    const exifData: any = {};
    
    // Data de aquisição (prioridade: DateTimeOriginal > DateTime > CreateDate)
    if (tags['DateTimeOriginal']) {
      exifData.acquisitionDate = new Date(tags['DateTimeOriginal'].description);
    } else if (tags['DateTime']) {
      exifData.acquisitionDate = new Date(tags['DateTime'].description);
    } else if (tags['CreateDate']) {
      exifData.acquisitionDate = new Date(tags['CreateDate'].description);
    }
    
    // Dimensões da imagem
    if (tags['ImageWidth'] && tags['ImageHeight']) {
      exifData.dimensions = {
        width: tags['ImageWidth'].value,
        height: tags['ImageHeight'].value
      };
    }
    
    // Informações da câmera
    if (tags['Make']) exifData.make = tags['Make'].description;
    if (tags['Model']) exifData.model = tags['Model'].description;
    
    // Configurações da foto
    if (tags['ExposureTime']) exifData.exposureTime = tags['ExposureTime'].description;
    if (tags['FNumber']) exifData.fNumber = tags['FNumber'].description;
    if (tags['ISOSpeedRatings']) exifData.iso = tags['ISOSpeedRatings'].value;
    
    return exifData;
  } catch (error) {
    console.error('Erro ao ler EXIF:', error);
    return null;
  }
};