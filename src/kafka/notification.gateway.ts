import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(5003, { cors: '*' })
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private users: { userId: string; socketId: string }[] = [];

  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    console.log('New user connected.', client.id);
  }

  @SubscribeMessage('addUser')
  addUser(@ConnectedSocket() client: Socket, @MessageBody() userId: string) {
    const isUserExist = this.users.find((user) => user.userId === userId);
    if (!isUserExist) {
      const user = { userId, socketId: client.id };
      console.log(`new user ${userId} with ${client.id} just connected.+`);
      this.users.push(user);
      this.server.emit('getUsers', this.users);
    }
  }

  @SubscribeMessage('newNotification')
  sendNewNotification(@MessageBody() message: any) {
    const { userId } = message;
    const isUserExist = this.users.find((user) => user.userId === userId);
    if (!isUserExist || !isUserExist.socketId) {
      console.warn(`User ${message.userId} not found or not connected.`);
      return;
    }
    this.server.to(isUserExist.socketId).emit('notification', message);
  }

  handleDisconnect(client: Socket) {
    console.log('User disconnected.', client.id);
    this.users = this.users.filter((user) => user.socketId !== client.id);
    this.server.emit('getUsers', this.users);
  }
}
