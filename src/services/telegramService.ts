import axios from 'axios';

// Define la URL base de la API de Telegram
const TELEGRAM_API_URL = 'https://api.telegram.org';

// Asegúrate de reemplazar <YOUR_BOT_TOKEN> por el token de tu bot
const BOT_TOKEN = '7529187834:AAFWkdGjppE5vOwgIkJ_8hbzv6RRHD415bw';

// Define el chat_id o el nombre del canal al que enviarás el mensaje
const CHAT_ID = '-1002340684241';

// Clase para manejar el servicio de Telegram
class TelegramService {
  private botToken: string;
  private chatId: string;

  constructor(botToken: string, chatId: string) {
    this.botToken = botToken;
    this.chatId = chatId;
  }

  // Método para enviar un mensaje al canal de Telegram
  async sendMessage(message: string): Promise<void> {
    const url = `${TELEGRAM_API_URL}/bot${this.botToken}/sendMessage`;

    try {
      // Hacemos la petición POST para enviar el mensaje
      const response = await axios.post(url, {
        chat_id: this.chatId,
        text: message
      });

      if (response.data.ok) {
        console.log('Mensaje enviado correctamente:');
      } else {
        console.error('Error al enviar el mensaje:');
      }
    } catch (error) {
      console.error('Error en la solicitud a Telegram:');
    }
  }
}

// Crear una instancia del servicio con tu token y el ID del canal
const telegramService = new TelegramService(BOT_TOKEN, CHAT_ID);

// Exportamos el servicio para que pueda ser usado en otros módulos
export default telegramService;
