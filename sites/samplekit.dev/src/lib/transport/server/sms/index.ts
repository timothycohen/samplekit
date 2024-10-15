import { INTERCEPT_TRANSPORTS } from '../consts';
import { consoleLogSMS } from './console';
import { sendTwilioSMS, lookupPhoneNumber } from './twilio';
import type { SendSMS } from './types';

export const sendSMS: SendSMS = async (props) => {
	if (INTERCEPT_TRANSPORTS) return consoleLogSMS(props);
	return await sendTwilioSMS(props);
};

export { lookupPhoneNumber };
