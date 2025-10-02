import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  if (socket) return socket;
  const token = localStorage.getItem('token');
  if (!token) return null;
  socket = io(process.env.REACT_APP_API_URL?.replace('/api','') || 'http://localhost:5000', {
    auth: { token },
    autoConnect: true,
    transports: ['websocket']
  });
  return socket;
}

export function joinTripRoom(tripId) {
  const s = getSocket();
  if (!s) return;
  s.emit('trip:join', String(tripId));
}

export function leaveTripRoom(tripId) {
  if (!socket) return;
  socket.emit('trip:leave', String(tripId));
}
