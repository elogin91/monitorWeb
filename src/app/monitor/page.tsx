"use client";

import { useState, useEffect } from 'react';
import "./page.css";

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
    }, 3600000); // 60,000 ms = 1 minuto 3600000
  }, []);  // Solo ejecuta este efecto al montar el componente

  return (
    <div className="monitor-container">
          <div className="main-content">
            <h1 className="monitor-title">Website Monitor</h1>
            <div className="monitor-grid">
              {status.map((site, index) => (
                <div key={index} className="monitor-card">
                  <div className="mb-4">
                    <h2 className="website-title">{site.url}</h2>
                    <p className={site.status === 'Online' ? 'status-online' : 'status-offline'}>
                      Status: {site.status}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="detail-text"><strong>HTTP Code:</strong> {site.headers.statusCode}</p>
                    <p className="detail-text"><strong>Response Time:</strong> {site.responseTime}</p>
                    <p className="detail-text"><strong>Last checked:</strong> {site.lastChecked}</p>
                    {site.headers.contentType && (
                      <p className="detail-text"><strong>Content Type:</strong> {site.headers.contentType}</p>
                    )}
                  </div>
                  {site.status === 'Offline - Error de red o timeout' && (
                      <span className="error-tag">Connection error</span>
                  )}
                   {site.headers.statusCode !== '200' && (
                      <span className="error-response-tag">Response error</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
  );
};

export default Monitor;
