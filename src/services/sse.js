import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function useSSE() {
  const { user } = useAuth();
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const [isConnected, setIsConnected] = useState(false);

  const connect = () => {
    if (!user?.id) return;

    if (eventSourceRef.current) return;

    // En production utiliser l'URL relative /api ; en dev, pointer vers l'API locale.
    const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:4000/api');
    const url = `${apiUrl}/events`;

    try {
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        reconnectAttempts.current = 0;
        setIsConnected(true);
      };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'account_verified':
            window.dispatchEvent(new CustomEvent('accountVerified', { detail: data.data }));
            break;
          case 'iban_assigned':
            window.dispatchEvent(new CustomEvent('ibanAssigned', { detail: data.data }));
            break;
          case 'status_changed':
            window.dispatchEvent(new CustomEvent('statusChanged', { detail: data.data }));
            break;
          case 'withdrawal_step_completed':
            window.dispatchEvent(new CustomEvent('withdrawalStepCompleted', { detail: data.data }));
            break;
        }
      } catch (error) {
        console.error('Erreur parsing SSE:', error);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);

      // Fermer l'EventSource en erreur et libérer la référence, sinon le garde
      // `if (eventSourceRef.current)` dans connect() bloque toute reconnexion.
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);

        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      }
    };
    } catch (error) {
      console.error('Erreur création SSE:', error);
      setIsConnected(false);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    reconnectAttempts.current = 0;
  };

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [user?.id]);

  return {
    connect,
    disconnect,
    isConnected
  };
}
