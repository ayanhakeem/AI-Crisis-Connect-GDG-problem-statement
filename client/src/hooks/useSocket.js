import { useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';

/**
 * Subscribe to a socket event and call the handler
 * Automatically unsubscribes on unmount
 */
const useSocketEvent = (event, handler) => {
  const { socket } = useSocket();

  useEffect(() => {
    const sock = socket.current;
    if (!sock) return;

    sock.on(event, handler);
    return () => sock.off(event, handler);
  }, [socket, event, handler]);
};

export default useSocketEvent;
