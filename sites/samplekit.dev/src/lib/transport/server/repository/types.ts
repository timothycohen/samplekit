export interface Transports {
	sendEmail: {
		verification: (a: { email: string; token: string }) => Promise<{ transportErr: boolean }>;
		veriToSeshConfEmail: (a: {
			email: string;
			token: string;
			redirectPath: string;
		}) => Promise<{ transportErr: boolean }>;
		passwordReset: (a: { email: string; token: string }) => Promise<{ transportErr: boolean }>;
		passwordChanged: ({ email }: { email: string }) => Promise<{ transportErr: boolean }>;
		MFAUpdate: (a: {
			email: string;
			mfaLabel: string;
			editKind: 'added' | 'removed';
		}) => Promise<{ transportErr: boolean }>;
		noResetWithGoogle: ({ email }: { email: string }) => Promise<{ transportErr: boolean }>;
		passwordResetNotFound: ({ email }: { email: string }) => Promise<{ transportErr: boolean }>;
		changedProviderMethod: (a: { email: string; newProvider: DB.Provider.Id }) => Promise<{ transportErr: boolean }>;
		delete: ({ email }: { email: string }) => Promise<{ transportErr: boolean }>;
	};
	sms: {
		send: { Otp: ({ phoneNumber, otp }: { phoneNumber: string; otp: string }) => Promise<{ transportErr: boolean }> };
		lookupPhoneNumber: (phoneNumber: string) => Promise<string | null>;
	};
}
