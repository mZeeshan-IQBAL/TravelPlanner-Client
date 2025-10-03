import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const { user, token } = useAuth();

  // Notification management - define before using in useEffect
  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  const addNotification = useCallback((notification) => {
    const notificationWithId = {
      ...notification,
      id: notification.id || Date.now(),
      read: false,
    };

    setNotifications(prev => [notificationWithId, ...prev].slice(0, 50)); // Keep last 50 notifications

    // Auto-remove non-critical notifications after 5 seconds
    if (notification.priority !== 'high') {
      setTimeout(() => {
        removeNotification(notificationWithId.id);
      }, 5000);
    }
  }, [removeNotification]);

  // Initialize socket connection
  useEffect(() => {
    if (user && token) {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      // Socket.IO should connect to the server origin, not the /api path
      const socketUrl = apiUrl.replace(/\/?api\/?$/i, '');

      const newSocket = io(socketUrl, {
        auth: {
          token: token,
        },
        transports: ['websocket', 'polling'],
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
        setConnected(false);
      };
    }
  }, [user, token]);

  // Set up event listeners
  useEffect(() => {
    if (!socket) return;

    // Generic notification handler
    socket.on('notification', (notification) => {
      console.log('Received notification:', notification);
      addNotification(notification);
    });

    // Trip collaboration events
    socket.on('trip:updated', (data) => {
      console.log('Trip updated:', data);
      addNotification({
        id: Date.now(),
        type: 'trip_update',
        title: 'Trip Updated',
        message: `${data.updatedBy?.username || 'Someone'} updated "${data.trip?.title || 'a trip'}"`,
        timestamp: new Date(),
        data: data,
      });
    });

    socket.on('trip:member_joined', (data) => {
      console.log('Trip member joined:', data);
      addNotification({
        id: Date.now(),
        type: 'member_joined',
        title: 'New Trip Member',
        message: `${data.user?.username || 'Someone'} joined "${data.trip?.title || 'a trip'}"`,
        timestamp: new Date(),
        data: data,
      });
    });

    socket.on('trip:comment_added', (data) => {
      console.log('Trip comment added:', data);
      if (data.comment?.author?._id !== user?.id) {
        addNotification({
          id: Date.now(),
          type: 'comment',
          title: 'New Comment',
          message: `${data.comment?.author?.username || 'Someone'} commented on "${data.trip?.title || 'a trip'}"`,
          timestamp: new Date(),
          data: data,
        });
      }
    });

    // Real-time user presence
    socket.on('users:online', (userIds) => {
      setOnlineUsers(new Set(userIds));
    });

    socket.on('user:joined', (userId) => {
      setOnlineUsers(prev => new Set([...prev, userId]));
    });

    socket.on('user:left', (userId) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    // Weather alerts
    socket.on('weather:alert', (alert) => {
      console.log('Weather alert:', alert);
      addNotification({
        id: Date.now(),
        type: 'weather_alert',
        title: 'Weather Alert',
        message: alert.message,
        timestamp: new Date(),
        data: alert,
        priority: alert.severity === 'severe' ? 'high' : 'normal',
      });
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      addNotification({
        id: Date.now(),
        type: 'error',
        title: 'Connection Error',
        message: error.message || 'Something went wrong',
        timestamp: new Date(),
      });
    });

    return () => {
      socket.off('notification');
      socket.off('trip:updated');
      socket.off('trip:member_joined');
      socket.off('trip:comment_added');
      socket.off('users:online');
      socket.off('user:joined');
      socket.off('user:left');
      socket.off('weather:alert');
      socket.off('error');
    };
  }, [socket, user, addNotification]);

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Real-time collaboration methods
  const joinTripRoom = (tripId) => {
    if (socket && tripId) {
      socket.emit('trip:join', tripId);
    }
  };

  const leaveTripRoom = (tripId) => {
    if (socket && tripId) {
      socket.emit('trip:leave', tripId);
    }
  };

  const broadcastTripUpdate = (tripId, updateData) => {
    if (socket && tripId) {
      socket.emit('trip:broadcast_update', {
        tripId,
        update: updateData,
        updatedBy: user,
        timestamp: new Date(),
      });
    }
  };

  const sendTripComment = (tripId, comment) => {
    if (socket && tripId) {
      socket.emit('trip:add_comment', {
        tripId,
        comment,
        author: user,
        timestamp: new Date(),
      });
    }
  };

  // Check if user is online
  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  const value = {
    socket,
    connected,
    notifications,
    onlineUsers: Array.from(onlineUsers),
    
    // Notification methods
    addNotification,
    removeNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,
    
    // Collaboration methods
    joinTripRoom,
    leaveTripRoom,
    broadcastTripUpdate,
    sendTripComment,
    isUserOnline,
    
    // Computed values
    unreadCount: notifications.filter(n => !n.read).length,
    hasUnread: notifications.some(n => !n.read),
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;