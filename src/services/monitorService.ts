import axios from 'axios';
import { WebStatus } from '../models/webStatus';
import telegramService from './telegramService';
import cron from 'node-cron';
import connectDB from '@/config/db'

export class MonitorService {
  //private websitesStatus: WebStatus[] = [];
  private websites: string[] = [
    'https://www.telefonica.com/es/',
    'http://mipaginanoexiste.com/',
    'https://search.telefonica.com/',
    'https://intranet.telefonica.com/es/',
    'https://www.telefonica100.com/',
    'https://imaginemonos.telefonica.com/',
    'https://www.telefonica.es/es/',
  ];

  constructor() {
    connectDB(); // Conectar a la base de datos
    this.setupDailyCronJob();
  }

  // Obtener los estados desde MongoDB
  async getStatuses(): Promise<any> {
      let statuses = await WebStatus.find({});
      console.log(statuses);
      return statuses;
  }

  // Refrescar los estados si es necesario
  async refreshStatusesIfNeeded() {
      const webStatuses = await this.getStatuses();
      console.log ("1- He cogido los estados de las webs de la base de datos");
      console.log (webStatuses);
      const shouldUpdate = webStatuses.some((status: any) => !status.hasBeenCheckedRecently());

      console.log ("2- Estoy comprobando si se debe updatear el estado de las webs ->");
      console.log (shouldUpdate);

    if (shouldUpdate) {
        console.log ("3- Voy a refrescar el estado de las webs porque  es necesario");
          await this.refreshStatuses();
    }
  }

  private async refreshStatuses() {
      console.log('4- Empiezo a refrescar estados');

      for (const url of this.websites) {
          console.log('4.1- Comprobarremos lso estados de la URL:');
          console.log(url);
        const webStatus = await WebStatus.findOne({ url });
        const previousStatus = webStatus ? webStatus.status : 'Unknown';

        const newStatus = await this.checkWebsiteStatus(url);

        if (webStatus) {
          // Si ya existe el estado, lo actualizamos
          webStatus.status = newStatus.status;
          webStatus.headers = newStatus.headers;
          webStatus.responseTime = newStatus.responseTime;
          webStatus.lastChecked = newStatus.lastChecked;
          await webStatus.save();
        } else {
          // Si no existe, lo creamos
          await WebStatus.create(newStatus);
        }

        // Enviar notificación si el estado ha cambiado
        if (previousStatus !== newStatus.status) {
          const message = `La web ${newStatus.url} ha cambiado su estado.\nEstado anterior: ${previousStatus}\nNuevo estado: ${newStatus.status}`;
          await telegramService.sendMessage(message).then(() => {
            console.log('Mensaje enviado a Telegram');
          }).catch(error => {
            console.error('Error al enviar mensaje:', error);
          });
        }
      }
  }

  // Método para comprobar el estado de una web
   private async checkWebsiteStatus(url: string): Promise<any> {
      const startTime = Date.now();

      try {
        const response = await axios.get(url);
        const endTime = Date.now();
        const responseTime = `${endTime - startTime} ms`;

        const status = response.status === 200 ? 'Online' : 'Offline';

        return {
          url,
          status,
          headers: {
            statusCode: response.status,
            date: response.headers['date'] || 'N/A',
            contentType: response.headers['content-type'] || 'N/A',
          },
          responseTime,
          lastChecked: new Date().toLocaleString(),
        };
      } catch (error: any) {
        const endTime = Date.now();
        const responseTime = `${endTime - startTime} ms`;

        if (error.response) {
          return {
            url,
            status: 'Offline',
            headers: {
              statusCode: error.response.status,
              date: error.response.headers['date'] || 'N/A',
              contentType: error.response.headers['content-type'] || 'N/A',
            },
            responseTime,
            lastChecked: new Date().toLocaleString(),
          };
        } else {
          return {
            url,
            status: 'Offline - Error de red o timeout',
            headers: { statusCode: 'N/A', date: 'N/A', contentType: 'N/A' },
            responseTime,
            lastChecked: new Date().toLocaleString(),
          };
        }
      }
  }

  private async sendDailySummary(): Promise<void> {
      let summary = 'Resumen diario de las webs monitorizadas:\n\n';

      const statuses = await this.getStatuses();
      for (const status of statuses) {
        summary += `URL: ${status.url}\nEstado: ${status.status}\nÚltima verificación: ${status.lastChecked}\nTiempo de respuesta: ${status.responseTime}\n\n`;
      }

      await telegramService.sendMessage(summary);
  }

  private setupDailyCronJob() {
      cron.schedule('00 10 * * *', () => {
        console.log('Enviando el resumen diario a las 12:00 p.m.');
        this.sendDailySummary();
      }, {
        timezone: "Europe/Madrid"
      });
  }

}
