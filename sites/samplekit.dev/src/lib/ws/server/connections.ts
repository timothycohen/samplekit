import type { WSCtx } from './utils';

export class SocketManager {
	private sockets: { [socketId: string]: null | { userId: string; sessionId: string } } = {};

	public addCtx(ctx: WSCtx): void {
		if (ctx.sessionId && ctx.userId) this.sockets[ctx.socketId] = ctx;
		else this.sockets[ctx.socketId] = null;
	}

	public removeSocket(socketId: string): void {
		delete this.sockets[socketId];
	}

	public getCtx(socketId: string): null | { userId: string; sessionId: string } {
		return this.sockets[socketId] || null;
	}

	public getSocketIdsByUserId(userId: string): string[] {
		return Object.entries(this.sockets)
			.filter(([, user]) => user?.userId === userId)
			.map(([socketId]) => socketId);
	}

	public getSocketIdsBySessionId(sessionId: string): string[] {
		return Object.entries(this.sockets)
			.filter(([, user]) => user?.sessionId === sessionId)
			.map(([socketId]) => socketId);
	}

	get size(): number {
		return Object.keys(this.sockets).length;
	}
}
