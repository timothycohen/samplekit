import { lookupPhoneNumber, sendSMS } from '../sms';
import type { Transports } from './types';

export const sms: Transports['sms'] = {
	send: {
		Otp: async ({ phoneNumber, otp }: { phoneNumber: string; otp: string }) =>
			sendSMS({
				phoneNumber: phoneNumber,
				body: `Your SampleKit verification code is ${otp}. It will expire in 10 minutes.`,
			}),
	},
	lookupPhoneNumber,
};
