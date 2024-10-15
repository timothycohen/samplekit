import { sendEmail } from './email';
import { sms } from './sms';
import type { Transports } from './types';

export const transports: Transports = {
	sendEmail,
	sms,
};
