export interface CursorPosition {
  x: number;
  y: number;
}

export interface UserInfo {
  id: string;
  name: string;
  color: string;
}

export interface CursorData {
  user: UserInfo;
  position: CursorPosition;
}

export interface RoomState {
  users: Map<string, CursorData>;
}

export interface JoinPayload {
  roomId: string;
  nickname?: string;
}

export interface MovePayload {
  position: CursorPosition;
}

export interface ClickPayload {
  position: CursorPosition;
}

export interface ChatPayload {
  message: string;
}

export interface ChatMessage {
  user: UserInfo;
  message: string;
  timestamp: number;
}

export interface DrawPayload {
  from: CursorPosition;
  to: CursorPosition;
  color: string;
  width: number;
}

export interface DrawData {
  id: string;
  user: UserInfo;
  from: CursorPosition;
  to: CursorPosition;
  color: string;
  width: number;
  timestamp: number;
}

export interface ClearCanvasPayload {
  roomId: string;
}

export interface RoomInfo {
  id: string;
  userCount: number;
}

export interface EmojiPayload {
  emoji: string;
}

export interface PingPayload {
  position: CursorPosition;
}

export interface ShapePayload {
  shape: string;
  from: CursorPosition;
  to: CursorPosition;
  color: string;
  width: number;
}

export interface ShapeData {
  id: string;
  user: UserInfo;
  shape: string;
  from: CursorPosition;
  to: CursorPosition;
  color: string;
  width: number;
  timestamp: number;
}

export interface NoteData {
  id: string;
  x: number;
  y: number;
  color: string;
  content: string;
  author: string;
}

export interface NoteAddPayload {
  id: string;
  x: number;
  y: number;
  color: string;
  content: string;
}

export interface NoteMovePayload {
  id: string;
  x: number;
  y: number;
}

export interface NoteUpdatePayload {
  id: string;
  content: string;
}

export interface NoteDeletePayload {
  id: string;
}

export interface ServerToClientEvents {
  'cursor:joined': (data: CursorData) => void;
  'cursor:moved': (data: CursorData) => void;
  'cursor:left': (userId: string) => void;
  'cursor:users': (users: CursorData[]) => void;
  'cursor:clicked': (data: { userId: string; position: CursorPosition; color: string }) => void;
  'room:count': (count: number) => void;
  'room:info': (info: { roomId: string; userCount: number }) => void;
  'room:list': (rooms: RoomInfo[]) => void;
  'chat:message': (data: ChatMessage) => void;
  'chat:history': (messages: ChatMessage[]) => void;
  'draw:line': (data: DrawData) => void;
  'draw:history': (lines: DrawData[]) => void;
  'draw:cleared': () => void;
  'emoji:received': (data: { emoji: string; position: CursorPosition }) => void;
  'ping:received': (data: { position: CursorPosition; color: string; name: string }) => void;
  'draw:shape': (data: ShapeData) => void;
  'note:added': (data: NoteData) => void;
  'note:moved': (data: { id: string; x: number; y: number }) => void;
  'note:updated': (data: { id: string; content: string }) => void;
  'note:deleted': (data: { id: string }) => void;
  'note:list': (notes: NoteData[]) => void;
}

export interface ClientToServerEvents {
  'cursor:join': (payload: JoinPayload) => void;
  'cursor:move': (payload: MovePayload) => void;
  'cursor:click': (payload: ClickPayload) => void;
  'chat:send': (payload: ChatPayload) => void;
  'draw:line': (payload: DrawPayload) => void;
  'draw:clear': () => void;
  'room:list': () => void;
  'emoji:send': (payload: EmojiPayload) => void;
  'ping:send': (payload: PingPayload) => void;
  'draw:shape': (payload: ShapePayload) => void;
  'note:add': (payload: NoteAddPayload) => void;
  'note:move': (payload: NoteMovePayload) => void;
  'note:update': (payload: NoteUpdatePayload) => void;
  'note:delete': (payload: NoteDeletePayload) => void;
}
