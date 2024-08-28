export const mfaKinds = ['authenticator', 'passkeys', 'sms'] as const;
export const mfaLabels: Record<DB.MFAs.Kind, string> = {
	sms: 'SMS',
	passkeys: 'Passkey / Biometric',
	authenticator: 'Authenticator App',
};
