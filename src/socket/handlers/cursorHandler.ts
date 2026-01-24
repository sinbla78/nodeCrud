import { Server, Socket } from 'socket.io';
import {
  CursorData,
  ClientToServerEvents,
  ServerToClientEvents,
  MovePayload,
  JoinPayload
} from '../types/cursor';
import { generateUserInfo } from '../../utils/colorGenerator';

const rooms = new Map<string, Map<string, CursorData>>();

function getRoomUsers(roomId: string): CursorData[] {
  const room = rooms.get(roomId);
  if (!room) return [];
  return Array.from(room.values());
}

function broadcastRoomCount(io: Server, roomId: string) {
  const count = rooms.get(roomId)?.size || 0;
  io.to(roomId).emit('room:count', count);
}

export function setupCursorHandler(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  socket: Socket<ClientToServerEvents, ServerToClientEvents>
) {
  let currentRoom: string | null = null;
  let userData: CursorData | null = null;

  socket.on('cursor:join', (payload: JoinPayload) => {
    const { roomId } = payload;
    currentRoom = roomId;

    socket.join(roomId);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Map());
    }

    const userInfo = generateUserInfo(socket.id);
    userData = {
      user: userInfo,
      position: { x: 0, y: 0 }
    };

    rooms.get(roomId)!.set(socket.id, userData);

    const existingUsers = getRoomUsers(roomId).filter(u => u.user.id !== socket.id);
    socket.emit('cursor:users', existingUsers);

    socket.to(roomId).emit('cursor:joined', userData);

    broadcastRoomCount(io, roomId);
  });

  socket.on('cursor:move', (payload: MovePayload) => {
    if (!currentRoom || !userData) return;

    userData.position = payload.position;
    rooms.get(currentRoom)?.set(socket.id, userData);

    socket.to(currentRoom).emit('cursor:moved', userData);
  });

  socket.on('disconnect', () => {
    if (currentRoom) {
      rooms.get(currentRoom)?.delete(socket.id);

      socket.to(currentRoom).emit('cursor:left', socket.id);

      broadcastRoomCount(io, currentRoom);

      if (rooms.get(currentRoom)?.size === 0) {
        rooms.delete(currentRoom);
      }
    }
  });
}
