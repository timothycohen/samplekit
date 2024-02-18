import { type Level, type LogEvent } from 'pino';

export type { LogEvent, Level };

export type FormattedLogflare = {
	message: string;
	metadata: Record<string, unknown> & { level: number; status: string };
	timestamp: number;
};

export type FormattedLogEvent = FormattedLogflare & { metadata: Record<string, unknown> & { url: string | undefined } };
export type FormattedMsg = FormattedLogflare & { metadata: Record<string, unknown> & { pid?: number; host?: string } };

export function formatLogEvent(logEvent: LogEvent): FormattedLogEvent {
	const { ts: timestamp, messages, bindings, level } = logEvent;

	const { objMessages, strMessages } = messages.reduce(
		(acc, el) => {
			if (typeof el === 'object' && el !== null) {
				const msg = el['msg'];
				if (typeof msg === 'string') {
					acc.strMessages.push(msg);
					delete el['msg'];
				}
				acc.objMessages = { ...acc.objMessages, ...el };
			} else if (typeof el === 'string') acc.strMessages.push(el);
			return acc;
		},
		{ objMessages: {}, strMessages: [] as string[] },
	);

	return {
		metadata: {
			...bindings,
			...objMessages,
			url: typeof window !== 'undefined' && typeof window.document !== 'undefined' ? window.document.URL : undefined,
			level: level.value,
			status: level.label,
		},
		message: strMessages.join(' '),
		timestamp,
	};
}

const numLevelToStatus = (level: unknown): Level => {
	if (typeof level !== 'number') return 'info';
	if (level < 20) return 'trace';
	if (level < 30) return 'debug';
	if (level < 40) return 'info';
	if (level < 50) return 'warn';
	if (level < 60) return 'error';
	return 'fatal';
};

export type ParsedMsg = {
	level: number;
	time: number;
	pid?: number;
	hostname?: string;
	msg?: string;
	base?: Record<string, unknown>;
} & Record<string, unknown>;

export const formatWriteMsg = (parsedMsg: ParsedMsg): FormattedMsg => {
	const { pid, hostname: host, level, time: _, msg: __, event_message: ___, message: ____, ...rest } = parsedMsg;
	const status = numLevelToStatus(level);
	const timestamp = typeof parsedMsg.time === 'number' ? parsedMsg.time : Date.now();
	const message = (() => {
		if (typeof parsedMsg.msg === 'string') return parsedMsg.msg;
		else if (typeof parsedMsg['event_message'] === 'string') return parsedMsg['event_message'];
		else if (typeof parsedMsg['message'] === 'string') return parsedMsg['message'];
		else return status;
	})();

	const context: { pid?: number; host?: string; level: number } = { level: 30 };
	if (typeof pid === 'number') context['pid'] = pid;
	if (typeof host === 'string') context['host'] = host;
	if (typeof level === 'number') context['level'] = level;

	return {
		metadata: { ...rest, ...context, status },
		message,
		timestamp,
	};
};
