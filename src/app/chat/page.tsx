'use client';

import { useState } from 'react';

const ChatPage = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(''); // Resetea la respuesta al iniciar una nueva consulta

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      if (data.error) {
        setResponse('Error al obtener respuesta');
      } else {
        setResponse(data.choices?.[0]?.text || 'Respuesta vacía'); // Ajusta al formato de respuesta real de Aalia
      }
    } catch (error) {
      setResponse('Error en la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Chat con Aalia</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escribe tu mensaje..."
          className="border p-2 w-full mb-2"
        />
        <button type="submit" className="bg-blue-500 text-white p-2" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
      {response && (
        <div className="mt-4 bg-gray-100 p-4">
          <h2 className="font-semibold">Respuesta de Aalia:</h2>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
