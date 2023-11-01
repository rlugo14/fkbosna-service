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
  async handleJoinRoom(socket: Socket, roomName: string) {
    socket.join(roomName);
    this.logger.log(`socket: ${socket.id} joined room ${roomName}`);
    const socketsInRoom = await this.io.in(roomName).fetchSockets();
    this.logger.log(
      `Amount of sockets in room "${roomName}": ${socketsInRoom.length}`,
    );
  }

  @SubscribeMessage('triggerUpdateHome')
  triggerHomeUpdate(socket: Socket, roomName: string) {
    this.logger.log(
      `socket: ${socket.id} triggered updateHome for room: ${roomName}`,
    );
    this.notifySocketsInRoom(roomName);
  }

  notifySocketsInRoom(roomName: string) {
    console.log(roomName);
    this.logger.log(`emitting update signal to room: ${roomName}`);
    this.io.to(roomName).emit('updateHome');
  }
}
