import { httpCodeMap } from '$lib/http/common';
import { getIo, type ServerSocket } from './init';
import type { EventName } from '../client/events';

export function wsFail(eventName: EventName, socketId: string, status: 400 | 401 | 403 | 404 | 429 | 500): boolean;
export function wsFail(eventName: EventName, socketId: string, status: number, message: string): boolean;
export function wsFail(eventName: EventName, socketId: string, status: number, message?: string): boolean {
	let e: { error: App.JSONError };
	if (message) e = { error: { message, status } };
	else e = { error: { message: httpCodeMap[status] ?? 'Unknown Error', status } };
	return getIo().to(socketId).emit(eventName, e);
}

export const bounce = (ws: ServerSocket, eventName: EventName) =>
	getIo()
		.to(ws.id)
		.emit(eventName, { error: { message: 'Unprocessable Content', status: 422 } });
