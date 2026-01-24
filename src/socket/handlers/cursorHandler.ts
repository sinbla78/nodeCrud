import { Server, Socket } from 'socket.io';
import {
  CursorData,
  ClientToServerEvents,
  ServerToClientEvents,
  MovePayload,
  JoinPayload,
  ClickPayload,
  ChatPayload,
  ChatMessage,
  DrawPayload,
  DrawData,
  RoomInfo
} from '../types/cursor';
import { generateUserInfo } from '../../utils/colorGenerator';

interface RoomData {
  users: Map<string, CursorData>;
  chatHistory: ChatMessage[];
  drawHistory: DrawData[];
}

const rooms = new Map<string, RoomData>();
const MAX_CHAT_HISTORY = 50;
const MAX_DRAW_HISTORY = 500;

function getOrCreateRoom(roomId: string): RoomData {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      users: new Map(),
      chatHistory: [],
      drawHistory: []
    });
  }
  return rooms.get(roomId)!;
}

function getRoomUsers(roomId: string): CursorData[] {
  const room = rooms.get(roomId);
  if (!room) return [];
  return Array.from(room.users.values());
}

function broadcastRoomCount(io: Server, roomId: string) {
  const room = rooms.get(roomId);
  const count = room?.users.size || 0;
  io.to(roomId).emit('room:count', count);
}

function getRoomList(): RoomInfo[] {
  const list: RoomInfo[] = [];
  rooms.forEach((data, id) => {
    if (data.users.size > 0) {
      list.push({ id, userCount: data.users.size });
    }
  });
  return list;
}

export function setupCursorHandler(
  io: Server<ClientToServerEvents, ServerToClientEvents>,
  socket: Socket<ClientToServerEvents, ServerToClientEvents>
) {
  let currentRoom: string | null = null;
  let userData: CursorData | null = null;

  socket.on('cursor:join', (payload: JoinPayload) => {
    const { roomId } = payload;

    if (currentRoom) {
      socket.leave(currentRoom);
      const oldRoom = rooms.get(currentRoom);
      if (oldRoom) {
        oldRoom.users.delete(socket.id);
        socket.to(currentRoom).emit('cursor:left', socket.id);
        broadcastRoomCount(io, currentRoom);
      }
    }

    currentRoom = roomId;
    socket.join(roomId);

    const room = getOrCreateRoom(roomId);
    const userInfo = generateUserInfo(socket.id);
    userData = {
      user: userInfo,
      position: { x: 0, y: 0 }
    };

    room.users.set(socket.id, userData);

    const existingUsers = getRoomUsers(roomId).filter(u => u.user.id !== socket.id);
    socket.emit('cursor:users', existingUsers);
    socket.emit('chat:history', room.chatHistory);
    socket.emit('draw:history', room.drawHistory);
    socket.emit('room:info', { roomId, userCount: room.users.size });

    socket.to(roomId).emit('cursor:joined', userData);
    broadcastRoomCount(io, roomId);
  });

  socket.on('cursor:move', (payload: MovePayload) => {
    if (!currentRoom || !userData) return;

    userData.position = payload.position;
    const room = rooms.get(currentRoom);
    if (room) {
      room.users.set(socket.id, userData);
    }

    socket.to(currentRoom).emit('cursor:moved', userData);
  });

  socket.on('cursor:click', (payload: ClickPayload) => {
    if (!currentRoom || !userData) return;

    socket.to(currentRoom).emit('cursor:clicked', {
      userId: socket.id,
      position: payload.position,
      color: userData.user.color
    });
  });

  socket.on('chat:send', (payload: ChatPayload) => {
    if (!currentRoom || !userData) return;

    const message: ChatMessage = {
      user: userData.user,
      message: payload.message.slice(0, 500),
      timestamp: Date.now()
    };

    const room = rooms.get(currentRoom);
    if (room) {
      room.chatHistory.push(message);
      if (room.chatHistory.length > MAX_CHAT_HISTORY) {
        room.chatHistory.shift();
      }
    }

    io.to(currentRoom).emit('chat:message', message);
  });

  socket.on('draw:line', (payload: DrawPayload) => {
    if (!currentRoom || !userData) return;

    const drawData: DrawData = {
      user: userData.user,
      from: payload.from,
      to: payload.to,
      color: payload.color,
      width: payload.width
    };

    const room = rooms.get(currentRoom);
    if (room) {
      room.drawHistory.push(drawData);
      if (room.drawHistory.length > MAX_DRAW_HISTORY) {
        room.drawHistory.shift();
      }
    }

    socket.to(currentRoom).emit('draw:line', drawData);
  });

  socket.on('draw:clear', () => {
    if (!currentRoom) return;

    const room = rooms.get(currentRoom);
    if (room) {
      room.drawHistory = [];
    }

    io.to(currentRoom).emit('draw:cleared');
  });

  socket.on('room:list', () => {
    socket.emit('room:list', getRoomList());
  });

  socket.on('disconnect', () => {
    if (currentRoom) {
      const room = rooms.get(currentRoom);
      if (room) {
        room.users.delete(socket.id);
        socket.to(currentRoom).emit('cursor:left', socket.id);
        broadcastRoomCount(io, currentRoom);

        if (room.users.size === 0) {
          rooms.delete(currentRoom);
        }
      }
    }
  });
}
