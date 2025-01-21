export class WebStatus {
  url: string;
  status: string;
  headers: {
    statusCode: string | number;
    date: string;
    contentType: string;
  };
  responseTime: string;
  lastChecked: string;

  constructor(
    url: string,
    status: string,
    headers: { statusCode: string | number; date: string; contentType: string },
    responseTime: string,
    lastChecked: string
  ) {
    this.url = url;
    this.status = status;
    this.headers = headers;
    this.responseTime = responseTime;
    this.lastChecked = lastChecked;
  }

  // Método que compara la hora de la última comprobación
  hasBeenCheckedRecently(): boolean {
    const lastCheckedDate = new Date(this.lastChecked);
    const currentTime = new Date();
    const timeDifference = (currentTime.getTime() - lastCheckedDate.getTime()) / 1000; // Diferencia en segundos

    // Retorna true si han pasado menos de 60 segundos
    return timeDifference < 60;
  }

  // Método para actualizar los datos del estado
  updateStatus(
    status: string,
    headers: { statusCode: string | number; date: string; contentType: string },
    responseTime: string
  ) {
    this.status = status;
    this.headers = headers;
    this.responseTime = responseTime;
    this.lastChecked = new Date().toLocaleString();
  }
}
