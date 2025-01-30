import mongoose, { Schema, Document } from 'mongoose';

interface IWebStatus extends Document {
  url: string;
  status: string;
  headers: {
    statusCode: string;
    date: string;
    contentType: string;
  };
  responseTime: string;
  lastChecked: string;
}

const webStatusSchema: Schema = new Schema({
  url: { type: String, required: true },
  status: { type: String, required: true },
  headers: {
    statusCode: { type: String, required: true },
    date: { type: String, required: true },
    contentType: { type: String, required: true },
  },
  responseTime: { type: String, required: true },
  lastChecked: { type: Date, required: true },
});

// Método que compara la hora de la última comprobación
webStatusSchema.methods.hasBeenCheckedRecently = function (): boolean {
  if(!this.lastChecked) {
    return false;
  }
  const currentTime = new Date();
  const timeDifference = (currentTime.getTime() - this.lastChecked.getTime()) / 1000; // Diferencia en segundos
  return timeDifference < 600;
};

export const WebStatus = mongoose.models.WebStatus || mongoose.model('WebStatus', webStatusSchema);