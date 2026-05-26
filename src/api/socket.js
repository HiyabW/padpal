import { io } from 'socket.io-client';
import { baseURL } from './client';

let socket = null;
let isConnecting = false;
let handlers = {
  onNewMessage: null,
  onMatchCreated: null,
};

function bindSocketEvents() {
  if (!socket) return;

  socket.off('new_message');
  socket.off('match_created');

  if (handlers.onNewMessage) {
    socket.on('new_message', handlers.onNewMessage);
  }

  if (handlers.onMatchCreated) {
    socket.on('match_created', handlers.onMatchCreated);
  }
}

export function ensureChatSocketConnected() {
  if (socket) {
    if (!socket.connected && !isConnecting) {
      isConnecting = true;
      socket.connect();
    }
    bindSocketEvents();
    return socket;
  }

  isConnecting = true;
  socket = io(baseURL, {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 30000,
    randomizationFactor: 0.5,
  });

  socket.on('connect', () => {
    isConnecting = false;
  });

  socket.on('disconnect', () => {
    isConnecting = false;
  });

  socket.on('connect_error', () => {
    isConnecting = false;
  });

  bindSocketEvents();
  return socket;
}

export function setChatSocketHandlers({ onNewMessage, onMatchCreated } = {}) {
  handlers.onNewMessage = onNewMessage || null;
  handlers.onMatchCreated = onMatchCreated || null;
  bindSocketEvents();
}

export function clearChatSocketHandlers() {
  handlers.onNewMessage = null;
  handlers.onMatchCreated = null;

  if (socket) {
    socket.off('new_message');
    socket.off('match_created');
  }
}

export function updateChatSocketAuth() {
  if (!socket) return;
  if (!socket.connected && !isConnecting) {
    socket.connect();
  }
}

export function destroyChatSocket() {
  clearChatSocketHandlers();

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  isConnecting = false;
}

export function getChatSocket() {
  return socket;
}
