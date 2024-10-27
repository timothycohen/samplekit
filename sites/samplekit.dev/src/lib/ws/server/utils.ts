import { httpCodeMap } from '$lib/http/common';
import { getIo } from './init';
import type { ServerEventName } from '../common/events';

export function wsFail(
	eventName: ServerEventName,
	socketId: string,
	status: 400 | 401 | 403 | 404 | 429 | 500,
): boolean;
export function wsFail(eventName: ServerEventName, socketId: string, status: number, message: string): boolean;
export function wsFail(eventName: ServerEventName, socketId: string, status: number, message?: string): boolean {
	let e: { error: App.JSONError };
	if (message) e = { error: { message, status } };
	else e = { error: { message: httpCodeMap[status] ?? 'Unknown Error', status } };
	return getIo().to(socketId).emit(eventName, e);
}

export const bounce = (serverSocketId: string, eventName: ServerEventName) =>
	getIo()
		.to(serverSocketId)
		.emit(eventName, { error: { message: 'Unprocessable Content', status: 422 } });
