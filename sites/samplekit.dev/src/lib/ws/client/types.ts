import type { ClientEvents, ServerEvents } from '../common/events';
import type { Socket } from 'socket.io-client';

export type ClientSocket = Socket<ServerEvents, ClientEvents>;
