import type { SendSMS } from './types';

export const consoleLogSMS: SendSMS = async ({ phoneNumber, body }) => {
	// eslint-disable-next-line no-console
	console.info(`
		From: Console
		To: ${phoneNumber}
		Body: ${body}
		`);
	return { transportErr: false };
};
