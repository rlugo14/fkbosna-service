import { Logger } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';

@WebSocketGateway({ namespace: 'colors', cors: true })
export class ColorsGateway {
  private readonly logger = new Logger(ColorsGateway.name);
  @WebSocketServer() io: Namespace;

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(socket: Socket, tenantSlug: string) {
    socket.join(tenantSlug);
    this.logger.log(`${socket.id} joined room ${tenantSlug}`);
    const socketsInRoom = await this.io.in(tenantSlug).fetchSockets();
    this.logger.log(
      `Amount of sockets in room "${tenantSlug}": ${socketsInRoom.length}`,
    );
  }

  notifySocketsInRoom(roomName: string) {
    this.logger.log(`emitting update signal to room: ${roomName}`);
    this.io.to(roomName).emit('updateHome');
  }
}
