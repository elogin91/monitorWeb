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
  lastChecked: { type: String, required: true },
});

// Método que compara la hora de la última comprobación
webStatusSchema.methods.hasBeenCheckedRecently = function (): boolean {
  const lastCheckedDate = new Date(this.lastChecked);
  const currentTime = new Date();
  const timeDifference = (currentTime.getTime() - lastCheckedDate.getTime()) / 1000; // Diferencia en segundos
  return timeDifference < 60;
};

// Método para actualizar los datos del estado
webStatusSchema.methods.updateStatus = function (
  status: string,
  headers: { statusCode: string | number; date: string; contentType: string },
  responseTime: string
): void {
  this.status = status;
  this.headers = headers;
  this.responseTime = responseTime;
  this.lastChecked = new Date().toLocaleString();
};

export const WebStatus = mongoose.models.WebStatus || mongoose.model('WebStatus', webStatusSchema);