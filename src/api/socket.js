import { io } from 'socket.io-client';
import Cookies from 'js-cookie';
import { baseURL } from './client';

let socket = null;
let visibilityHandler = null;

export function connectChatSocket({ onNewMessage } = {}) {
  const token = Cookies.get('isLoggedIn');
  if (!token) return null;

  if (socket?.connected) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
    socket.removeAllListeners();
  }

  socket = io(baseURL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 30000,
    randomizationFactor: 0.5,
  });

  if (onNewMessage) {
    socket.on('new_message', onNewMessage);
  }

  visibilityHandler = () => {
    if (!socket) return;

    if (document.hidden) {
      socket.disconnect();
      return;
    }

    const freshToken = Cookies.get('isLoggedIn');
    if (!freshToken) return;

    socket.auth = { token: freshToken };
    if (!socket.connected) {
      socket.connect();
    }
  };

  document.addEventListener('visibilitychange', visibilityHandler);

  return socket;
}

export function disconnectChatSocket() {
  if (visibilityHandler) {
    document.removeEventListener('visibilitychange', visibilityHandler);
    visibilityHandler = null;
  }

  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

export function getChatSocket() {
  return socket;
}
