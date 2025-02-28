import axios from 'axios';
import { WebStatus } from '../models/webStatus';
import telegramService from './telegramService';
import cron from 'node-cron';
import connectDB from '@/config/db'

export class MonitorService {

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
  }
 
  // Obtener los estados desde MongoDB
  async getStatuses(): Promise<any> {
    try {
      console.log("3. getStatuses");
      let statuses = await WebStatus.find({});
      console.log("4. He cogido los estados");
      return statuses;
    } catch (error) {
      console.error("2.bis Error al obtener los estados:", error);
      throw error;
    }
  }

  // Refresca en paralelo todas urls con promesas
  async refreshStatuses() {
    console.log('1- Empiezo a refrescar estados de las siguientes páginas');
    let promises = this.websites.map((website: string) => {
      return this.refreshStatus(website);
    })

    await Promise.all(promises);
  }

  private async refreshStatus(url: string) {
    console.log(url);

    //Estado previo que tenía en la DB
    const webStatus = await WebStatus.findOne({ url });
    const previousStatus = webStatus ? webStatus.status : 'Unknown';

    if (!webStatus || !webStatus.hasBeenCheckedRecently()) {
      //Recolectamos el nuevo estado de la web
      const newStatus = await this.checkWebsiteStatus(url);

      //Guardamos en la DB los nuevos datos recolectados
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
      console.log("Refreshing " + url);
    } else {
      console.log("Avoid refreshing " + url);
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
        lastChecked: new Date(),
      };
    } catch (error: any) {
      const endTime = Date.now();
      const responseTime = `${endTime - startTime} ms`;

      if (error.response) {
        const status = error.response.status === 401 ? 'Online' : 'Offline';
        return {
          url,
          status,
          headers: {
            statusCode: error.response.status,
            date: error.response.headers['date'] || 'N/A',
            contentType: error.response.headers['content-type'] || 'N/A',
          },
          responseTime,
          lastChecked: new Date(),
        };
      } else {
        return {
          url,
          status: 'Offline - Error de red o timeout',
          headers: { statusCode: 'N/A', date: 'N/A', contentType: 'N/A' },
          responseTime,
          lastChecked: new Date(),
        };
      }
    }
  }

  async sendDailySummary(): Promise<void> {
    let summary = 'Resumen diario de las webs monitorizadas:\n\n';

    const statuses = await this.getStatuses();
    for (const status of statuses) {
      summary += `URL: ${status.url}\nEstado: ${status.status}\nÚltima verificación: ${status.lastChecked}\nTiempo de respuesta: ${status.responseTime}\n\n`;
    }
    await telegramService.sendMessage(summary);
  }

}
