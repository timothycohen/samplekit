import { INTERCEPT_TRANSPORTS } from '../consts';
import { consoleLogEmail } from './console';
import { sendSESEmail } from './ses';
import type { SendEmail } from './types';

export const sendEmail: SendEmail = async (props) => {
	if (INTERCEPT_TRANSPORTS) return consoleLogEmail(props);
	return await sendSESEmail(props);
};
