import { default as WebSocketBase, type MessageEvent } from 'ws';
import { getWebSocketServer } from '../../../../scripts/ws/utils';
import { SocketManager } from './connections';

export type WSCtx = {
	socketId: string;
} & ({ userId: null; sessionId: null } | { userId: string; sessionId: string });

export declare class WS extends WebSocketBase {
	ctx: WSCtx;
}

export interface WSS extends WebSocketBase.Server<typeof WS> {
	connections: SocketManager;
}

export type { MessageEvent };

export const getWss = getWebSocketServer as () => WSS;
