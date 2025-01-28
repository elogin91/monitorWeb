import axios from 'axios';
import { WebStatus } from '../models/webStatus';
import telegramService from './telegramService';
import cron from 'node-cron';
import connectDB from '@/config/db'

export class MonitorService {
  private websitesStatus: WebStatus[] = [];
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
    //this.initializeStatuses();
    connectDB(); // Conectar a la base de datos
    this.setupDailyCronJob();
  }

  // Inicializamos el array de WebStatus
  private initializeStatuses() {
    this.websitesStatus = this.websites.map(
      (url) =>
        new WebStatus(
          url,
          'Unknown',
          { statusCode: 'N/A', date: 'N/A', contentType: 'N/A' },
          'N/A',
          new Date().toLocaleString()
        )
    );
  }

  // Método que retorna los estados actuales
  getStatuses(): WebStatus[] {
    return this.websitesStatus;
  }

  // Método que compara si alguno de los estados necesita ser actualizado
  async refreshStatusesIfNeeded() {
    const shouldUpdate = this.websitesStatus.some((status) => !status.hasBeenCheckedRecently());

    if (shouldUpdate) {
      await this.refreshStatuses();
    }
  }

  // Método que refresca los datos de las webs si han pasado más de 1 minuto
  private async refreshStatuses() {
    console.log('Refreshing statuses...');

    for (const status of this.websitesStatus) {
      const previousStatus = status.status;
      const newStatus = await this.checkWebsiteStatus(status.url);
      status.updateStatus(newStatus.status, newStatus.headers, newStatus.responseTime);

      // Solo enviamos mensaje de telegram si ha cambiado el estado
      if (previousStatus !== newStatus.status) {
          const message = `La web ${newStatus.url} ha cambiado su estado.\nEstado anterior: ${status.status}\nNuevo estado: ${newStatus.status}`;
          await telegramService.sendMessage(message).then(() => {
                                                      console.log('Mensaje enviado a Telegram');
                                                    }).catch(error => {
                                                      console.error('Error al enviar mensaje:', error);
                                                    });
      }
    }
  }

  // Método para comprobar el estado de una web
 private async checkWebsiteStatus(url: string): Promise<WebStatus> {
   // Obtenemos el tiempo de inicio de la solicitud.
   const startTime = Date.now();

   try {
     // Realizamos una petición HTTP GET a la URL.
     const response = await axios.get(url);

     // Calculamos el tiempo transcurrido desde que se inició la solicitud.
     const endTime = Date.now();
     const responseTime = `${endTime - startTime} ms`; // Tiempo de respuesta en milisegundos.

     // Determinamos el estado de la web. Si la respuesta es 200 (OK), está "Online", de lo contrario es "Offline" con el código de respuesta.
     const status = response.status === 200 ? 'Online' : 'Offline' ;

     // Creamos y devolvemos un nuevo objeto WebStatus con los datos de la web.
     return new WebStatus(
       url,  // URL de la web monitorizada.
       status,  // Estado calculado: "Online" o "Offline" con el código de estado.
       {
         statusCode: response.status, // Código de estado HTTP.
         date: response.headers['date'] || 'N/A', // Fecha de la respuesta obtenida de los encabezados HTTP.
         contentType: response.headers['content-type'] || 'N/A', // Tipo de contenido (Content-Type) de la respuesta.
       },
       responseTime, // Tiempo de respuesta de la solicitud.
       new Date().toLocaleString() // Fecha y hora actual en formato legible.
     );

   } catch (error: any) {
     // Calculamos el tiempo transcurrido hasta que ocurrió el error.
     const endTime = Date.now();
     const responseTime = `${endTime - startTime} ms`; // Tiempo hasta el error.

     // Si el error tiene una respuesta (es decir, un error HTTP con código de respuesta).
     if (error.response) {
       // Devolvemos un estado "Offline" junto con el código de respuesta y detalles de la respuesta.
       return new WebStatus(
         url,  // URL de la web monitorizada.
         'Offline',  // Estado "Offline" con el código de respuesta (por ejemplo, 404, 500).
         {
           statusCode: error.response.status, // Código de estado HTTP en el error.
           date: error.response.headers['date'] || 'N/A', // Fecha del intento de la petición, obtenida del encabezado si existe.
           contentType: error.response.headers['content-type'] || 'N/A', // Tipo de contenido (Content-Type) si está disponible.
         },
         responseTime, // Tiempo de respuesta hasta que ocurrió el error.
         new Date().toLocaleString() // Fecha y hora actual en formato legible.
       );
     } else {
       // Si el error no tiene una respuesta (error de red, timeout, etc.).
       return new WebStatus(
         url,  // URL de la web monitorizada.
         'Offline - Error de red o timeout',  // Especificamos que no hubo respuesta por un error de red o timeout.
         { statusCode: 'N/A', date: 'N/A', contentType: 'N/A' }, // No hay datos HTTP disponibles.
         responseTime, // Tiempo hasta que ocurrió el error.
         new Date().toLocaleString() // Fecha y hora del intento de la petición, incluso en casos de error.
       );
     }
   }
 }

  private async sendDailySummary(): Promise<void> {

    let summary = 'Resumen diario de las webs monitorizadas:\n\n';

    // Iterar sobre los estados monitorizados y construir el resumen
    for (const status of this.getStatuses()) {
      summary += `URL: ${status.url}\nEstado: ${status.status}\nÚltima verificación: ${status.lastChecked}\nTiempo de respuesta: ${status.responseTime}\n\n`;
    }

    // Enviar el resumen usando el servicio de Telegram
    await telegramService.sendMessage(summary);
  }

  private setupDailyCronJob() {
    cron.schedule('00 10 * * *', () => {
      console.log('Enviando el resumen diario a las 12:00 p.m.');
      this.sendDailySummary();
    }, {
      timezone: "Europe/Madrid" // Configuración de la zona horaria
    });
  }

}
