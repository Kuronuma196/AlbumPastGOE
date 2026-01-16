import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPhoto extends Document {
  title: string;
  description: string;
  acquisitionDate: Date;
  size: number; // em bytes
  dominantColor: string;
  album: Types.ObjectId;
  user: Types.ObjectId;
  fileName: string;
  filePath: string;
  fileUrl: string;
  mimeType: string;
  dimensions?: {
    width: number;
    height: number;
  };
  createdAt: Date;
}

const PhotoSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  acquisitionDate: { type: Date, default: Date.now },
  size: { type: Number, required: true },
  dominantColor: { type: String, default: '#000000' },
  album: { type: Schema.Types.ObjectId, ref: 'Album', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileUrl: { type: String, required: true },
  mimeType: { type: String, required: true },
  dimensions: {
    width: Number,
    height: Number
  },
  createdAt: { type: Date, default: Date.now }
});

// Atualizar contagem de fotos no álbum após salvar/remover foto
PhotoSchema.post('save', async function() {
  const Album = mongoose.model('Album');
  await Album.updatePhotoCount(this.album);
});

PhotoSchema.post('remove', async function() {
  const Album = mongoose.model('Album');
  await Album.updatePhotoCount(this.album);
});

export default mongoose.model<IPhoto>('Photo', PhotoSchema);