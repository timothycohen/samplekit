import type { ClientEvents, ServerEvents } from '../common/events';
import type { Server, Socket } from 'socket.io';

export type SocketData = { seshUser: { userId: string; sessionId: string } | null };
export type ServerClusterEvent = never;
export type ServerSocket = Socket<ClientEvents, ServerEvents, ServerClusterEvent, SocketData>;
export declare class IoServer extends Server<ClientEvents, ServerEvents, ServerClusterEvent, SocketData> {}
