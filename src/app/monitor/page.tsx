"use client";

import { useState, useEffect } from 'react';

interface WebsiteStatus {
  url: string;
  status: string;
  headers: {
    statusCode: string | number;
    date: string;
    contentType: string;
  };
  responseTime: string;
  lastChecked: string;
}

const Monitor = () => {
  const [status, setStatus] = useState<WebsiteStatus[]>([]);

  // Función que hace la llamada a la API y actualiza el estado
  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/check-websites');
      const data = await response.json();
      console.log("Datos recibidos:", data);  // Añadimos este log para verificar la respuesta
      setStatus(data);
    } catch (error) {
      console.error('Error fetching website status:', error);
    }
  };

  useEffect(() => {
    // Hacemos la primera llamada cuando el componente se monta
    fetchStatus();

    // Establecemos el intervalo de actualización cada minuto
    const intervalId = setInterval(() => {
      console.log("Ejecutando la llamada de actualización cada minuto");  // Verificar que se ejecuta
      fetchStatus();
    }, 60000); // 60,000 ms = 1 minuto

    // Limpiamos el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  }, []);  // Solo ejecuta este efecto al montar el componente

  return (
    <div>
      <h1>Website Monitor</h1>
      <ul>
        {status.map((site, index) => (
          <li key={index}>
            <strong>{site.url}</strong><br />
            Status: {site.status}<br />
            HTTP Code: {site.headers.statusCode}<br />
            Response Time: {site.responseTime}<br />
            Last checked: {site.lastChecked}<br />
            {site.headers.contentType && (
              <>
                <strong>Content Type:</strong> {site.headers.contentType}<br />
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Monitor;
