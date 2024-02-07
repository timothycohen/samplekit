import { lookupPhoneNumber } from '$lib/transport/server';
import {
	sendChangedProviderMethodEmail,
	sendDeleteUserEmail,
	sendEmailVeriToSeshConfEmail,
	sendMFAUpdateEmail,
	sendNoResetWithGoogleEmail,
	sendPasswordChangedEmail,
	sendPasswordResetEmail,
	sendPasswordResetEmailNotFound,
	sendVerificationEmail,
} from './email';
import { sendOtpSMS } from './sms';

export const transports = {
	sendEmail: {
		verification: sendVerificationEmail,
		veriToSeshConfEmail: sendEmailVeriToSeshConfEmail,
		passwordReset: sendPasswordResetEmail,
		passwordChanged: sendPasswordChangedEmail,
		MFAUpdate: sendMFAUpdateEmail,
		noResetWithGoogle: sendNoResetWithGoogleEmail,
		passwordResetNotFound: sendPasswordResetEmailNotFound,
		changedProviderMethod: sendChangedProviderMethodEmail,
		delete: sendDeleteUserEmail,
	},
	sms: {
		send: {
			Otp: sendOtpSMS,
		},
		lookupPhoneNumber,
	},
};
