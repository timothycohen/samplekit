import { sendSms } from '$lib/transport/server';

export const sendOtpSMS = async ({ phoneNumber, otp }: { phoneNumber: string; otp: string }) =>
	sendSms({
		phoneNumber: phoneNumber,
		body: `Your SampleKit verification code is ${otp}. It will expire in 10 minutes.`,
	});
