import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAlbum extends Document {
  title: string;
  description: string;
  user: Types.ObjectId;
  isPublic: boolean;
  shareToken?: string;
  photoCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const AlbumSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isPublic: { type: Boolean, default: false },
  shareToken: { type: String, unique: true, sparse: true },
  photoCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Atualizar updatedAt antes de salvar
AlbumSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Middleware para atualizar photoCount quando fotos são adicionadas/removidas
AlbumSchema.statics.updatePhotoCount = async function(albumId: Types.ObjectId) {
  const Photo = mongoose.model('Photo');
  const count = await Photo.countDocuments({ album: albumId });
  await this.findByIdAndUpdate(albumId, { photoCount: count });
};

export default mongoose.model<IAlbum>('Album', AlbumSchema);