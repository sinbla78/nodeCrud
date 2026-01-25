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
  RoomInfo,
  EmojiPayload,
  PingPayload,
  ShapePayload,
  ShapeData,
  NoteData,
  NoteAddPayload,
  NoteMovePayload,
  NoteUpdatePayload,
  NoteDeletePayload,
  ImageData,
  ImageAddPayload,
  ImageMovePayload,
  ImageDeletePayload
} from '../types/cursor';
import { generateUserInfo } from '../../utils/colorGenerator';

interface RoomData {
  users: Map<string, CursorData>;
  chatHistory: ChatMessage[];
  drawHistory: DrawData[];
  notes: Map<string, NoteData>;
  images: Map<string, ImageData>;
  password?: string;
}

const rooms = new Map<string, RoomData>();
const MAX_CHAT_HISTORY = 50;
const MAX_DRAW_HISTORY = 500;
const DRAW_EXPIRE_MS = 10000; // 10초 후 그림 사라짐

function getOrCreateRoom(roomId: string): RoomData {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      users: new Map(),
      chatHistory: [],
      drawHistory: [],
      notes: new Map(),
      images: new Map()
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
      list.push({ id, userCount: data.users.size, hasPassword: !!data.password });
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
    const { roomId, nickname, password } = payload;

    // Check if room exists and has password
    const existingRoom = rooms.get(roomId);
    if (existingRoom && existingRoom.password) {
      if (existingRoom.password !== password) {
        socket.emit('room:join:error', { message: '비밀번호가 올바르지 않습니다.' });
        return;
      }
    }

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

    // Set password for new room if provided
    if (!existingRoom && password) {
      room.password = password;
    }

    const userInfo = generateUserInfo(socket.id, nickname);
    userData = {
      user: userInfo,
      position: { x: 0, y: 0 }
    };

    room.users.set(socket.id, userData);

    const existingUsers = getRoomUsers(roomId).filter(u => u.user.id !== socket.id);
    socket.emit('cursor:users', existingUsers);
    socket.emit('chat:history', room.chatHistory);
    socket.emit('draw:history', room.drawHistory);
    socket.emit('note:list', Array.from(room.notes.values()));
    socket.emit('image:list', Array.from(room.images.values()));
    socket.emit('room:info', { roomId, userCount: room.users.size });
    socket.emit('room:join:success');

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

    const now = Date.now();
    const drawData: DrawData = {
      id: `${socket.id}-${now}-${Math.random().toString(36).substr(2, 9)}`,
      user: userData.user,
      from: payload.from,
      to: payload.to,
      color: payload.color,
      width: payload.width,
      timestamp: now
    };

    const room = rooms.get(currentRoom);
    if (room) {
      // 만료된 그림 제거
      room.drawHistory = room.drawHistory.filter(d => now - d.timestamp < DRAW_EXPIRE_MS);
      room.drawHistory.push(drawData);
      if (room.drawHistory.length > MAX_DRAW_HISTORY) {
        room.drawHistory.shift();
      }
    }

    io.to(currentRoom).emit('draw:line', drawData);
  });

  socket.on('draw:clear', () => {
    if (!currentRoom) return;

    const room = rooms.get(currentRoom);
    if (room) {
      room.drawHistory = [];
    }

    io.to(currentRoom).emit('draw:cleared');
  });

  socket.on('draw:undo', (payload: { id: string }) => {
    if (!currentRoom) return;

    const room = rooms.get(currentRoom);
    if (room) {
      room.drawHistory = room.drawHistory.filter(d => d.id !== payload.id);
    }

    socket.to(currentRoom).emit('draw:undone', { id: payload.id });
  });

  socket.on('draw:redo', (payload: { id: string; data: any }) => {
    if (!currentRoom) return;

    socket.to(currentRoom).emit('draw:redone', payload);
  });

  socket.on('room:list', () => {
    socket.emit('room:list', getRoomList());
  });

  socket.on('emoji:send', (payload: EmojiPayload) => {
    if (!currentRoom || !userData) return;

    // 랜덤 위치에 이모지 표시
    const position = {
      x: Math.random() * 800 + 200,
      y: Math.random() * 400 + 200
    };

    socket.to(currentRoom).emit('emoji:received', {
      emoji: payload.emoji,
      position
    });
  });

  socket.on('ping:send', (payload: PingPayload) => {
    if (!currentRoom || !userData) return;

    socket.to(currentRoom).emit('ping:received', {
      position: payload.position,
      color: userData.user.color,
      name: userData.user.name
    });
  });

  socket.on('draw:shape', (payload: ShapePayload) => {
    if (!currentRoom || !userData) return;

    const now = Date.now();
    const shapeData: ShapeData = {
      id: `${socket.id}-${now}-${Math.random().toString(36).substr(2, 9)}`,
      user: userData.user,
      shape: payload.shape,
      from: payload.from,
      to: payload.to,
      color: payload.color,
      width: payload.width,
      timestamp: now
    };

    io.to(currentRoom).emit('draw:shape', shapeData);
  });

  socket.on('note:add', (payload: NoteAddPayload) => {
    if (!currentRoom || !userData) return;

    const room = rooms.get(currentRoom);
    if (!room) return;

    const noteData: NoteData = {
      id: payload.id,
      x: payload.x,
      y: payload.y,
      color: payload.color,
      content: payload.content,
      author: userData.user.name
    };

    room.notes.set(payload.id, noteData);
    io.to(currentRoom).emit('note:added', noteData);
  });

  socket.on('note:move', (payload: NoteMovePayload) => {
    if (!currentRoom) return;

    const room = rooms.get(currentRoom);
    if (!room) return;

    const note = room.notes.get(payload.id);
    if (note) {
      note.x = payload.x;
      note.y = payload.y;
      socket.to(currentRoom).emit('note:moved', { id: payload.id, x: payload.x, y: payload.y });
    }
  });

  socket.on('note:update', (payload: NoteUpdatePayload) => {
    if (!currentRoom) return;

    const room = rooms.get(currentRoom);
    if (!room) return;

    const note = room.notes.get(payload.id);
    if (note) {
      note.content = payload.content;
      socket.to(currentRoom).emit('note:updated', { id: payload.id, content: payload.content });
    }
  });

  socket.on('note:delete', (payload: NoteDeletePayload) => {
    if (!currentRoom) return;

    const room = rooms.get(currentRoom);
    if (!room) return;

    room.notes.delete(payload.id);
    io.to(currentRoom).emit('note:deleted', { id: payload.id });
  });

  socket.on('image:add', (payload: ImageAddPayload) => {
    if (!currentRoom) return;

    const room = rooms.get(currentRoom);
    if (!room) return;

    const imageData: ImageData = {
      id: payload.id,
      x: payload.x,
      y: payload.y,
      dataUrl: payload.dataUrl
    };

    room.images.set(payload.id, imageData);
    io.to(currentRoom).emit('image:added', imageData);
  });

  socket.on('image:move', (payload: ImageMovePayload) => {
    if (!currentRoom) return;

    const room = rooms.get(currentRoom);
    if (!room) return;

    const image = room.images.get(payload.id);
    if (image) {
      image.x = payload.x;
      image.y = payload.y;
      socket.to(currentRoom).emit('image:moved', { id: payload.id, x: payload.x, y: payload.y });
    }
  });

  socket.on('image:delete', (payload: ImageDeletePayload) => {
    if (!currentRoom) return;

    const room = rooms.get(currentRoom);
    if (!room) return;

    room.images.delete(payload.id);
    io.to(currentRoom).emit('image:deleted', { id: payload.id });
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
