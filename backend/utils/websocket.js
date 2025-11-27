import { Server } from 'socket.io';

let io;

export const initializeWebSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join room based on user role
    socket.on('join', (data) => {
      const { userId, role } = data;
      socket.join(`user:${userId}`);
      socket.join(`role:${role}`);
      console.log(`User ${userId} joined as ${role}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

// Notification helpers
export const notifyUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

export const notifyRole = (role, event, data) => {
  if (io) {
    io.to(`role:${role}`).emit(event, data);
  }
};

export const notifyAll = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

export const notifyComplaintUpdate = (complaint, action) => {
  if (io) {
    // Notify the complaint reporter
    notifyUser(complaint.reportedBy, 'complaint:update', {
      complaintId: complaint._id,
      action,
      status: complaint.status,
      title: complaint.title
    });

    // Notify all admins and officers
    notifyRole('admin', 'complaint:update', {
      complaintId: complaint._id,
      action,
      status: complaint.status,
      title: complaint.title
    });

    notifyRole('officer', 'complaint:update', {
      complaintId: complaint._id,
      action,
      status: complaint.status,
      title: complaint.title
    });
  }
};

export const notifyNewComplaint = (complaint) => {
  if (io) {
    notifyRole('admin', 'complaint:new', {
      complaintId: complaint._id,
      title: complaint.title,
      category: complaint.category,
      priority: complaint.priority
    });

    notifyRole('officer', 'complaint:new', {
      complaintId: complaint._id,
      title: complaint.title,
      category: complaint.category,
      priority: complaint.priority
    });
  }
};

export default {
  initializeWebSocket,
  getIO,
  notifyUser,
  notifyRole,
  notifyAll,
  notifyComplaintUpdate,
  notifyNewComplaint
};
