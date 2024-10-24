import twilio, { type Twilio } from 'twilio';
import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_NUMBER } from '$env/static/private';
import { logger } from '$lib/logging/server';
import type { SendSMS } from './types';

export const getTwilio = (() => {
	let twilioClient: Twilio | null = null;
	let disabled = false;

	const get = () => {
		if (twilioClient) return twilioClient;
		if (disabled) return;

		try {
			twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
			return twilioClient;
		} catch {
			disabled = true;
			return;
		}
	};

	return get;
})();

export const sendTwilioSMS: SendSMS = async ({ phoneNumber, body }) => {
	try {
		const twilio = getTwilio();
		if (!twilio) return { transportErr: true };
		await twilio.messages.create({ body, from: TWILIO_NUMBER, to: phoneNumber });
		return { transportErr: false };
	} catch (err) {
		logger.error(err);
		return { transportErr: true };
	}
};

export const lookupPhoneNumber = async (phoneNumber: string): Promise<string | null> =>
	(await getTwilio()
		?.lookups.v2.phoneNumbers(phoneNumber)
		.fetch()
		.then((res) => {
			if (res.valid) return res.phoneNumber;
			return null;
		})
		.catch(() => null)) ?? null;
