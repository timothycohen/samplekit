export type Action =
	| `/login?/loginWithPassword`
	| `/login?/emailPassReset`
	| `/signup?/signupWithPassword`
	| `/account/delete?/deleteUserWithSeshConf`
	| `/account/security/auth?/updatePassFromCurrPass`
	| `/account/verify?/seshConfFromPassword&next=${string}`
	| `/account/verify?/seshConfFromSMS&next=${string}`
	| `/account/verify?/seshConfFromAuthenticator&next=${string}`
	| `/account/verify/email?/sendSeshConfToken&next=${string}`
	| `/change-to-google?/passwordToLinkGoogle`
	| `/change-to-password?/changeToEmailPassProvider`
	| `/signup/email-verification?/resendSignupEmailVerification`
	| `/oauth/google/send-to-oauth.json`
	| `/login/verify-mfa?/loginWithSMS`
	| `/login/verify-mfa?/loginWithAuthenticator`
	| `/logout?/logoutCurrent`
	| `/logout?/logoutSingle`
	| `/logout?/logoutAll`
	| `/mfa/sms?/sendSMSVeri`
	| `/mfa/update/register/authenticator?/registerMFA_Authenticator_WithSeshConf`
	| `/mfa/update/register/sms?/SMSSetupFromSeshConf&phone=${string}`
	| `/mfa/update/register/sms?/registerMFA_SMS_WithSeshConfAndSetupSMS`
	| `/mfa/update/remove/${DB.MFAs.Kind}?/removeMFAWithSeshConf`
	| `/password-update/${string}?/createNewPassFromPwReset`
	| `/account/profile?/updateName`
	| '/shop/collections/all';

export const actionsMap = {
	loginWithPassword: '/login?/loginWithPassword',
	emailPassReset: '/login?/emailPassReset',
	loginWithSMS: '/login/verify-mfa?/loginWithSMS',
	loginWithAuthenticator: '/login/verify-mfa?/loginWithAuthenticator',
	passToGoogleOAuth: '/oauth/google/send-to-oauth.json',
	signupWithPassword: '/signup?/signupWithPassword',
	resendSignupEmailVerification: '/signup/email-verification?/resendSignupEmailVerification',
	deleteUserWithSeshConf: '/account/delete?/deleteUserWithSeshConf',
	updatePassFromCurrPass: '/account/security/auth?/updatePassFromCurrPass',
	sendSeshConfToken: (next: string) => `/account/verify/email?/sendSeshConfToken&next=${next}`,
	passwordToLinkGoogle: '/change-to-google?/passwordToLinkGoogle',
	changeToEmailPassProvider: '/change-to-password?/changeToEmailPassProvider',
	sendSMSVeri: '/mfa/sms?/sendSMSVeri',
	registerMFA_Authenticator_WithSeshConf: '/mfa/update/register/authenticator?/registerMFA_Authenticator_WithSeshConf',
	removeMFAWithSeshConf: (mfaKind: DB.MFAs.Kind) => `/mfa/update/remove/${mfaKind}?/removeMFAWithSeshConf`,
	createNewPassFromPwReset: (token: string) => `/password-update/${token}?/createNewPassFromPwReset`,
	updateName: '/account/profile?/updateName',
	seshConfFromPassword: (next: string) => `/account/verify?/seshConfFromPassword&next=${next}`,
	seshConfFromSMS: (next: string) => `/account/verify?/seshConfFromSMS&next=${next}`,
	seshConfFromAuthenticator: (next: string) => `/account/verify?/seshConfFromAuthenticator&next=${next}`,
	logoutCurrent: '/logout?/logoutCurrent',
	logoutSingle: '/logout?/logoutSingle',
	logoutAll: '/logout?/logoutAll',
	SMSSetupFromSeshConf: (phone: string) => `/mfa/update/register/sms?/SMSSetupFromSeshConf&phone=${phone}`,
	registerMFA_SMS_WithSeshConfAndSetupSMS: '/mfa/update/register/sms?/registerMFA_SMS_WithSeshConfAndSetupSMS',
} as const satisfies Record<string, Action | ((a: DB.MFAs.Kind) => Action)>;
