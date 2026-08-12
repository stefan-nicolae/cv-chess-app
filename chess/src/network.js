import { useState, useEffect, useRef } from 'react';
const PRODUCTION = 0
const DELIVERY_TIMEOUT_MS = 5000
let commandSequence = 0

const WebSocketHost = PRODUCTION
  ? 'wss://vladolteanu.com/stfn/chess-app'
  : `ws://${window.location.hostname}:8080`;

function createCommandId() {
  if(typeof window.crypto?.randomUUID === "function") {
    try {
      return window.crypto.randomUUID()
    } catch {
      // randomUUID can be blocked on non-secure LAN origins.
    }
  }

  commandSequence += 1
  return [
    Date.now().toString(36),
    commandSequence.toString(36),
    Math.random().toString(36).slice(2)
  ].join("-")
}

function useWebSocket(onReceive) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const pendingCommands = useRef(new Map());

  useEffect(() => {
      const newSocket = new WebSocket(WebSocketHost);
    
      newSocket.onopen = () => {
        setIsConnected(true);
        // console.log("CONNECTED")
      };
    
      newSocket.onmessage = (event) => {
        const data = event.data;
        const message = JSON.parse(data);
        const pendingCommand = message.commandId
          ? pendingCommands.current.get(message.commandId)
          : undefined;

        if(pendingCommand && message.response === "commandDelivered") {
          clearTimeout(pendingCommand.timeout);
          pendingCommands.current.delete(message.commandId);
          pendingCommand.resolve();
          return;
        }

        if(
          pendingCommand &&
          (message.response === "commandDeliveryFailed" ||
            message.response === "rateLimitError")
        ) {
          clearTimeout(pendingCommand.timeout);
          pendingCommands.current.delete(message.commandId);
          pendingCommand.reject(new Error(message.error));
          return;
        }

        // console.log("received" + data)
        onReceive(data)
      };
    
      newSocket.onclose = () => {
        setIsConnected(false);
        pendingCommands.current.forEach(({ reject, timeout }) => {
          clearTimeout(timeout);
          reject(new Error("The WebSocket connection closed before delivery."));
        });
        pendingCommands.current.clear();
      };
    
      setSocket(newSocket);
    
      return () => {
        newSocket.close();
      };
  }, []);

  const sendWebSocketMessage = (message, waitForDelivery = false) => {
    if(!socket || socket.readyState !== WebSocket.OPEN) {
      return waitForDelivery
        ? Promise.reject(new Error("The WebSocket is not connected."))
        : undefined;
    }

    if(!waitForDelivery) {
      socket.send(JSON.stringify(message));
      return;
    }

    const commandId = createCommandId();
    const command = { ...message, commandId };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        pendingCommands.current.delete(commandId);
        reject(new Error("Timed out waiting for command delivery."));
      }, DELIVERY_TIMEOUT_MS);

      pendingCommands.current.set(commandId, { resolve, reject, timeout });
      socket.send(JSON.stringify(command));
    });
  };

  return { isConnected, sendWebSocketMessage };
}

export default useWebSocket;
