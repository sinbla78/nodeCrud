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
}

export interface MovePayload {
  position: CursorPosition;
}

export interface ServerToClientEvents {
  'cursor:joined': (data: CursorData) => void;
  'cursor:moved': (data: CursorData) => void;
  'cursor:left': (userId: string) => void;
  'cursor:users': (users: CursorData[]) => void;
  'room:count': (count: number) => void;
}

export interface ClientToServerEvents {
  'cursor:join': (payload: JoinPayload) => void;
  'cursor:move': (payload: MovePayload) => void;
}
