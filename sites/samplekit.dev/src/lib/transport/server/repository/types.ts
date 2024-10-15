export interface Transports {
	email: {
		send: {
			emailVeriToken: (a: { email: string; token: string }) => Promise<{ transportErr: boolean }>;
			passwordResetToken: (a: { email: string; token: string }) => Promise<{ transportErr: boolean }>;
			seshConfToken: (a: { email: string; token: string; redirectPath: string }) => Promise<{ transportErr: boolean }>;
			passwordResetNoAccount: ({ email }: { email: string }) => Promise<{ transportErr: boolean }>;
			passwordResetNotPassProvider: ({ email }: { email: string }) => Promise<{ transportErr: boolean }>;
			passwordChanged: ({ email }: { email: string }) => Promise<{ transportErr: boolean }>;
			providerMethodChanged: (a: { email: string; newProvider: DB.Provider.Id }) => Promise<{ transportErr: boolean }>;
			MFAChanged: (a: {
				email: string;
				mfaLabel: string;
				editKind: 'added' | 'removed';
			}) => Promise<{ transportErr: boolean }>;
			accountDeleted: ({ email }: { email: string }) => Promise<{ transportErr: boolean }>;
		};
	};
	sms: {
		send: { Otp: ({ phoneNumber, otp }: { phoneNumber: string; otp: string }) => Promise<{ transportErr: boolean }> };
		lookupPhoneNumber: (phoneNumber: string) => Promise<string | null>;
	};
}
