import { useState, useEffect } from 'react';

const WebSocketHost = 'ws://localhost:8080'; // Replace with your WebSocket server URL

function useWebSocket(onReceive) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = new WebSocket(WebSocketHost);

    newSocket.onopen = () => {
      setIsConnected(true);
      console.log("CONNECTED")
    };

    newSocket.onmessage = (event) => {
      const data = event.data;
      onReceive(data)
    };

    newSocket.onclose = () => {
      setIsConnected(false);
    };

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const sendWebSocketMessage = (message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      console.log('SENDING ' + JSON.stringify(message))
      socket.send(JSON.stringify(message));
 
    }
  };

  return { isConnected, sendWebSocketMessage };
}

export default useWebSocket;
