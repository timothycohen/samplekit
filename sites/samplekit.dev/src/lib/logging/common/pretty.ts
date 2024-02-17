import pinoPretty, { type PrettyOptions } from 'pino-pretty';

export const createPinoPretty = (options?: PrettyOptions) => {
	const pretty = pinoPretty({
		destination: 1,
		translateTime: 'SYS:HH:mm:ss',
		hideObject: false,
		...options,
	});

	return {
		write: pretty.write.bind(pretty),
		stringify: ({
			metadata,
			time,
			msg,
		}: {
			time: number;
			msg?: string;
			metadata: Record<string, unknown> & {
				msg?: never;
				ts?: never;
				err?: { name: string; message: string; stack?: string };
			};
		}): string => {
			const res: Record<string, unknown> = { time, ...metadata };
			if (msg) res['msg'] = msg;
			else if (metadata.err?.message) res['msg'] = metadata.err.message;
			return JSON.stringify(res) + '\n';
		},
	};
};
