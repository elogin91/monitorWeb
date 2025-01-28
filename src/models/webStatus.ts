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

export const WebStatus = mongoose.model<IWebStatus>('WebStatus', webStatusSchema);
