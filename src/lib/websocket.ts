import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

export interface SocketUser {
  id: string;
  email: string;
  name?: string;
  githubUsername?: string;
}

export class WebSocketService {
  private io: SocketIOServer;
  private connectedUsers = new Map<string, SocketUser>();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000'],
        methods: ['GET', 'POST'],
      },
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
        
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            email: true,
            name: true,
            githubUsername: true,
          },
        });

        if (!user) {
          return next(new Error('User not found'));
        }

        socket.data.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const user = socket.data.user as SocketUser;
      this.connectedUsers.set(socket.id, user);

      console.log(`User ${user.name} connected`);

      // Join user-specific room
      socket.join(`user:${user.id}`);

      // Join general rooms
      socket.join('leaderboard');
      socket.join('activities');

      // Handle user status
      this.broadcastUserStatus(user.id, 'online');

      // Handle disconnection
      socket.on('disconnect', () => {
        this.connectedUsers.delete(socket.id);
        this.broadcastUserStatus(user.id, 'offline');
        console.log(`User ${user.name} disconnected`);
      });

      // Handle GitHub sync request
      socket.on('sync-github', async () => {
        try {
          if (!user.githubUsername) {
            socket.emit('sync-error', { message: 'No GitHub username found' });
            return;
          }

          socket.emit('sync-started');
          
          // Import GitHub service
          const { githubService } = await import('./github');
          const result = await githubService.syncUserStats(user.id, user.githubUsername);
          
          socket.emit('sync-completed', result);
          
          // Broadcast to leaderboard room
          this.io.to('leaderboard').emit('stats-updated', {
            userId: user.id,
            stats: result.contributions,
          });

          // Check for achievements
          const { gamificationService } = await import('./gamification');
          await gamificationService.checkAchievements(user.id);
          
        } catch (error: any) {
          socket.emit('sync-error', { message: error.message });
        }
      });

      // Handle activity updates
      socket.on('activity-created', (activity) => {
        this.io.to('activities').emit('new-activity', {
          ...activity,
          user: {
            id: user.id,
            name: user.name,
            avatar: user.githubUsername ? `https://github.com/${user.githubUsername}.png` : null,
          },
        });
      });

      // Handle typing indicators for chat (future feature)
      socket.on('typing-start', (data) => {
        socket.to(data.room).emit('user-typing', {
          userId: user.id,
          name: user.name,
        });
      });

      socket.on('typing-stop', (data) => {
        socket.to(data.room).emit('user-stopped-typing', {
          userId: user.id,
        });
      });
    });
  }

  // Public methods for broadcasting events
  public broadcastLeaderboardUpdate(leaderboardData: any) {
    this.io.to('leaderboard').emit('leaderboard-updated', leaderboardData);
  }

  public broadcastAchievementUnlocked(userId: string, achievement: any) {
    this.io.to(`user:${userId}`).emit('achievement-unlocked', achievement);
    this.io.to('activities').emit('achievement-broadcast', {
      userId,
      achievement,
    });
  }

  public broadcastLevelUp(userId: string, levelInfo: any) {
    this.io.to(`user:${userId}`).emit('level-up', levelInfo);
    this.io.to('activities').emit('level-up-broadcast', {
      userId,
      levelInfo,
    });
  }

  public broadcastNotification(userId: string, notification: any) {
    this.io.to(`user:${userId}`).emit('notification', notification);
  }

  public broadcastUserStatus(userId: string, status: 'online' | 'offline') {
    this.io.emit('user-status-changed', { userId, status });
  }

  public getConnectedUsers(): SocketUser[] {
    return Array.from(this.connectedUsers.values());
  }

  public getConnectedUserCount(): number {
    return this.connectedUsers.size;
  }
}

let wsService: WebSocketService | null = null;

export function initializeWebSocket(server: HTTPServer): WebSocketService {
  if (!wsService) {
    wsService = new WebSocketService(server);
  }
  return wsService;
}

export function getWebSocketService(): WebSocketService | null {
  return wsService;
}